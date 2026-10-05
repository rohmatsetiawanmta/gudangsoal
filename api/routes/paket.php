<?php
// api/routes/paket.php — browse endpoints (public)

// GET /paket/my-transactions — riwayat pembelian paket milik user yang login
if ($uri === '/paket/my-transactions' && $method === 'GET') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Login dulu']); exit; }

  $stmt = $pdo->prepare('
    SELECT t.id, t.order_id, t.amount, t.status, t.payment_type, t.paid_at, t.created_at,
           p.id AS paket_id, p.nama AS paket_nama
    FROM paket_soal_transactions t
    JOIN paket_soal p ON p.id = t.paket_id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT 50
  ');
  $stmt->execute([$authUser['id']]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /paket — list paket published
if ($uri === '/paket' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT p.id, p.nama, p.tahun, p.jenis, p.deskripsi, p.harga,
           COUNT(pi.id) as jumlah_soal
    FROM paket_soal p
    LEFT JOIN paket_soal_items pi ON pi.paket_id = p.id
    WHERE p.is_published = 1
    GROUP BY p.id
    ORDER BY p.tahun DESC, p.nama ASC
  ');
  $list = $stmt->fetchAll();

  $authUser = getAuthUser();
  if ($authUser && count($list) > 0) {
    $paketIds = array_column($list, 'id');
    $ph = implode(',', array_fill(0, count($paketIds), '?'));
    $stmt2 = $pdo->prepare("
      SELECT DISTINCT paket_id FROM paket_soal_transactions
      WHERE user_id = ? AND status = 'success' AND paket_id IN ($ph)
    ");
    $stmt2->execute(array_merge([$authUser['id']], $paketIds));
    $owned = array_flip(array_column($stmt2->fetchAll(), 'paket_id'));
    foreach ($list as &$p) $p['has_access'] = $p['harga'] == 0 || isset($owned[$p['id']]);
    unset($p);
  } else {
    foreach ($list as &$p) $p['has_access'] = $p['harga'] == 0;
    unset($p);
  }

  echo json_encode($list);
  exit;
}

// GET /paket/:id — detail paket + list soal (soal cuma dikirim kalau gratis atau sudah dibeli)
if (preg_match('#^/paket/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = $m[1];

  $stmt = $pdo->prepare('SELECT * FROM paket_soal WHERE id = ? AND is_published = 1');
  $stmt->execute([$id]);
  $paket = $stmt->fetch();
  if (!$paket) { http_response_code(404); echo json_encode(['error' => 'Paket tidak ditemukan']); exit; }

  $authUser  = getAuthUser();
  $hasAccess = ((int) $paket['harga']) === 0;
  if (!$hasAccess && $authUser) {
    $stmt = $pdo->prepare("
      SELECT id FROM paket_soal_transactions
      WHERE user_id = ? AND paket_id = ? AND status = 'success' LIMIT 1
    ");
    $stmt->execute([$authUser['id'], $id]);
    $hasAccess = (bool) $stmt->fetch();
  }
  $paket['has_access'] = $hasAccess;

  if (!$hasAccess) {
    // Belum bayar — cuma balikin metadata paket (jumlah soal) supaya halaman
    // paywall bisa tampil, isi soal & jawaban TIDAK dikirim ke client.
    $count = $pdo->prepare('SELECT COUNT(*) FROM paket_soal_items WHERE paket_id = ?');
    $count->execute([$id]);
    $paket['jumlah_soal'] = (int) $count->fetchColumn();
    echo json_encode(['paket' => $paket, 'soal' => []]);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.tipe, s.options, s.answer, s.explanation,
           s.difficulty, s.video_url, s.is_public_explanation,
           st.nama as subtopik, t.nama as topik, m.nama as mapel,
           pi.urutan
    FROM paket_soal_items pi
    JOIN soal s ON pi.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    WHERE pi.paket_id = ?
    ORDER BY pi.urutan ASC
  ');
  $stmt->execute([$id]);
  $soal = $stmt->fetchAll();

  foreach ($soal as &$s) {
    if ($s['options']) $s['options'] = json_decode($s['options'], true);
    if ($s['answer'])  $s['answer']  = json_decode($s['answer'],  true);
    $s['answered_correct'] = false;
  }
  unset($s);

  // Attach answered_correct per soal for logged-in users
  if ($authUser && count($soal) > 0) {
    $soalIds = array_column($soal, 'id');
    $placeholders = implode(',', array_fill(0, count($soalIds), '?'));
    $params = array_merge([$authUser['id']], $soalIds);
    $stmt2 = $pdo->prepare("
      SELECT soal_id FROM sessions
      WHERE user_id = ? AND soal_id IN ($placeholders) AND is_correct = 1
    ");
    $stmt2->execute($params);
    $answeredIds = array_flip(array_column($stmt2->fetchAll(), 'soal_id'));
    foreach ($soal as &$s) {
      $s['answered_correct'] = isset($answeredIds[$s['id']]);
    }
    unset($s);
  }

  echo json_encode(['paket' => $paket, 'soal' => $soal]);
  exit;
}

// POST /paket/:id/checkout — mulai transaksi pembayaran Midtrans Snap
if (preg_match('#^/paket/(\d+)/checkout$#', $uri, $m) && $method === 'POST') {
  $id = (int) $m[1];

  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Silakan masuk dulu']); exit; }

  $stmt = $pdo->prepare('SELECT * FROM paket_soal WHERE id = ? AND is_published = 1');
  $stmt->execute([$id]);
  $paket = $stmt->fetch();
  if (!$paket) { http_response_code(404); echo json_encode(['error' => 'Paket tidak ditemukan']); exit; }

  $harga = (int) $paket['harga'];
  if ($harga <= 0) { http_response_code(400); echo json_encode(['error' => 'Paket ini gratis, tidak perlu checkout']); exit; }

  // Sudah pernah beli?
  $stmt = $pdo->prepare("SELECT id FROM paket_soal_transactions WHERE user_id = ? AND paket_id = ? AND status = 'success' LIMIT 1");
  $stmt->execute([$authUser['id'], $id]);
  if ($stmt->fetch()) { http_response_code(400); echo json_encode(['error' => 'Paket ini sudah kamu beli']); exit; }

  $stmt = $pdo->prepare('SELECT name, email FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();
  if (!$user) { http_response_code(404); echo json_encode(['error' => 'User tidak ditemukan']); exit; }

  $orderId = 'PAKET-' . $id . '-' . $authUser['id'] . '-' . time();

  $insert = $pdo->prepare('
    INSERT INTO paket_soal_transactions (user_id, paket_id, order_id, amount, status)
    VALUES (?, ?, ?, ?, "pending")
  ');
  $insert->execute([$authUser['id'], $id, $orderId, $harga]);

  $nameParts = preg_split('/\s+/', trim($user['name']), 2);
  $result = midtransCreateSnapTransaction(
    $orderId,
    $harga,
    [[ 'id' => 'paket-' . $id, 'price' => $harga, 'quantity' => 1, 'name' => substr($paket['nama'], 0, 50) ]],
    [
      'first_name' => $nameParts[0] ?: 'User',
      'last_name'  => $nameParts[1] ?? '',
      'email'      => $user['email'],
    ]
  );

  if (isset($result['error'])) {
    $pdo->prepare("UPDATE paket_soal_transactions SET status = 'failed' WHERE order_id = ?")->execute([$orderId]);
    http_response_code(502);
    echo json_encode(['error' => is_array($result['error']) ? implode(' ', $result['error']) : $result['error']]);
    exit;
  }

  echo json_encode([
    'order_id'     => $orderId,
    'snap_token'   => $result['token'],
    'redirect_url' => $result['redirect_url'] ?? null,
  ]);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
