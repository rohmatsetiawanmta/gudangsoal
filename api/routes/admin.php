<?php
// api/routes/admin.php

// Cek auth + role admin
$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

$stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
$stmt->execute([$authUser['id']]);
$userRole = $stmt->fetchColumn();

if ($userRole !== 'admin') {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

// ==================
// PAKET SOAL
// ==================

// GET /admin/paket — list semua paket
if ($uri === '/admin/paket' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT p.id, p.nama, p.tahun, p.jenis, p.harga, p.is_published, p.created_at,
           COUNT(pi.id) as jumlah_soal
    FROM paket_soal p
    LEFT JOIN paket_soal_items pi ON pi.paket_id = p.id
    GROUP BY p.id
    ORDER BY p.tahun DESC, p.nama ASC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/paket — buat paket baru
if ($uri === '/admin/paket' && $method === 'POST') {
  $nama   = trim($body['nama']   ?? '');
  $tahun  = !empty($body['tahun'])  ? intval($body['tahun'])  : null;
  $jenis  = $body['jenis']  ?? 'lainnya';
  $harga  = max(0, intval($body['harga'] ?? 0));
  $deskripsi = trim($body['deskripsi'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'Nama wajib diisi']); exit; }
  $stmt = $pdo->prepare('INSERT INTO paket_soal (nama, tahun, jenis, harga, deskripsi) VALUES (?, ?, ?, ?, ?)');
  $stmt->execute([$nama, $tahun, $jenis, $harga, $deskripsi ?: null]);
  echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Paket berhasil dibuat']);
  exit;
}

// GET /admin/paket/:id — detail paket
if (preg_match('#^/admin/paket/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = $m[1];
  $stmt = $pdo->prepare('SELECT * FROM paket_soal WHERE id = ?');
  $stmt->execute([$id]);
  $paket = $stmt->fetch();
  if (!$paket) { http_response_code(404); echo json_encode(['error' => 'Tidak ditemukan']); exit; }
  echo json_encode($paket);
  exit;
}

// PUT /admin/paket/:id — update paket
if (preg_match('#^/admin/paket/(\d+)$#', $uri, $m) && $method === 'PUT') {
  $id    = $m[1];
  $nama  = trim($body['nama']  ?? '');
  $tahun = !empty($body['tahun']) ? intval($body['tahun']) : null;
  $jenis = $body['jenis'] ?? 'lainnya';
  $harga = max(0, intval($body['harga'] ?? 0));
  $deskripsi = trim($body['deskripsi'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'Nama wajib diisi']); exit; }
  $pdo->prepare('UPDATE paket_soal SET nama=?, tahun=?, jenis=?, harga=?, deskripsi=? WHERE id=?')
      ->execute([$nama, $tahun, $jenis, $harga, $deskripsi ?: null, $id]);
  echo json_encode(['message' => 'Paket diperbarui']);
  exit;
}

// PATCH /admin/paket/:id/publish — toggle publish
if (preg_match('#^/admin/paket/(\d+)/publish$#', $uri, $m) && $method === 'PATCH') {
  $id  = $m[1];
  $val = intval($body['is_published'] ?? 0);
  $pdo->prepare('UPDATE paket_soal SET is_published=? WHERE id=?')->execute([$val, $id]);
  echo json_encode(['message' => 'Status diperbarui']);
  exit;
}

// DELETE /admin/paket/:id — hapus paket
if (preg_match('#^/admin/paket/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $id = $m[1];
  $pdo->prepare('DELETE FROM paket_soal WHERE id=?')->execute([$id]);
  echo json_encode(['message' => 'Paket dihapus']);
  exit;
}

// GET /admin/paket/:id/soal — daftar soal dalam paket
if (preg_match('#^/admin/paket/(\d+)/soal$#', $uri, $m) && $method === 'GET') {
  $id = $m[1];
  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.tipe, s.difficulty, s.is_published, s.is_exclusive,
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
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/paket/:id/soal — tambah soal ke paket (by soal_id)
if (preg_match('#^/admin/paket/(\d+)/soal$#', $uri, $m) && $method === 'POST') {
  $paketId = $m[1];
  $soalId  = intval($body['soal_id'] ?? 0);
  if (!$soalId) { http_response_code(400); echo json_encode(['error' => 'soal_id wajib']); exit; }
  // Cek duplikat
  $cek = $pdo->prepare('SELECT id FROM paket_soal_items WHERE paket_id=? AND soal_id=?');
  $cek->execute([$paketId, $soalId]);
  if ($cek->fetch()) { http_response_code(409); echo json_encode(['error' => 'Soal sudah ada di paket']); exit; }
  // Urutan berikutnya
  $stmt = $pdo->prepare('SELECT COALESCE(MAX(urutan),0)+1 FROM paket_soal_items WHERE paket_id=?');
  $stmt->execute([$paketId]);
  $urutan = (int)$stmt->fetchColumn();
  $pdo->prepare('INSERT INTO paket_soal_items (paket_id, soal_id, urutan) VALUES (?,?,?)')
      ->execute([$paketId, $soalId, $urutan]);
  echo json_encode(['message' => 'Soal ditambahkan', 'urutan' => $urutan]);
  exit;
}

// DELETE /admin/paket/:id/soal/:soal_id — hapus soal dari paket
if (preg_match('#^/admin/paket/(\d+)/soal/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $paketId = $m[1]; $soalId = $m[2];
  $pdo->prepare('DELETE FROM paket_soal_items WHERE paket_id=? AND soal_id=?')->execute([$paketId, $soalId]);
  // Kalau soal ini eksklusif dan sudah tidak ada di paket manapun, buka lagi ke direktori soal
  $cekPaket = $pdo->prepare('SELECT COUNT(*) FROM paket_soal_items WHERE soal_id=?');
  $cekPaket->execute([$soalId]);
  if ((int) $cekPaket->fetchColumn() === 0) {
    $pdo->prepare('UPDATE soal SET is_exclusive=0 WHERE id=? AND is_exclusive=1')->execute([$soalId]);
  }
  echo json_encode(['message' => 'Soal dihapus dari paket']);
  exit;
}

// PUT /admin/soal/exclusive?id=1 — toggle status eksklusif soal (sembunyikan dari direktori soal publik)
if ($uri === '/admin/soal/exclusive' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare('UPDATE soal SET is_exclusive = NOT is_exclusive WHERE id = ?');
  $stmt->execute([$id]);

  $stmt = $pdo->prepare('SELECT is_exclusive FROM soal WHERE id = ?');
  $stmt->execute([$id]);
  $status = $stmt->fetchColumn();

  echo json_encode([
    'is_exclusive' => (bool) $status,
    'message'      => $status ? 'Soal dijadikan eksklusif' : 'Soal tidak lagi eksklusif',
  ]);
  exit;
}

// PUT /admin/paket/:id/soal/reorder — update urutan
if (preg_match('#^/admin/paket/(\d+)/soal/reorder$#', $uri, $m) && $method === 'PUT') {
  $paketId = $m[1];
  $items   = $body['items'] ?? []; // [{soal_id, urutan}]
  $stmt    = $pdo->prepare('UPDATE paket_soal_items SET urutan=? WHERE paket_id=? AND soal_id=?');
  foreach ($items as $item) {
    $stmt->execute([$item['urutan'], $paketId, $item['soal_id']]);
  }
  echo json_encode(['message' => 'Urutan diperbarui']);
  exit;
}

// GET /admin/transactions — daftar transaksi pembelian paket + ringkasan
if ($uri === '/admin/transactions' && $method === 'GET') {
  $status = $_GET['status'] ?? '';
  $page   = max(1, intval($_GET['page'] ?? 1));
  $limit  = 20;
  $offset = ($page - 1) * $limit;

  $allowed = ['pending', 'success', 'failed', 'expired', 'cancelled'];
  $where   = '';
  $params  = [];
  if (in_array($status, $allowed, true)) {
    $where    = 'WHERE t.status = ?';
    $params[] = $status;
  }

  $stmt = $pdo->prepare("
    SELECT t.id, t.order_id, t.amount, t.status, t.payment_type, t.paid_at, t.created_at,
           u.name AS user_name, u.email AS user_email,
           p.nama AS paket_nama, p.id AS paket_id
    FROM paket_soal_transactions t
    JOIN users u ON u.id = t.user_id
    JOIN paket_soal p ON p.id = t.paket_id
    $where
    ORDER BY t.created_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM paket_soal_transactions t $where");
  $totalStmt->execute($params);

  $summary = $pdo->query("
    SELECT status, COUNT(*) AS jumlah, COALESCE(SUM(amount), 0) AS total
    FROM paket_soal_transactions
    GROUP BY status
  ")->fetchAll();

  echo json_encode([
    'data'    => $stmt->fetchAll(),
    'total'   => (int) $totalStmt->fetchColumn(),
    'page'    => $page,
    'limit'   => $limit,
    'summary' => $summary,
  ]);
  exit;
}

// ==================
// SOAL
// ==================

// GET /admin/soal
if ($uri === '/admin/soal' && $method === 'GET') {
  $page       = intval($_GET['page']       ?? 1);
  $limit      = intval($_GET['limit']      ?? 20);
  $offset     = ($page - 1) * $limit;
  $search      = $_GET['search']      ?? '';
  $difficulty  = isset($_GET['difficulty'])  && $_GET['difficulty']  !== '' ? intval($_GET['difficulty'])  : null;
  $published   = isset($_GET['published'])   && $_GET['published']   !== '' ? intval($_GET['published'])   : null;
  $subtopik_id = isset($_GET['subtopik_id']) && $_GET['subtopik_id'] !== '' ? intval($_GET['subtopik_id']) : null;

  $where  = ['s.is_exclusive = 0'];
  $params = [];

  if ($search)                 { $where[] = '(s.body LIKE ? OR s.kode LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; }
  if ($difficulty !== null)    { $where[] = 's.difficulty = ?';      $params[] = $difficulty; }
  if ($published  !== null)    { $where[] = 's.is_published = ?';    $params[] = $published;  }
  if ($subtopik_id !== null)   { $where[] = 's.subtopik_id = ?';    $params[] = $subtopik_id; }

  $whereClause = 'WHERE ' . implode(' AND ', $where);

  $stmt = $pdo->prepare('
    SELECT s.id, s.tipe, s.body, s.answer, s.difficulty, s.is_published, s.created_at, s.kode, s.materi_ids,
           st.nama as subtopik, t.nama as topik,
           m.nama as mapel, sj.nama as subjenjang, j.nama as jenjang
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    ' . $whereClause . '
    ORDER BY s.created_at DESC
    LIMIT ' . $limit . ' OFFSET ' . $offset . '
  ');
  $stmt->execute($params);

  $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM soal s ' . $whereClause);
  $totalStmt->execute($params);

  // counts for stats bar (non-exclusive only)
  $published_count = (int) $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 1 AND is_exclusive = 0')->fetchColumn();
  $draft_count     = (int) $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 0 AND is_exclusive = 0')->fetchColumn();

  $rows = $stmt->fetchAll();
  foreach ($rows as &$row) {
    $row['materi_ids'] = $row['materi_ids'] ? json_decode($row['materi_ids']) : [];
  }

  // batch-fetch materi names for all rows
  $allMateriIds = array_unique(array_merge(...array_map(fn($r) => (array)$r['materi_ids'], $rows)));
  $materiMap = [];
  if (!empty($allMateriIds)) {
    $ph = implode(',', array_fill(0, count($allMateriIds), '?'));
    $mStmt = $pdo->prepare("SELECT id, judul FROM materi WHERE id IN ($ph)");
    $mStmt->execute(array_values($allMateriIds));
    foreach ($mStmt->fetchAll() as $m) $materiMap[$m['id']] = $m['judul'];
  }
  foreach ($rows as &$row) {
    $row['materi'] = array_map(fn($id) => ['id' => (int)$id, 'judul' => $materiMap[$id] ?? ''], $row['materi_ids']);
  }

  echo json_encode([
    'data'            => $rows,
    'total'           => (int) $totalStmt->fetchColumn(),
    'page'            => $page,
    'limit'           => $limit,
    'published_count' => $published_count,
    'draft_count'     => $draft_count,
  ]);
  exit;
}

// GET /admin/soal/export — download soal as bulk-import JSON
if ($uri === '/admin/soal/export' && $method === 'GET') {
  $subtopik_id = isset($_GET['subtopik_id']) && $_GET['subtopik_id'] !== '' ? (int) $_GET['subtopik_id'] : null;
  $search      = trim($_GET['search']     ?? '');
  $difficulty  = isset($_GET['difficulty']) && $_GET['difficulty'] !== '' ? (int) $_GET['difficulty'] : null;
  $published   = isset($_GET['published'])  && $_GET['published']  !== '' ? (int) $_GET['published']  : null;

  $where = ['s.is_exclusive = 0']; $params = [];
  if ($subtopik_id !== null) { $where[] = 's.subtopik_id = ?'; $params[] = $subtopik_id; }
  if ($search !== '')        { $where[] = 's.body LIKE ?';      $params[] = "%$search%"; }
  if ($difficulty !== null)  { $where[] = 's.difficulty = ?';   $params[] = $difficulty; }
  if ($published !== null)   { $where[] = 's.is_published = ?'; $params[] = $published; }
  $whereClause = 'WHERE ' . implode(' AND ', $where);

  $stmt = $pdo->prepare("
    SELECT s.id, s.kode, s.tipe, s.body, s.options, s.answer, s.explanation, s.difficulty, s.materi_ids, s.tags
    FROM soal s
    $whereClause
    ORDER BY s.created_at ASC
    LIMIT 1000
  ");
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  // Batch-fetch materi titles
  $allMateriIds = [];
  foreach ($rows as $r) {
    $ids = $r['materi_ids'] ? json_decode($r['materi_ids'], true) : [];
    if (is_array($ids)) $allMateriIds = array_merge($allMateriIds, $ids);
  }
  $allMateriIds = array_values(array_unique($allMateriIds));
  $materiTitleMap = [];
  if (!empty($allMateriIds)) {
    $ph = implode(',', array_fill(0, count($allMateriIds), '?'));
    $mStmt = $pdo->prepare("SELECT id, judul FROM materi WHERE id IN ($ph)");
    $mStmt->execute($allMateriIds);
    foreach ($mStmt->fetchAll() as $m) $materiTitleMap[$m['id']] = $m['judul'];
  }

  $diffMap = [1 => 'easy', 2 => 'medium', 3 => 'hard'];
  foreach ($rows as &$r) {
    $r['options']    = json_decode($r['options'] ?? 'null');
    $r['answer']     = json_decode($r['answer']  ?? 'null');
    $r['difficulty'] = $diffMap[(int) $r['difficulty']] ?? 'easy';
    if (!$r['explanation']) unset($r['explanation']);
    $ids = $r['materi_ids'] ? json_decode($r['materi_ids'], true) : [];
    if (is_array($ids) && !empty($ids)) {
      $r['materi_terkait'] = array_values(array_filter(array_map(fn($id) => $materiTitleMap[$id] ?? null, $ids)));
    }
    unset($r['materi_ids']);
    $r['tags'] = $r['tags'] ? json_decode($r['tags']) : [];
  }

  echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

// GET /admin/soal/detail?id=1  atau  ?kode=A6E5M9
if ($uri === '/admin/soal/detail' && $method === 'GET') {
  $id   = $_GET['id']   ?? null;
  $kode = $_GET['kode'] ?? null;
  if (!$id && !$kode) { http_response_code(400); echo json_encode(['error' => 'id atau kode wajib']); exit; }

  $stmt = $pdo->prepare('
  SELECT s.*,
         st.nama as subtopik, t.nama as topik,
         m.nama as mapel, sj.nama as subjenjang,
         j.nama as jenjang
  FROM soal s
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  JOIN subjenjang sj ON m.subjenjang_id = sj.id
  JOIN jenjang j ON sj.jenjang_id = j.id
  WHERE ' . ($id ? 's.id = ?' : 's.kode = ?') . '
');
  $stmt->execute([$id ?: $kode]);
  $soal = $stmt->fetch();

  if (!$soal) { http_response_code(404); echo json_encode(['error' => 'Soal tidak ditemukan']); exit; }

  $soal['options']    = json_decode($soal['options']);
  $soal['answer']     = json_decode($soal['answer']);
  $soal['materi_ids'] = $soal['materi_ids'] ? json_decode($soal['materi_ids']) : [];
  $soal['tags']       = $soal['tags'] ? json_decode($soal['tags']) : [];
  echo json_encode($soal);
  exit;
}

// POST /admin/soal
if ($uri === '/admin/soal' && $method === 'POST') {
  if (empty($body['subtopik_id']) || empty($body['body']) || !isset($body['options']) || !isset($body['answer']) || $body['answer'] === '' || $body['answer'] === null) {
    http_response_code(400);
    $missing = empty($body['subtopik_id']) ? 'subtopik_id' : (empty($body['body']) ? 'body' : (!isset($body['options']) ? 'options' : 'answer'));
    echo json_encode(['error' => "$missing wajib diisi"]);
    exit;
  }

  // Generate kode unik 6 karakter
  $kode = '';
  do {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $kode = '';
    for ($i = 0; $i < 6; $i++) {
      $kode .= $chars[random_int(0, strlen($chars) - 1)];
    }
    $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
    $cek->execute([$kode]);
  } while ($cek->fetch()); // ulangi kalau bentrok

  $stmt = $pdo->prepare('
    INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation, materi_ids, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ');
  $materi_ids = !empty($body['materi_ids']) ? json_encode($body['materi_ids']) : null;
  $tags_val   = !empty($body['tags']) && is_array($body['tags']) ? json_encode(array_values($body['tags'])) : null;
  $stmt->execute([
    $kode,
    $body['subtopik_id'],
    $body['tipe']        ?? 'pilihan_ganda',
    $body['body'],
    json_encode($body['options']),
    json_encode($body['answer']),
    $body['explanation'] ?? null,
    $body['difficulty']  ?? 1,
    $body['video_url']   ?? null,
    $body['is_public_explanation'] ?? 0,
    $materi_ids,
    $tags_val,
  ]);

  http_response_code(201);
  echo json_encode(['id' => $pdo->lastInsertId(), 'kode' => $kode, 'message' => 'Soal berhasil ditambahkan']);
  exit;
}

// POST /admin/soal/check-kodes  — batch check kodes exist in DB
if ($uri === '/admin/soal/check-kodes' && $method === 'POST') {
  $kodes = $body['kodes'] ?? [];
  if (empty($kodes) || !is_array($kodes)) {
    echo json_encode(['found' => []]);
    exit;
  }
  $kodes = array_values(array_unique(array_map('strtoupper', $kodes)));
  $ph = implode(',', array_fill(0, count($kodes), '?'));
  $stmt = $pdo->prepare("SELECT kode FROM soal WHERE kode IN ($ph)");
  $stmt->execute($kodes);
  $found = array_column($stmt->fetchAll(), 'kode');
  echo json_encode(['found' => $found]);
  exit;
}

// POST /admin/soal/bulk
if ($uri === '/admin/soal/bulk' && $method === 'POST') {
  $soalList = $body['soal'] ?? [];
  if (empty($soalList) || !is_array($soalList)) {
    http_response_code(400);
    echo json_encode(['error' => 'Array soal wajib diisi']);
    exit;
  }

  $saved  = [];
  $errors = [];
  $chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Batch-resolve materi_terkait titles → IDs
  $allTitles = [];
  foreach ($soalList as $s) {
    if (!empty($s['materi_terkait']) && is_array($s['materi_terkait'])) {
      foreach ($s['materi_terkait'] as $t) { $allTitles[] = $t; }
    }
  }
  $titleToId = [];
  if (!empty($allTitles)) {
    $allTitles = array_unique($allTitles);
    $ph = implode(',', array_fill(0, count($allTitles), '?'));
    $mStmt = $pdo->prepare("SELECT id, judul FROM materi WHERE judul IN ($ph)");
    $mStmt->execute(array_values($allTitles));
    foreach ($mStmt->fetchAll() as $m) { $titleToId[$m['judul']] = (int)$m['id']; }
  }

  foreach ($soalList as $i => $s) {
    if (empty($s['subtopik_id']) || empty($s['body']) || !isset($s['options']) || !isset($s['answer']) || $s['answer'] === '' || $s['answer'] === null) {
      $errors[] = ['index' => $i, 'reason' => 'Field tidak lengkap'];
      continue;
    }

    try {
      if (!empty($s['materi_ids']) && is_array($s['materi_ids'])) {
        $materi_ids_bulk = json_encode($s['materi_ids']);
      } elseif (!empty($s['materi_terkait']) && is_array($s['materi_terkait'])) {
        $resolved = array_values(array_filter(array_map(fn($t) => $titleToId[$t] ?? null, $s['materi_terkait'])));
        $materi_ids_bulk = !empty($resolved) ? json_encode($resolved) : null;
      } else {
        $materi_ids_bulk = null;
      }

      $expValue = isset($s['explanation']) ? (is_array($s['explanation']) || is_object($s['explanation']) ? json_encode($s['explanation']) : $s['explanation']) : null;

      // === MODE EDIT: ada kode ===
      if (!empty($s['kode'])) {
        $kodeUpper = strtoupper((string)$s['kode']);
        $check = $pdo->prepare('SELECT id, kode FROM soal WHERE kode = ?');
        $check->execute([$kodeUpper]);
        $existing = $check->fetch();
        if ($existing) {
          // Kode ada di DB → UPDATE
          $upd = $pdo->prepare('
            UPDATE soal SET subtopik_id=?, tipe=?, body=?, options=?, answer=?, explanation=?, difficulty=?, video_url=?, materi_ids=?
            WHERE id=?
          ');
          $upd->execute([
            $s['subtopik_id'],
            $s['tipe']       ?? 'pilihan_ganda',
            $s['body'],
            json_encode($s['options']),
            json_encode($s['answer']),
            $expValue,
            $s['difficulty'] ?? 1,
            $s['video_url']  ?? null,
            $materi_ids_bulk,
            $existing['id'],
          ]);
          $saved[] = ['index' => $i, 'id' => (int)$existing['id'], 'kode' => $existing['kode'], 'action' => 'updated'];
          continue;
        }
        // Kode tidak ada di DB → INSERT baru dengan kode tersebut
        $kode = $kodeUpper;
      } else {
        // Generate kode unik baru
        $kode = '';
        do {
          $kode = '';
          for ($j = 0; $j < 6; $j++) {
            $kode .= $chars[random_int(0, strlen($chars) - 1)];
          }
          $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
          $cek->execute([$kode]);
        } while ($cek->fetch());
      }

      // INSERT (kode sudah ditentukan di atas)
      $stmt = $pdo->prepare('
        INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation, materi_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ');
      $stmt->execute([
        $kode,
        $s['subtopik_id'],
        $s['tipe']        ?? 'pilihan_ganda',
        $s['body'],
        json_encode($s['options']),
        json_encode($s['answer']),
        $expValue,
        $s['difficulty']  ?? 1,
        $s['video_url']   ?? null,
        $s['is_public_explanation'] ?? 0,
        $materi_ids_bulk,
      ]);
      $saved[] = ['index' => $i, 'id' => $pdo->lastInsertId(), 'kode' => $kode, 'action' => 'created'];
    } catch (Exception $e) {
      $errors[] = ['index' => $i, 'reason' => $e->getMessage()];
    }
  }

  http_response_code(201);
  echo json_encode([
    'saved'  => $saved,
    'errors' => $errors,
    'total'  => count($saved),
  ]);
  exit;
}

// PUT /admin/soal?id=1
if ($uri === '/admin/soal' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  if (empty($body['subtopik_id']) || empty($body['body']) || !isset($body['options']) || !isset($body['answer']) || $body['answer'] === '' || $body['answer'] === null) {
    http_response_code(400);
    $missing = empty($body['subtopik_id']) ? 'subtopik_id' : (empty($body['body']) ? 'body' : (!isset($body['options']) ? 'options' : 'answer'));
    echo json_encode(['error' => "$missing wajib diisi"]);
    exit;
  }

  $stmt = $pdo->prepare('
    UPDATE soal
    SET subtopik_id=?, tipe=?, body=?, options=?, answer=?, explanation=?, difficulty=?, video_url=?, is_public_explanation=?, materi_ids=?, tags=?
    WHERE id=?
  ');
  $materi_ids = !empty($body['materi_ids']) ? json_encode($body['materi_ids']) : null;
  $tags_val   = !empty($body['tags']) && is_array($body['tags']) ? json_encode(array_values($body['tags'])) : null;
  $stmt->execute([
    $body['subtopik_id'],
    $body['tipe']        ?? 'pilihan_ganda',
    $body['body'],
    json_encode($body['options']),
    json_encode($body['answer']),
    $body['explanation'] ?? null,
    $body['difficulty']  ?? 1,
    $body['video_url']   ?? null,
    $body['is_public_explanation'] ?? 0,
    $materi_ids,
    $tags_val,
    $id,
  ]);

  echo json_encode(['message' => 'Soal berhasil diupdate']);
  exit;
}

// DELETE /admin/soal/bulk  — body: { ids: [1,2,3] }
if ($uri === '/admin/soal/bulk' && $method === 'DELETE') {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $ids  = array_filter(array_map('intval', $body['ids'] ?? []), fn($id) => $id > 0);
  if (empty($ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'ids wajib']);
    exit;
  }
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $pdo->prepare("DELETE FROM sessions   WHERE soal_id IN ($placeholders)")->execute($ids);
  $pdo->prepare("DELETE FROM xp_history WHERE soal_kode IN (SELECT kode FROM soal WHERE id IN ($placeholders))")->execute($ids);
  $pdo->prepare("DELETE FROM reports    WHERE soal_kode IN (SELECT kode FROM soal WHERE id IN ($placeholders))")->execute($ids);
  $pdo->prepare("DELETE FROM soal WHERE id IN ($placeholders)")->execute($ids);
  echo json_encode(['deleted' => count($ids)]);
  exit;
}

// DELETE /admin/soal?id=1
if ($uri === '/admin/soal' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  // Hapus data terkait dulu
  $pdo->prepare('DELETE FROM sessions    WHERE soal_id = ?')->execute([$id]);
  $pdo->prepare('DELETE FROM xp_history  WHERE soal_kode = (SELECT kode FROM soal WHERE id = ?)')->execute([$id]);
  $pdo->prepare('DELETE FROM reports     WHERE soal_kode = (SELECT kode FROM soal WHERE id = ?)')->execute([$id]);

  // Baru hapus soal
  $pdo->prepare('DELETE FROM soal WHERE id = ?')->execute([$id]);

  echo json_encode(['message' => 'Soal berhasil dihapus']);
  exit;
}

// ==================
// STRUKTUR
// ==================

// GET /admin/struktur
if ($uri === '/admin/struktur' && $method === 'GET') {
  $jenjang    = $pdo->query('SELECT * FROM jenjang ORDER BY urutan ASC, id ASC')->fetchAll();
  $subjenjang = $pdo->query('SELECT * FROM subjenjang ORDER BY urutan ASC, id ASC')->fetchAll();
  $mapel      = $pdo->query('SELECT * FROM mapel ORDER BY urutan ASC, id ASC')->fetchAll();
  $topik      = $pdo->query('SELECT * FROM topik ORDER BY urutan ASC, id ASC')->fetchAll();
  $subtopik   = $pdo->query('SELECT * FROM subtopik ORDER BY urutan ASC, id ASC')->fetchAll();

  // Count soal per subtopik
  $soalCount = $pdo->query('SELECT subtopik_id, COUNT(*) as total FROM soal GROUP BY subtopik_id')->fetchAll();
  $soalBySubtopik = [];
  foreach ($soalCount as $sc) $soalBySubtopik[(int)$sc['subtopik_id']] = (int)$sc['total'];

  // Count materi per subtopik
  $materiCount = $pdo->query('SELECT subtopik_id, COUNT(*) as total FROM materi GROUP BY subtopik_id')->fetchAll();
  $materiBySubtopik = [];
  foreach ($materiCount as $mc) $materiBySubtopik[(int)$mc['subtopik_id']] = (int)$mc['total'];

  // Inject ke subtopik
  foreach ($subtopik as &$st) {
    $st['jumlah_soal']   = $soalBySubtopik[(int)$st['id']]   ?? 0;
    $st['jumlah_materi'] = $materiBySubtopik[(int)$st['id']] ?? 0;
  }
  unset($st);

  // Aggregate subtopik → topik
  $soalByTopik = []; $materiByTopik = [];
  foreach ($subtopik as $st) {
    $tid = (int)$st['topik_id'];
    $soalByTopik[$tid]   = ($soalByTopik[$tid]   ?? 0) + (int)$st['jumlah_soal'];
    $materiByTopik[$tid] = ($materiByTopik[$tid] ?? 0) + (int)$st['jumlah_materi'];
  }
  foreach ($topik as &$t) {
    $t['jumlah_soal']   = $soalByTopik[(int)$t['id']]   ?? 0;
    $t['jumlah_materi'] = $materiByTopik[(int)$t['id']] ?? 0;
  }
  unset($t);

  // Aggregate topik → mapel
  $soalByMapel = []; $materiByMapel = [];
  foreach ($topik as $t) {
    $mid = (int)$t['mapel_id'];
    $soalByMapel[$mid]   = ($soalByMapel[$mid]   ?? 0) + (int)$t['jumlah_soal'];
    $materiByMapel[$mid] = ($materiByMapel[$mid] ?? 0) + (int)$t['jumlah_materi'];
  }
  foreach ($mapel as &$m) {
    $m['jumlah_soal']   = $soalByMapel[(int)$m['id']]   ?? 0;
    $m['jumlah_materi'] = $materiByMapel[(int)$m['id']] ?? 0;
  }
  unset($m);

  // Aggregate mapel → subjenjang
  $soalBySubjenjang = []; $materiBySubjenjang = [];
  foreach ($mapel as $m) {
    $sjid = (int)$m['subjenjang_id'];
    $soalBySubjenjang[$sjid]   = ($soalBySubjenjang[$sjid]   ?? 0) + (int)$m['jumlah_soal'];
    $materiBySubjenjang[$sjid] = ($materiBySubjenjang[$sjid] ?? 0) + (int)$m['jumlah_materi'];
  }
  foreach ($subjenjang as &$sj) {
    $sj['jumlah_soal']   = $soalBySubjenjang[(int)$sj['id']]   ?? 0;
    $sj['jumlah_materi'] = $materiBySubjenjang[(int)$sj['id']] ?? 0;
  }
  unset($sj);

  // Aggregate subjenjang → jenjang
  $soalByJenjang = []; $materiByJenjang = [];
  foreach ($subjenjang as $sj) {
    $jid = (int)$sj['jenjang_id'];
    $soalByJenjang[$jid]   = ($soalByJenjang[$jid]   ?? 0) + (int)$sj['jumlah_soal'];
    $materiByJenjang[$jid] = ($materiByJenjang[$jid] ?? 0) + (int)$sj['jumlah_materi'];
  }
  foreach ($jenjang as &$j) {
    $j['jumlah_soal']   = $soalByJenjang[(int)$j['id']]   ?? 0;
    $j['jumlah_materi'] = $materiByJenjang[(int)$j['id']] ?? 0;
  }
  unset($j);

  echo json_encode(compact('jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'));
  exit;
}

// POST /admin/struktur/:level
if (str_starts_with($uri, '/admin/struktur/') && $method === 'POST' && $uri !== '/admin/struktur/bulk-topik') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }

  $nama = trim($body['nama'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'nama wajib']); exit; }

  $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nama));
  $slug = trim($slug, '-');

  if ($level === 'jenjang') {
    $kode = $body['kode'] ?? $slug;
    $stmt = $pdo->prepare('INSERT INTO jenjang (kode, nama, slug, urutan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$kode, $nama, $slug, $body['urutan'] ?? 0]);

  } elseif ($level === 'subjenjang') {
    $jenjang_id = $body['jenjang_id'] ?? null;
    if (!$jenjang_id) { http_response_code(400); echo json_encode(['error' => 'jenjang_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO subjenjang (jenjang_id, nama, slug, urutan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$jenjang_id, $nama, $slug, $body['urutan'] ?? 0]);

  } elseif ($level === 'mapel') {
    $subjenjang_id = $body['subjenjang_id'] ?? null;
    if (!$subjenjang_id) { http_response_code(400); echo json_encode(['error' => 'subjenjang_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO mapel (subjenjang_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$subjenjang_id, $nama, $slug]);

  } elseif ($level === 'topik') {
    $mapel_id = $body['mapel_id'] ?? null;
    if (!$mapel_id) { http_response_code(400); echo json_encode(['error' => 'mapel_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO topik (mapel_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$mapel_id, $nama, $slug]);

  } elseif ($level === 'subtopik') {
    $topik_id = $body['topik_id'] ?? null;
    if (!$topik_id) { http_response_code(400); echo json_encode(['error' => 'topik_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO subtopik (topik_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$topik_id, $nama, $slug]);
  }

  cache_bust_prefix('browse:');
  http_response_code(201);
  echo json_encode([
    'id'      => $pdo->lastInsertId(),
    'slug'    => $slug,
    'message' => ucfirst($level) . ' berhasil ditambahkan',
  ]);
  exit;
}

// POST /admin/struktur/bulk-topik — body: { mapel_id, items: [{topik, subtopik:[]}] }
if ($uri === '/admin/struktur/bulk-topik' && $method === 'POST') {
  $mapel_id = (int)($body['mapel_id'] ?? 0);
  $items    = $body['items'] ?? [];
  if (!$mapel_id) { http_response_code(400); echo json_encode(['error' => 'mapel_id wajib']); exit; }
  if (!is_array($items) || count($items) === 0) { http_response_code(400); echo json_encode(['error' => 'items kosong']); exit; }

  $inserted_topik    = 0;
  $inserted_subtopik = 0;
  $errors            = [];

  $stmtFindTopik  = $pdo->prepare('SELECT id FROM topik WHERE mapel_id = ? AND nama = ? LIMIT 1');
  $stmtTopik      = $pdo->prepare('INSERT INTO topik (mapel_id, nama, slug) VALUES (?, ?, ?)');
  $stmtFindSt     = $pdo->prepare('SELECT id FROM subtopik WHERE topik_id = ? AND nama = ? LIMIT 1');
  $stmtSubtopik   = $pdo->prepare('INSERT INTO subtopik (topik_id, nama, slug) VALUES (?, ?, ?)');

  foreach ($items as $i => $item) {
    $topikNama = trim($item['topik'] ?? '');
    if (!$topikNama) { $errors[] = "Item #" . ($i + 1) . ": nama topik kosong"; continue; }
    $topikSlug = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $topikNama)), '-');
    try {
      // Reuse existing topik if name matches
      $stmtFindTopik->execute([$mapel_id, $topikNama]);
      $existing = $stmtFindTopik->fetch();
      if ($existing) {
        $topikId = (int)$existing['id'];
      } else {
        $stmtTopik->execute([$mapel_id, $topikNama, $topikSlug]);
        $topikId = (int)$pdo->lastInsertId();
        $inserted_topik++;
      }
      foreach (($item['subtopik'] ?? []) as $stNama) {
        $stNama = trim($stNama);
        if (!$stNama) continue;
        // Skip if subtopik with same name already exists under this topik
        $stmtFindSt->execute([$topikId, $stNama]);
        if ($stmtFindSt->fetch()) continue;
        $stSlug = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $stNama)), '-');
        $stmtSubtopik->execute([$topikId, $stNama, $stSlug]);
        $inserted_subtopik++;
      }
    } catch (Exception $e) {
      $errors[] = "Topik '$topikNama': " . $e->getMessage();
    }
  }

  cache_bust_prefix('browse:');
  echo json_encode(['inserted_topik' => $inserted_topik, 'inserted_subtopik' => $inserted_subtopik, 'errors' => $errors]);
  exit;
}

// PUT /admin/struktur/:level?id=1
if (str_starts_with($uri, '/admin/struktur/') && $method === 'PUT') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $nama = trim($body['nama'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'nama wajib']); exit; }

  $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nama));
  $slug = trim($slug, '-');

  $stmt = $pdo->prepare("UPDATE $level SET nama = ?, slug = ? WHERE id = ?");
  $stmt->execute([$nama, $slug, $id]);

  cache_bust_prefix('browse:');
  echo json_encode(['message' => ucfirst($level) . ' berhasil diupdate']);
  exit;
}

// DELETE /admin/struktur/:level?id=1
if (str_starts_with($uri, '/admin/struktur/') && $method === 'DELETE') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  try {
    $pdo->prepare("DELETE FROM $level WHERE id = ?")->execute([$id]);
    cache_bust_prefix('browse:');
    echo json_encode(['message' => ucfirst($level) . ' berhasil dihapus']);
  } catch (Exception $e) {
    http_response_code(409);
    echo json_encode(['error' => 'Tidak bisa dihapus karena masih ada data di bawahnya.']);
  }
  exit;
}

// PUT /admin/publish/:level?id=1
if (str_starts_with($uri, '/admin/publish/') && $method === 'PUT') {
  $level   = str_replace('/admin/publish/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik', 'soal'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) {
    http_response_code(400); echo json_encode(['error' => 'id wajib']); exit;
  }

  $stmt = $pdo->prepare("UPDATE $level SET is_published = NOT is_published WHERE id = ?");
  $stmt->execute([$id]);

  $stmt = $pdo->prepare("SELECT is_published FROM $level WHERE id = ?");
  $stmt->execute([$id]);
  $status = $stmt->fetchColumn();

  if ($level !== 'soal') cache_bust_prefix('browse:');
  echo json_encode([
    'is_published' => (bool) $status,
    'message'      => $status ? ucfirst($level) . ' dipublish' : ucfirst($level) . ' di-unpublish',
  ]);
  exit;
}

// PUT /admin/set-status/:level?id=X  body: { status: 'draft' | 'coming_soon' | 'published' }
if (str_starts_with($uri, '/admin/set-status/') && $method === 'PUT') {
  $level   = str_replace('/admin/set-status/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];
  $body    = json_decode(file_get_contents('php://input'), true);
  $status  = $body['status'] ?? null;

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) {
    http_response_code(400); echo json_encode(['error' => 'id wajib']); exit;
  }
  if (!in_array($status, ['draft', 'coming_soon', 'published'])) {
    http_response_code(400); echo json_encode(['error' => 'status tidak valid']); exit;
  }

  if ($status === 'draft') {
    $pdo->prepare("UPDATE $level SET is_published=0, is_coming_soon=0 WHERE id=?")->execute([$id]);
  } elseif ($status === 'coming_soon') {
    $pdo->prepare("UPDATE $level SET is_published=1, is_coming_soon=1 WHERE id=?")->execute([$id]);
  } else {
    $pdo->prepare("UPDATE $level SET is_published=1, is_coming_soon=0 WHERE id=?")->execute([$id]);
  }

  $row = $pdo->prepare("SELECT is_published, is_coming_soon FROM $level WHERE id=?");
  $row->execute([$id]);
  $r = $row->fetch();
  cache_bust_prefix('browse:');
  echo json_encode(['is_published' => (int)$r['is_published'], 'is_coming_soon' => (int)$r['is_coming_soon']]);
  exit;
}

// GET /admin/stats
if ($uri === '/admin/stats' && $method === 'GET') {
  $totalSoal          = $pdo->query('SELECT COUNT(*) FROM soal')->fetchColumn();
  $totalSoalPublished = $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 1')->fetchColumn();
  $totalUser          = $pdo->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn();
  $totalJenjang       = $pdo->query('SELECT COUNT(*) FROM jenjang')->fetchColumn();
  $totalSubtopik      = $pdo->query('SELECT COUNT(*) FROM subtopik')->fetchColumn();
  $totalSesi          = $pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn();
  $totalBenar         = $pdo->query('SELECT COUNT(*) FROM sessions WHERE is_correct = 1')->fetchColumn();

  // Soal terbaru
  $soalTerbaru = $pdo->query('
    SELECT s.kode, s.body, s.difficulty, s.is_published, s.created_at,
           st.nama as subtopik, m.nama as mapel
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    ORDER BY s.created_at DESC
    LIMIT 5
  ')->fetchAll();

  // User terbaru
  $userTerbaru = $pdo->query('
    SELECT id, name, email, xp, streak, created_at
    FROM users
    WHERE role = "user"
    ORDER BY created_at DESC
    LIMIT 5
  ')->fetchAll();
  
  // Soal per jenjang
  $soalPerJenjang = $pdo->query('
    SELECT j.nama, COUNT(s.id) as total
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE s.is_published = 1
    GROUP BY j.id, j.nama
    ORDER BY total DESC
  ')->fetchAll();

  // User aktif 7 hari terakhir
  $userAktif = $pdo->query('
    SELECT DATE(created_at) as tanggal, COUNT(DISTINCT user_id) as aktif
    FROM sessions
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY tanggal ASC
  ')->fetchAll();

  // Akurasi per difficulty
  $akurasiPerDifficulty = $pdo->query('
    SELECT s.difficulty,
      COUNT(*) as total,
      SUM(se.is_correct) as benar
    FROM sessions se
    JOIN soal s ON se.soal_id = s.id
    GROUP BY s.difficulty
    ORDER BY s.difficulty ASC
  ')->fetchAll();

  // Soal dibuat per hari 30 hari terakhir
  $soalPerHari = $pdo->query('
    SELECT DATE(created_at) as tanggal, COUNT(*) as total
    FROM soal
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY tanggal ASC
  ')->fetchAll();
  
  // 1. Soal paling sering salah (top 10, min 5 attempt)
$soalPalingSalah = $pdo->query('
  SELECT s.kode, s.body, s.difficulty,
         st.nama as subtopik, m.nama as mapel,
         COUNT(*) as total_attempt,
         SUM(se.is_correct) as total_benar,
         ROUND((1 - SUM(se.is_correct) / COUNT(*)) * 100) as error_rate
  FROM sessions se
  JOIN soal s ON se.soal_id = s.id
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  WHERE s.is_published = 1
  GROUP BY s.id, s.kode, s.body, s.difficulty, st.nama, m.nama
  HAVING total_attempt >= 5
  ORDER BY error_rate DESC
  LIMIT 10
')->fetchAll();

// 2. Registrasi user per hari 30 hari terakhir
$registrasiHarian = $pdo->query('
  SELECT DATE(created_at) as tanggal, COUNT(*) as total
  FROM users
  WHERE role = "user"
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(created_at)
  ORDER BY tanggal ASC
')->fetchAll();

// Registrasi per minggu 12 minggu terakhir
$registrasiMingguan = $pdo->query('
  SELECT
    YEAR(created_at) as tahun,
    WEEK(created_at, 1) as minggu,
    MIN(DATE(created_at)) as tanggal_mulai,
    COUNT(*) as total
  FROM users
  WHERE role = "user"
  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
  GROUP BY YEAR(created_at), WEEK(created_at, 1)
  ORDER BY tahun ASC, minggu ASC
')->fetchAll();

// 3. XP didistribusikan per hari 30 hari terakhir
$xpPerHari = $pdo->query('
  SELECT DATE(created_at) as tanggal, SUM(xp) as total_xp, COUNT(*) as total_transaksi
  FROM xp_history
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(created_at)
  ORDER BY tanggal ASC
')->fetchAll();

// 4. Soal terpopuler
$soalTerpopuler = $pdo->query('
  SELECT s.kode, s.body, s.difficulty,
         st.nama as subtopik, m.nama as mapel,
         s.views,
         COUNT(se.id) as total_attempt,
         COUNT(DISTINCT se.user_id) as total_user,
         ROUND(SUM(se.is_correct) / NULLIF(COUNT(*), 0) * 100) as akurasi
  FROM soal s
  LEFT JOIN sessions se ON se.soal_id = s.id
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  WHERE s.is_published = 1
  GROUP BY s.id, s.kode, s.body, s.difficulty, st.nama, m.nama, s.views
  HAVING COUNT(se.id) >= 3
  ORDER BY (s.views * 0.3 + COUNT(se.id) * 0.5 + COUNT(DISTINCT se.user_id) * 0.2) DESC
  LIMIT 10
')->fetchAll();

  echo json_encode([
    'total_soal'           => (int) $totalSoal,
    'total_soal_published' => (int) $totalSoalPublished,
    'total_soal_draft'     => (int) $totalSoal - (int) $totalSoalPublished,
    'total_user'           => (int) $totalUser,
    'total_jenjang'        => (int) $totalJenjang,
    'total_subtopik'       => (int) $totalSubtopik,
    'total_sesi'           => (int) $totalSesi,
    'total_benar'          => (int) $totalBenar,
    'akurasi'              => $totalSesi > 0 ? round($totalBenar / $totalSesi * 100) : 0,
    'soal_terbaru'         => $soalTerbaru,
    'user_terbaru'         => $userTerbaru,
    'soal_per_jenjang'        => $soalPerJenjang,
    'user_aktif'              => $userAktif,
    'akurasi_per_difficulty'  => $akurasiPerDifficulty,
    'soal_per_hari'           => $soalPerHari,
    'soal_paling_salah'    => $soalPalingSalah,
'registrasi_harian'    => $registrasiHarian,
'registrasi_mingguan'  => $registrasiMingguan,
'xp_per_hari'          => $xpPerHari,
'soal_terpopuler'      => $soalTerpopuler,
  ]);
  exit;
}

// PUT /admin/urutan/:level?id=1
if (str_starts_with($uri, '/admin/urutan/') && $method === 'PUT') {
  $level   = str_replace('/admin/urutan/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $urutan  = $body['urutan'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id || $urutan === null) {
    http_response_code(400); echo json_encode(['error' => 'id dan urutan wajib']); exit;
  }

  $stmt = $pdo->prepare("UPDATE `$level` SET urutan = ? WHERE id = ?");
  $stmt->execute([$urutan, $id]);

  echo json_encode(['message' => 'Urutan berhasil diupdate']);
  exit;
}

// GET /admin/users?page=1&search=
if ($uri === '/admin/users' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $search = $_GET['search'] ?? '';

  if ($search) {
    $stmt = $pdo->prepare('
      SELECT id, name, email, role, xp, streak, soal_streak, created_at, email_verified, verified_at
      FROM users
      WHERE (name LIKE ? OR email LIKE ?)
      ORDER BY created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute(["%$search%", "%$search%"]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE name LIKE ? OR email LIKE ?');
    $totalStmt->execute(["%$search%", "%$search%"]);
  } else {
    $stmt = $pdo->prepare('
      SELECT id, name, email, role, xp, streak, soal_streak, created_at, email_verified, verified_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM users');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// GET /admin/users/detail?id=1
if ($uri === '/admin/users/detail' && $method === 'GET') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare('
    SELECT id, name, email, role, xp, streak, soal_streak, soal_streak_best, created_at
    FROM users WHERE id = ?
  ');
  $stmt->execute([$id]);
  $user = $stmt->fetch();
  if (!$user) { http_response_code(404); echo json_encode(['error' => 'User tidak ditemukan']); exit; }

  // Stats sesi
  $stmt = $pdo->prepare('SELECT COUNT(*) as total, SUM(is_correct) as benar FROM sessions WHERE user_id = ?');
  $stmt->execute([$id]);
  $sesi = $stmt->fetch();

  echo json_encode(['user' => $user, 'sesi' => $sesi]);
  exit;
}

// PUT /admin/users?id=1
if ($uri === '/admin/users' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $allowed = ['name', 'role', 'xp'];
  $sets    = [];
  $values  = [];

  foreach ($allowed as $field) {
    if (isset($body[$field])) {
      $sets[]   = "$field = ?";
      $values[] = $body[$field];
    }
  }

  if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Tidak ada field yang diupdate']); exit; }

  $values[] = $id;
  $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?');
  $stmt->execute($values);

  echo json_encode(['message' => 'User berhasil diupdate']);
  exit;
}

// POST /admin/users/reset-password?id=1
if ($uri === '/admin/users/reset-password' && $method === 'POST') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $newPassword = $body['password'] ?? null;
  if (!$newPassword || strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password minimal 8 karakter']);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
  $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), $id]);

  echo json_encode(['message' => 'Password berhasil direset']);
  exit;
}

// GET /admin/reports?page=1&status=pending
if ($uri === '/admin/reports' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $status = $_GET['status'] ?? '';

  if ($status && in_array($status, ['pending', 'resolved', 'dismissed'])) {
    $stmt = $pdo->prepare('
      SELECT r.*, u.name as user_name, s.body as soal_body
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      JOIN soal s ON r.soal_kode = s.kode
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute([$status]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM reports WHERE status = ?');
    $totalStmt->execute([$status]);
  } else {
    $stmt = $pdo->prepare('
      SELECT r.*, u.name as user_name, s.body as soal_body
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      JOIN soal s ON r.soal_kode = s.kode
      ORDER BY r.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM reports');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/reports?id=1
if ($uri === '/admin/reports' && $method === 'PUT') {
  $id     = $_GET['id']     ?? null;
  $status = $body['status'] ?? null;
  $admin_notes = $body['admin_notes'] ?? null;

  if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'id dan status wajib']);
    exit;
  }

  if (!in_array($status, ['pending', 'resolved', 'dismissed'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE reports SET status = ?, admin_notes = ? WHERE id = ?');
  $stmt->execute([$status, $admin_notes, $id]);

  // Notifikasi — update pesan juga sertakan admin_notes
  if (in_array($status, ['resolved', 'dismissed'])) {
    $repStmt = $pdo->prepare('SELECT user_id, soal_kode FROM reports WHERE id = ?');
    $repStmt->execute([$id]);
    $rep = $repStmt->fetch();

    if ($rep && $rep['user_id']) {
      if ($status === 'resolved') {
        $judul = 'Laporan soal ditindaklanjuti';
        $pesan = 'Laporan kamu untuk soal #' . $rep['soal_kode'] . ' telah ditindaklanjuti.';
        $tipe  = 'report_resolved';
      } else {
        $judul = 'Laporan soal ditutup';
        $pesan = 'Laporan kamu untuk soal #' . $rep['soal_kode'] . ' telah ditinjau dan ditutup.';
        $tipe  = 'report_dismissed';
      }
      if ($admin_notes) $pesan .= ' Catatan: ' . $admin_notes;

      $notifStmt = $pdo->prepare('INSERT INTO notifications (user_id, tipe, judul, pesan, link) VALUES (?, ?, ?, ?, ?)');
      $notifStmt->execute([$rep['user_id'], $tipe, $judul, $pesan, '/soal/' . $rep['soal_kode']]);
    }
  }

  echo json_encode(['message' => 'Status report berhasil diupdate']);
  exit;
}

// GET /admin/soal-requests?page=1&status=pending
if ($uri === '/admin/soal-requests' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $status = $_GET['status'] ?? '';

  if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
    $stmt = $pdo->prepare('
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM soal_requests sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.status = ?
      ORDER BY sr.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute([$status]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM soal_requests WHERE status = ?');
    $totalStmt->execute([$status]);
  } else {
    $stmt = $pdo->prepare('
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM soal_requests sr
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM soal_requests');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/soal-requests?id=1 — approve atau reject
if ($uri === '/admin/soal-requests' && $method === 'PUT') {
  $id          = $_GET['id']          ?? null;
  $status      = $body['status']      ?? null;
  $admin_notes = $body['admin_notes'] ?? null;
  $soal_kode   = $body['soal_kode']   ?? null;

  if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'id dan status wajib']);
    exit;
  }

  if (!in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  if ($status === 'approved' && !$soal_kode) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_kode wajib diisi saat approve']);
    exit;
  }

  $stmt = $pdo->prepare('
    UPDATE soal_requests
    SET status = ?, admin_notes = ?, soal_kode = ?
    WHERE id = ?
  ');
  $stmt->execute([$status, $admin_notes, $soal_kode, $id]);

  // Kirim notifikasi ke user
  $reqStmt = $pdo->prepare('SELECT user_id, body FROM soal_requests WHERE id = ?');
$reqStmt->execute([$id]);
$req = $reqStmt->fetch();

if ($req && $req['user_id']) {
  if ($status === 'approved') {
    $judul = 'Request soal disetujui';
    $pesan = 'Request soal kamu "' . mb_substr($req['body'], 0, 60) . '..." telah disetujui oleh admin.';
    $link  = $soal_kode ? "/soal/$soal_kode" : null;
    $tipe  = 'request_approved';
  } else {
    $judul = 'Request soal ditolak';
    $pesan = 'Request soal kamu "' . mb_substr($req['body'], 0, 60) . '..." tidak dapat dipenuhi saat ini.';
    if ($admin_notes) $pesan .= ' Catatan admin: ' . $admin_notes;
    $link  = null;
    $tipe  = 'request_rejected';
  }

  $notifStmt = $pdo->prepare('
    INSERT INTO notifications (user_id, tipe, judul, pesan, link)
    VALUES (?, ?, ?, ?, ?)
  ');
  $notifStmt->execute([$req['user_id'], $tipe, $judul, $pesan, $link]);
}

  echo json_encode(['message' => 'Request berhasil diupdate']);
  exit;
}

// GET /admin/changelog
if ($uri === '/admin/changelog' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT * FROM changelogs
    ORDER BY released_at DESC, id DESC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/changelog/bulk
if ($uri === '/admin/changelog/bulk' && $method === 'POST') {
  $items = $body['items'] ?? [];
  if (!is_array($items) || count($items) === 0) {
    http_response_code(400); echo json_encode(['error' => 'items wajib berupa array']); exit;
  }
  $stmt = $pdo->prepare('INSERT INTO changelogs (versi, judul, deskripsi, tipe, is_published, released_at, audience) VALUES (?,?,?,?,?,?,?)');
  $inserted = 0; $errors = [];
  foreach ($items as $i => $item) {
    $versi       = trim($item['versi']       ?? '');
    $judul       = trim($item['judul']       ?? '');
    $deskripsi   = trim($item['deskripsi']   ?? '');
    $tipe        = $item['tipe']        ?? 'feature';
    $is_pub      = isset($item['is_published']) ? (int)$item['is_published'] : 0;
    $released_at = $item['released_at']  ?? date('Y-m-d');
    $audience    = $item['audience']     ?? 'all';
    if (!$versi || !$judul) { $errors[] = "Baris $i: versi dan judul wajib"; continue; }
    try {
      $stmt->execute([$versi, $judul, $deskripsi, $tipe, $is_pub, $released_at, $audience]);
      $inserted++;
    } catch (Exception $e) { $errors[] = "Baris $i: " . $e->getMessage(); }
  }
  echo json_encode(['inserted' => $inserted, 'errors' => $errors]);
  exit;
}

// POST /admin/changelog
if ($uri === '/admin/changelog' && $method === 'POST') {
  $versi        = $body['versi']        ?? null;
  $judul        = $body['judul']        ?? null;
  $deskripsi    = $body['deskripsi']    ?? null;
  $tipe         = $body['tipe']         ?? 'feature';
  $released_at  = $body['released_at']  ?? date('Y-m-d');
  $is_published = $body['is_published'] ?? 0;
  $audience     = $body['audience']     ?? 'all';

  if (!$versi || !$judul) {
    http_response_code(400);
    echo json_encode(['error' => 'versi dan judul wajib diisi']);
    exit;
  }

  $allowed_tipe = ['feature', 'improvement', 'fix', 'breaking'];
  if (!in_array($tipe, $allowed_tipe)) $tipe = 'feature';

  $allowed_audience = ['all', 'user', 'admin'];
  if (!in_array($audience, $allowed_audience)) $audience = 'all';

  $stmt = $pdo->prepare('
    INSERT INTO changelogs (versi, judul, deskripsi, tipe, is_published, released_at, audience)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([$versi, $judul, $deskripsi, $tipe, $is_published, $released_at, $audience]);

  echo json_encode(['message' => 'Changelog berhasil ditambahkan']);
  exit;
}

// PUT /admin/changelog?id=1
if ($uri === '/admin/changelog' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  $versi        = $body['versi']        ?? null;
  $judul        = $body['judul']        ?? null;
  $deskripsi    = $body['deskripsi']    ?? null;
  $tipe         = $body['tipe']         ?? 'feature';
  $released_at  = $body['released_at']  ?? date('Y-m-d');
  $is_published = $body['is_published'] ?? 0;
  $audience     = $body['audience']     ?? 'all';

  if (!$versi || !$judul) {
    http_response_code(400);
    echo json_encode(['error' => 'versi dan judul wajib diisi']);
    exit;
  }

  $allowed_tipe = ['feature', 'improvement', 'fix', 'breaking'];
  if (!in_array($tipe, $allowed_tipe)) $tipe = 'feature';

  $allowed_audience = ['all', 'user', 'admin'];
  if (!in_array($audience, $allowed_audience)) $audience = 'all';

  $stmt = $pdo->prepare('
    UPDATE changelogs
    SET versi=?, judul=?, deskripsi=?, tipe=?, is_published=?, released_at=?, audience=?
    WHERE id=?
  ');
  $stmt->execute([$versi, $judul, $deskripsi, $tipe, $is_published, $released_at, $audience, $id]);

  echo json_encode(['message' => 'Changelog berhasil diupdate']);
  exit;
}

// DELETE /admin/changelog?id=1
if ($uri === '/admin/changelog' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $pdo->prepare('DELETE FROM changelogs WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Changelog berhasil dihapus']);
  exit;
}

// GET /admin/feedback?page=1&status=&kategori=
if ($uri === '/admin/feedback' && $method === 'GET') {
  $page     = intval($_GET['page']     ?? 1);
  $limit    = intval($_GET['limit']    ?? 20);
  $offset   = ($page - 1) * $limit;
  $status   = $_GET['status']   ?? '';
  $kategori = $_GET['kategori'] ?? '';

  $where  = [];
  $params = [];

  if ($status && in_array($status, ['pending', 'dibaca', 'ditindaklanjuti'])) {
    $where[]  = 'f.status = ?';
    $params[] = $status;
  }
  if ($kategori && in_array($kategori, ['saran_fitur', 'bug', 'minta_topik', 'kualitas_konten', 'lainnya'])) {
    $where[]  = 'f.kategori = ?';
    $params[] = $kategori;
  }

  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $stmt = $pdo->prepare("
    SELECT f.*, u.name as user_name, u.email as user_email
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    $whereClause
    ORDER BY f.created_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM feedback f $whereClause");
  $countStmt->execute($params);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $countStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/feedback?id=1 — update status + catatan
if ($uri === '/admin/feedback' && $method === 'PUT') {
  $id      = $_GET['id']      ?? null;
  $status  = $body['status']  ?? null;
  $catatan = $body['catatan'] ?? null;

  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  $allowed = ['pending', 'dibaca', 'ditindaklanjuti'];
  if ($status && !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  $sets   = [];
  $params = [];
  if ($status)           { $sets[] = 'status = ?';  $params[] = $status; }
  if ($catatan !== null) { $sets[] = 'catatan = ?'; $params[] = $catatan; }

  if (empty($sets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tidak ada yang diupdate']);
    exit;
  }

  $params[] = $id;
  $stmt = $pdo->prepare('UPDATE feedback SET ' . implode(', ', $sets) . ' WHERE id = ?');
  $stmt->execute($params);

  // Kirim notifikasi ke user — hanya saat ditindaklanjuti dan ada catatan
  if ($status === 'ditindaklanjuti' && $catatan) {
    $fbStmt = $pdo->prepare('SELECT user_id, judul FROM feedback WHERE id = ?');
    $fbStmt->execute([$id]);
    $fb = $fbStmt->fetch();

    if ($fb && $fb['user_id']) {
      $notifStmt = $pdo->prepare('
        INSERT INTO notifications (user_id, tipe, judul, pesan, link)
        VALUES (?, ?, ?, ?, ?)
      ');
      $notifStmt->execute([
        $fb['user_id'],
        'feedback_responded',
        'Masukan kamu ditindaklanjuti',
        'Masukan kamu "' . mb_substr($fb['judul'], 0, 60) . '" telah ditindaklanjuti. Catatan: ' . $catatan,
        '/profile',
      ]);
    }
  }

  echo json_encode(['message' => 'Feedback berhasil diupdate']);
  exit;
}

// DELETE /admin/feedback?id=1
if ($uri === '/admin/feedback' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $pdo->prepare('DELETE FROM feedback WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Feedback dihapus']);
  exit;
}

// POST /admin/soal/salin?id=1
if ($uri === '/admin/soal/salin' && $method === 'POST') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  // Ambil soal asli
  $stmt = $pdo->prepare('SELECT * FROM soal WHERE id = ?');
  $stmt->execute([$id]);
  $soal = $stmt->fetch();
  if (!$soal) { http_response_code(404); echo json_encode(['error' => 'Soal tidak ditemukan']); exit; }

  // Generate kode unik baru
  do {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $kode = '';
    for ($i = 0; $i < 6; $i++) $kode .= $chars[random_int(0, strlen($chars) - 1)];
    $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
    $cek->execute([$kode]);
  } while ($cek->fetch());

  // Insert soal baru — is_published = 0 (draft)
  $stmt = $pdo->prepare('
    INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation, is_published, is_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  ');
  $stmt->execute([
    $kode,
    $soal['subtopik_id'],
    $soal['tipe'],
    $soal['body'],
    $soal['options'],
    $soal['answer'],
    $soal['explanation'],
    $soal['difficulty'],
    $soal['video_url'],
    $soal['is_public_explanation'],
    $soal['is_exclusive'],
  ]);

  $newId = $pdo->lastInsertId();
  echo json_encode(['id' => $newId, 'kode' => $kode, 'message' => 'Soal berhasil disalin']);
  exit;
}

// ==================
// SOAL VIEWS
// ==================

// GET /admin/soal/views/raw
if ($uri === '/admin/soal/views/raw' && $method === 'GET') {
  $page   = max(1, (int)($_GET['page']  ?? 1));
  $limit  = min(100, max(5, (int)($_GET['limit'] ?? 10)));
  $days   = isset($_GET['days']) ? (int)$_GET['days'] : 30;
  $offset = ($page - 1) * $limit;
  $since  = $days > 0 ? date('Y-m-d H:i:s', strtotime("-{$days} days")) : '1970-01-01 00:00:00';

  $stmt = $pdo->prepare("
    SELECT sv.id, sv.viewed_at,
           s.id AS soal_id, s.kode AS soal_kode, s.difficulty,
           SUBSTRING(s.body, 1, 80) AS soal_preview,
           st.nama AS subtopik, mp.nama AS mapel,
           u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM soal_views sv
    JOIN soal s ON sv.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik     t ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    LEFT JOIN users u ON sv.user_id = u.id
    WHERE sv.viewed_at >= ?
    ORDER BY sv.viewed_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute([$since]);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM soal_views WHERE viewed_at >= ?");
  $totalStmt->execute([$since]);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// GET /admin/soal/views
if ($uri === '/admin/soal/views' && $method === 'GET') {
  $days  = isset($_GET['days']) ? (int)$_GET['days'] : 30;
  $since = $days > 0 ? date('Y-m-d H:i:s', strtotime("-{$days} days")) : '1970-01-01 00:00:00';

  $total     = (int) $pdo->query("SELECT COUNT(*) FROM soal_views")->fetchColumn();
  $today     = (int) $pdo->query("SELECT COUNT(*) FROM soal_views WHERE viewed_at >= CURDATE()")->fetchColumn();
  $week      = (int) $pdo->query("SELECT COUNT(*) FROM soal_views WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
  $month     = (int) $pdo->query("SELECT COUNT(*) FROM soal_views WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
  $anonymous = (int) $pdo->query("SELECT COUNT(*) FROM soal_views WHERE user_id IS NULL")->fetchColumn();
  $logged_in = $total - $anonymous;

  $topStmt = $pdo->prepare("
    SELECT s.id, s.kode, s.difficulty,
           st.nama AS subtopik, mp.nama AS mapel,
           COUNT(sv.id) AS views_in_range,
           (SELECT COUNT(*) FROM soal_views WHERE soal_id = s.id) AS views_total
    FROM soal_views sv
    JOIN soal s ON sv.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik     t ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    WHERE sv.viewed_at >= ?
    GROUP BY s.id, s.kode, s.difficulty, st.nama, mp.nama
    ORDER BY views_in_range DESC
    LIMIT 50
  ");
  $topStmt->execute([$since]);

  $dailyStmt = $pdo->prepare("
    SELECT DATE(viewed_at) AS date,
           COUNT(*) AS total,
           SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS anonymous,
           SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) AS logged_in
    FROM soal_views
    WHERE viewed_at >= ?
    GROUP BY DATE(viewed_at)
    ORDER BY date ASC
  ");
  $dailyStmt->execute([$since]);

  echo json_encode([
    'summary' => compact('total', 'today', 'week', 'month', 'anonymous', 'logged_in'),
    'top'     => $topStmt->fetchAll(),
    'daily'   => $dailyStmt->fetchAll(),
  ]);
  exit;
}

// GET /admin/soal/shares  — summary + top soal + daily breakdown
if ($uri === '/admin/soal/shares' && $method === 'GET') {
  $days  = isset($_GET['days']) ? (int)$_GET['days'] : 30;
  $since = $days > 0 ? date('Y-m-d H:i:s', strtotime("-{$days} days")) : '1970-01-01 00:00:00';

  $total     = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares")->fetchColumn();
  $today     = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE created_at >= CURDATE()")->fetchColumn();
  $week      = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
  $whatsapp  = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'whatsapp'")->fetchColumn();
  $telegram  = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'telegram'")->fetchColumn();
  $facebook  = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'facebook'")->fetchColumn();
  $twitter   = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'twitter'")->fetchColumn();
  $threads   = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'threads'")->fetchColumn();
  $email     = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'email'")->fetchColumn();
  $copy      = (int) $pdo->query("SELECT COUNT(*) FROM soal_shares WHERE platform = 'copy'")->fetchColumn();

  $topStmt = $pdo->prepare("
    SELECT s.id, s.kode, s.difficulty,
           st.nama AS subtopik, mp.nama AS mapel,
           COUNT(sh.id) AS shares_in_range,
           (SELECT COUNT(*) FROM soal_shares WHERE soal_id = s.id) AS shares_total
    FROM soal_shares sh
    JOIN soal s ON sh.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik     t ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    WHERE sh.created_at >= ?
    GROUP BY s.id, s.kode, s.difficulty, st.nama, mp.nama
    ORDER BY shares_in_range DESC
    LIMIT 50
  ");
  $topStmt->execute([$since]);

  $dailyStmt = $pdo->prepare("
    SELECT DATE(created_at) AS date,
           COUNT(*) AS total,
           SUM(CASE WHEN platform = 'whatsapp' THEN 1 ELSE 0 END) AS whatsapp,
           SUM(CASE WHEN platform = 'twitter'  THEN 1 ELSE 0 END) AS twitter,
           SUM(CASE WHEN platform = 'threads'  THEN 1 ELSE 0 END) AS threads,
           SUM(CASE WHEN platform = 'copy'     THEN 1 ELSE 0 END) AS copy
    FROM soal_shares
    WHERE created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  ");
  $dailyStmt->execute([$since]);

  echo json_encode([
    'summary' => compact('total', 'today', 'week', 'whatsapp', 'telegram', 'facebook', 'twitter', 'threads', 'email', 'copy'),
    'top'     => $topStmt->fetchAll(),
    'daily'   => $dailyStmt->fetchAll(),
  ]);
  exit;
}

// GET /admin/soal/shares/raw  — paginated raw share log
if (str_starts_with($uri, '/admin/soal/shares/raw') && $method === 'GET') {
  $days   = isset($_GET['days'])  ? (int)$_GET['days']  : 30;
  $page   = isset($_GET['page'])  ? (int)$_GET['page']  : 1;
  $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
  $offset = ($page - 1) * $limit;
  $since  = $days > 0 ? date('Y-m-d H:i:s', strtotime("-{$days} days")) : '1970-01-01 00:00:00';

  $stmt = $pdo->prepare("
    SELECT sh.id, sh.platform, sh.created_at,
           s.id AS soal_id, s.kode AS soal_kode, s.difficulty,
           SUBSTRING(s.body, 1, 80) AS soal_preview,
           st.nama AS subtopik, mp.nama AS mapel,
           u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM soal_shares sh
    JOIN soal s ON sh.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik     t ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    LEFT JOIN users u ON sh.user_id = u.id
    WHERE sh.created_at >= ?
    ORDER BY sh.created_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute([$since]);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM soal_shares WHERE created_at >= ?");
  $totalStmt->execute([$since]);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// ==================
// MATERI
// ==================

// GET /admin/materi/export  — download materi as bulk-import JSON
if ($uri === '/admin/materi/export' && $method === 'GET') {
  $subtopik_id  = $_GET['subtopik_id']  ?? null;
  $search       = trim($_GET['search']  ?? '');
  $is_published = $_GET['is_published'] ?? null;

  $where = []; $params = [];
  if ($subtopik_id !== null && $subtopik_id !== '') { $where[] = 'm.subtopik_id = ?'; $params[] = (int) $subtopik_id; }
  if ($search !== '')       { $where[] = 'm.judul LIKE ?'; $params[] = "%$search%"; }
  if ($is_published !== null && $is_published !== '') { $where[] = 'm.is_published = ?'; $params[] = (int) $is_published; }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.konten, m.highlights, m.pertanyaan, m.is_published, m.urutan
    FROM materi m
    $whereClause
    ORDER BY m.urutan ASC, m.id ASC
    LIMIT 500
  ");
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  foreach ($rows as &$r) {
    $r['id']           = (int)  $r['id'];
    $r['highlights']   = json_decode($r['highlights']  ?? '[]') ?: [];
    $r['pertanyaan']   = json_decode($r['pertanyaan']  ?? '[]') ?: [];
    $r['is_published'] = (bool) $r['is_published'];
    $r['urutan']       = (int)  $r['urutan'];
    if ($r['konten'] === null) unset($r['konten']);
    if (empty($r['highlights']))  unset($r['highlights']);
    if (empty($r['pertanyaan']))  unset($r['pertanyaan']);
  }

  echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

// GET /admin/materi
if ($uri === '/admin/materi' && $method === 'GET') {
  $page        = intval($_GET['page']        ?? 1);
  $limit       = intval($_GET['limit']       ?? 20);
  $offset      = ($page - 1) * $limit;
  $search      = $_GET['search']      ?? '';
  $subtopik_id = isset($_GET['subtopik_id']) && $_GET['subtopik_id'] !== '' ? intval($_GET['subtopik_id']) : null;
  $published   = isset($_GET['published'])   && $_GET['published']   !== '' ? intval($_GET['published'])   : null;

  $where  = [];
  $params = [];
  if ($search) {
    if (ctype_digit($search)) { $where[] = '(m.judul LIKE ? OR m.id = ?)'; $params[] = "%$search%"; $params[] = (int) $search; }
    else                      { $where[] = 'm.judul LIKE ?';               $params[] = "%$search%"; }
  }
  if ($subtopik_id !== null){ $where[] = 'm.subtopik_id = ?'; $params[] = $subtopik_id; }
  if ($published !== null)  { $where[] = 'm.is_published = ?'; $params[] = $published; }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  $orderBy = $subtopik_id !== null
    ? 'm.urutan ASC, m.id ASC'
    : 'm.updated_at DESC, m.id DESC';

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.is_published, m.urutan, m.created_at, m.updated_at,
           (SELECT COUNT(*) FROM materi_views WHERE materi_id = m.id) AS views,
           st.nama AS subtopik, t.nama AS topik,
           mp.nama AS mapel, sj.nama AS subjenjang, j.nama AS jenjang,
           COALESCE(JSON_LENGTH(m.highlights), 0)  AS jumlah_highlights,
           COALESCE(JSON_LENGTH(m.pertanyaan), 0)  AS jumlah_pertanyaan
    FROM materi m
    JOIN subtopik st ON m.subtopik_id = st.id
    JOIN topik    t  ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang    j  ON sj.jenjang_id    = j.id
    $whereClause
    ORDER BY {$orderBy}
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM materi m $whereClause");
  $totalStmt->execute($params);

  echo json_encode([
    'data'            => $stmt->fetchAll(),
    'total'           => (int) $totalStmt->fetchColumn(),
    'page'            => $page,
    'limit'           => $limit,
    'published_count' => (int) $pdo->query('SELECT COUNT(*) FROM materi WHERE is_published = 1')->fetchColumn(),
    'draft_count'     => (int) $pdo->query('SELECT COUNT(*) FROM materi WHERE is_published = 0')->fetchColumn(),
  ]);
  exit;
}

// GET /admin/materi/views/raw — raw per-row data dari materi_views
if ($uri === '/admin/materi/views/raw' && $method === 'GET') {
  $page  = max(1, (int)($_GET['page']  ?? 1));
  $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
  $days  = isset($_GET['days']) ? (int)$_GET['days'] : 30;
  $offset = ($page - 1) * $limit;
  $since = $days > 0
    ? date('Y-m-d H:i:s', strtotime("-{$days} days"))
    : '1970-01-01 00:00:00';

  $stmt = $pdo->prepare("
    SELECT mv.id, mv.viewed_at,
           m.id   AS materi_id, m.judul AS materi_judul,
           u.id   AS user_id,   u.name  AS user_name,  u.email AS user_email
    FROM materi_views mv
    JOIN materi m ON mv.materi_id = m.id
    LEFT JOIN users u ON mv.user_id = u.id
    WHERE mv.viewed_at >= ?
    ORDER BY mv.viewed_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute([$since]);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM materi_views WHERE viewed_at >= ?");
  $totalStmt->execute([$since]);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// GET /admin/materi/views — analytics views dari materi_views
if ($uri === '/admin/materi/views' && $method === 'GET') {
  $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
  $since = $days > 0
    ? date('Y-m-d H:i:s', strtotime("-{$days} days"))
    : '1970-01-01 00:00:00';

  // Summary stats
  $total      = (int) $pdo->query("SELECT COUNT(*) FROM materi_views")->fetchColumn();
  $today      = (int) $pdo->query("SELECT COUNT(*) FROM materi_views WHERE viewed_at >= CURDATE()")->fetchColumn();
  $week       = (int) $pdo->query("SELECT COUNT(*) FROM materi_views WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
  $month      = (int) $pdo->query("SELECT COUNT(*) FROM materi_views WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
  $anonymous  = (int) $pdo->query("SELECT COUNT(*) FROM materi_views WHERE user_id IS NULL")->fetchColumn();
  $logged_in  = $total - $anonymous;

  // Top materi by views dalam range
  $topStmt = $pdo->prepare("
    SELECT m.id, m.judul, m.is_published,
           st.nama AS subtopik, mp.nama AS mapel,
           COUNT(mv.id) AS views_in_range,
           (SELECT COUNT(*) FROM materi_views WHERE materi_id = m.id) AS views_total
    FROM materi_views mv
    JOIN materi m ON mv.materi_id = m.id
    JOIN subtopik st ON m.subtopik_id = st.id
    JOIN topik     t ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    WHERE mv.viewed_at >= ?
    GROUP BY m.id, m.judul, m.is_published, st.nama, mp.nama
    ORDER BY views_in_range DESC
    LIMIT 50
  ");
  $topStmt->execute([$since]);

  // Daily views (last N days)
  $dailyStmt = $pdo->prepare("
    SELECT DATE(viewed_at) AS date,
           COUNT(*) AS total,
           SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS anonymous,
           SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) AS logged_in
    FROM materi_views
    WHERE viewed_at >= ?
    GROUP BY DATE(viewed_at)
    ORDER BY date ASC
  ");
  $dailyStmt->execute([$since]);

  echo json_encode([
    'summary' => compact('total', 'today', 'week', 'month', 'anonymous', 'logged_in'),
    'top'     => $topStmt->fetchAll(),
    'daily'   => $dailyStmt->fetchAll(),
  ]);
  exit;
}

// GET /admin/materi/detail?id=X
if ($uri === '/admin/materi/detail' && $method === 'GET') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare("
    SELECT m.*,
           st.nama AS subtopik, st.id AS subtopik_id,
           t.nama  AS topik,    t.id  AS topik_id,
           mp.nama AS mapel,    mp.id AS mapel_id,
           sj.nama AS subjenjang, sj.id AS subjenjang_id,
           j.nama  AS jenjang,  j.id  AS jenjang_id
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id   = j.id
    WHERE m.id = ?
  ");
  $stmt->execute([$id]);
  $materi = $stmt->fetch();
  if (!$materi) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $materi['highlights']  = json_decode($materi['highlights']  ?? '[]') ?: [];
  $materi['pertanyaan']  = json_decode($materi['pertanyaan']  ?? '[]') ?: [];
  echo json_encode($materi);
  exit;
}

// POST /admin/materi
if ($uri === '/admin/materi' && $method === 'POST') {
  if (empty($body['subtopik_id']) || empty($body['judul'])) {
    http_response_code(400); echo json_encode(['error' => 'subtopik_id dan judul wajib']); exit;
  }
  $stmt = $pdo->prepare('
    INSERT INTO materi (subtopik_id, judul, konten, highlights, pertanyaan, is_published, urutan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([
    $body['subtopik_id'],
    trim($body['judul']),
    $body['konten']       ?? null,
    json_encode($body['highlights']  ?? []),
    json_encode($body['pertanyaan'] ?? []),
    $body['is_published'] ?? 0,
    isset($body['urutan']) ? (int)$body['urutan'] : 0,
  ]);
  http_response_code(201);
  echo json_encode(['id' => (int) $pdo->lastInsertId(), 'message' => 'Materi berhasil ditambahkan']);
  exit;
}

// POST /admin/materi/bulk
if ($uri === '/admin/materi/bulk' && $method === 'POST') {
  $items = $body['items'] ?? null;
  if (!is_array($items) || count($items) === 0) {
    http_response_code(400); echo json_encode(['error' => 'items harus array dan tidak boleh kosong']); exit;
  }
  $stmtInsert = $pdo->prepare('
    INSERT INTO materi (subtopik_id, judul, konten, highlights, pertanyaan, is_published, urutan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ');
  $stmtUpdate = $pdo->prepare('
    UPDATE materi SET subtopik_id=?, judul=?, konten=?, highlights=?, pertanyaan=?, is_published=?, urutan=?, updated_at=NOW()
    WHERE id=?
  ');
  $inserted = 0; $updated = 0; $errors = [];
  foreach ($items as $i => $item) {
    if (empty($item['subtopik_id']) || empty($item['judul'])) {
      $errors[] = "Item #" . ($i + 1) . ": subtopik_id dan judul wajib ada";
      continue;
    }
    $params = [
      (int) $item['subtopik_id'],
      trim($item['judul']),
      $item['konten']       ?? null,
      json_encode($item['highlights']  ?? []),
      json_encode($item['pertanyaan']  ?? []),
      isset($item['is_published']) ? (int)$item['is_published'] : 0,
      isset($item['urutan'])       ? (int)$item['urutan']       : 0,
    ];
    try {
      if (!empty($item['id'])) {
        $stmtUpdate->execute([...$params, (int)$item['id']]);
        $updated++;
      } else {
        $stmtInsert->execute($params);
        $inserted++;
      }
    } catch (Exception $e) {
      $errors[] = "Item #" . ($i + 1) . " (" . $item['judul'] . "): " . $e->getMessage();
    }
  }
  http_response_code(($inserted + $updated) > 0 ? 201 : 400);
  echo json_encode(['inserted' => $inserted, 'updated' => $updated, 'errors' => $errors]);
  exit;
}

// PUT /admin/materi?id=X
if ($uri === '/admin/materi' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }
  if (empty($body['subtopik_id']) || empty($body['judul'])) {
    http_response_code(400); echo json_encode(['error' => 'subtopik_id dan judul wajib']); exit;
  }
  $stmt = $pdo->prepare('
    UPDATE materi
    SET subtopik_id=?, judul=?, konten=?, highlights=?, pertanyaan=?, is_published=?, urutan=?, updated_at=NOW()
    WHERE id=?
  ');
  $stmt->execute([
    $body['subtopik_id'],
    trim($body['judul']),
    $body['konten']        ?? null,
    json_encode($body['highlights']  ?? []),
    json_encode($body['pertanyaan'] ?? []),
    $body['is_published']  ?? 0,
    isset($body['urutan']) ? (int)$body['urutan'] : 0,
    $id,
  ]);
  echo json_encode(['message' => 'Materi berhasil diupdate']);
  exit;
}

// DELETE /admin/materi/bulk  — body: { ids: [1,2,3] }
if ($uri === '/admin/materi/bulk' && $method === 'DELETE') {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $ids  = array_filter(array_map('intval', $body['ids'] ?? []), fn($id) => $id > 0);
  if (empty($ids)) { http_response_code(400); echo json_encode(['error' => 'ids wajib']); exit; }
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $pdo->prepare("DELETE FROM materi WHERE id IN ($placeholders)")->execute($ids);
  echo json_encode(['deleted' => count($ids)]);
  exit;
}

// PUT /admin/materi/reorder — body: { items: [{id, urutan}] }
if ($uri === '/admin/materi/reorder' && $method === 'PUT') {
  $items = $body['items'] ?? [];
  $updated = 0;
  $stmt = $pdo->prepare("UPDATE materi SET urutan = ? WHERE id = ?");
  foreach ($items as $item) {
    $id = (int)($item['id'] ?? 0);
    $urutan = (int)($item['urutan'] ?? 0);
    if ($id > 0) { $stmt->execute([$urutan, $id]); $updated++; }
  }
  echo json_encode(['updated' => $updated]);
  exit;
}

// DELETE /admin/materi?id=X
if ($uri === '/admin/materi' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }
  $pdo->prepare('DELETE FROM materi WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Materi berhasil dihapus']);
  exit;
}

// GET /admin/materi/shares  — summary + top materi + daily breakdown
if ($uri === '/admin/materi/shares' && $method === 'GET') {
  $days = (int) ($_GET['days'] ?? 30);
  $since = $days > 0 ? "DATE_SUB(NOW(), INTERVAL {$days} DAY)" : "'1970-01-01'";

  $total    = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares")->fetchColumn();
  $today    = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE created_at >= CURDATE()")->fetchColumn();
  $week     = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
  $whatsapp = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'whatsapp'")->fetchColumn();
  $telegram = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'telegram'")->fetchColumn();
  $facebook = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'facebook'")->fetchColumn();
  $twitter  = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'twitter'")->fetchColumn();
  $threads  = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'threads'")->fetchColumn();
  $email    = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'email'")->fetchColumn();
  $copy     = (int) $pdo->query("SELECT COUNT(*) FROM materi_shares WHERE platform = 'copy'")->fetchColumn();

  $top = $pdo->query("
    SELECT m.id, m.judul,
           mp.nama AS mapel, st.nama AS subtopik,
           COUNT(sh.id) AS shares_in_range,
           (SELECT COUNT(*) FROM materi_shares WHERE materi_id = m.id) AS shares_total
    FROM materi_shares sh
    JOIN materi m ON sh.materi_id = m.id
    JOIN subtopik st ON m.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel mp ON t.mapel_id = mp.id
    WHERE sh.created_at >= {$since}
    GROUP BY m.id, m.judul, mp.nama, st.nama
    ORDER BY shares_in_range DESC
    LIMIT 20
  ")->fetchAll();

  $daily = $pdo->query("
    SELECT DATE(created_at) AS date, COUNT(*) AS total
    FROM materi_shares
    WHERE created_at >= {$since}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  ")->fetchAll();

  echo json_encode([
    'summary' => compact('total', 'today', 'week', 'whatsapp', 'telegram', 'facebook', 'twitter', 'threads', 'email', 'copy'),
    'top'     => $top,
    'daily'   => $daily,
  ]);
  exit;
}

// GET /admin/materi/shares/raw  — paginated raw share log
if (str_starts_with($uri, '/admin/materi/shares/raw') && $method === 'GET') {
  $days   = (int) ($_GET['days']  ?? 30);
  $page   = max(1, (int) ($_GET['page']  ?? 1));
  $limit  = max(1, min(100, (int) ($_GET['limit'] ?? 10)));
  $offset = ($page - 1) * $limit;
  $since  = $days > 0 ? "DATE_SUB(NOW(), INTERVAL {$days} DAY)" : "'1970-01-01'";

  $data = $pdo->query("
    SELECT sh.id, sh.created_at, sh.platform, sh.ip_address,
           m.id AS materi_id, m.judul AS materi_judul,
           mp.nama AS mapel, st.nama AS subtopik,
           u.name AS user_name
    FROM materi_shares sh
    JOIN materi m ON sh.materi_id = m.id
    JOIN subtopik st ON m.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel mp ON t.mapel_id = mp.id
    LEFT JOIN users u ON sh.user_id = u.id
    WHERE sh.created_at >= {$since}
    ORDER BY sh.created_at DESC
    LIMIT {$limit} OFFSET {$offset}
  ")->fetchAll();

  $since_val = $days > 0 ? date('Y-m-d H:i:s', strtotime("-{$days} days")) : '1970-01-01';
  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM materi_shares WHERE created_at >= ?");
  $totalStmt->execute([$since_val]);
  $total = (int) $totalStmt->fetchColumn();

  echo json_encode(['data' => $data, 'total' => $total]);
  exit;
}

// ── Feature Roadmap (Backlog) ─────────────────────────────────────────────────

// GET /admin/roadmap
if ($uri === '/admin/roadmap' && $method === 'GET') {

  $status   = $_GET['status']   ?? '';
  $category = $_GET['category'] ?? '';
  $priority = $_GET['priority'] ?? '';

  $where = ['1=1'];
  $params = [];
  if ($status)   { $where[] = 'status = ?';   $params[] = $status; }
  if ($category) { $where[] = 'category = ?'; $params[] = $category; }
  if ($priority) { $where[] = 'priority = ?'; $params[] = $priority; }

  $sql = 'SELECT * FROM feature_roadmap WHERE ' . implode(' AND ', $where)
       . ' ORDER BY FIELD(status,"discovery","idea","planned","in_progress","hold","done","cancelled"), FIELD(priority,"high","medium","low"), id DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/roadmap
if ($uri === '/admin/roadmap' && $method === 'POST') {

  $title       = trim($body['title']       ?? '');
  $description = trim($body['description'] ?? '');
  $category    = $body['category'] ?? 'lainnya';
  $priority    = $body['priority'] ?? 'medium';
  $status      = $body['status']   ?? 'idea';
  $notes       = trim($body['notes'] ?? '');

  if (!$title) { http_response_code(400); echo json_encode(['error' => 'title wajib']); exit; }

  $stmt = $pdo->prepare('INSERT INTO feature_roadmap (title, description, category, priority, status, notes) VALUES (?, ?, ?, ?, ?, ?)');
  $stmt->execute([$title, $description ?: null, $category, $priority, $status, $notes ?: null]);
  $id = (int) $pdo->lastInsertId();

  $row = $pdo->prepare('SELECT * FROM feature_roadmap WHERE id = ?');
  $row->execute([$id]);
  echo json_encode($row->fetch());
  exit;
}

// PUT /admin/roadmap/:id
if (preg_match('#^/admin/roadmap/(\d+)$#', $uri, $m) && $method === 'PUT') {

  $id = (int) $m[1];
  $title       = trim($body['title']       ?? '');
  $description = trim($body['description'] ?? '');
  $category    = $body['category'] ?? 'lainnya';
  $priority    = $body['priority'] ?? 'medium';
  $status      = $body['status']   ?? 'idea';
  $notes       = trim($body['notes'] ?? '');

  if (!$title) { http_response_code(400); echo json_encode(['error' => 'title wajib']); exit; }

  $pdo->prepare('UPDATE feature_roadmap SET title=?, description=?, category=?, priority=?, status=?, notes=? WHERE id=?')
      ->execute([$title, $description ?: null, $category, $priority, $status, $notes ?: null, $id]);

  $row = $pdo->prepare('SELECT * FROM feature_roadmap WHERE id = ?');
  $row->execute([$id]);
  echo json_encode($row->fetch());
  exit;
}

// PATCH /admin/roadmap/:id/status
if (preg_match('#^/admin/roadmap/(\d+)/status$#', $uri, $m) && $method === 'PATCH') {

  $id     = (int) $m[1];
  $status = $body['status'] ?? '';
  $valid  = ['discovery', 'idea', 'planned', 'in_progress', 'done', 'cancelled', 'hold'];
  if (!in_array($status, $valid)) { http_response_code(400); echo json_encode(['error' => 'status tidak valid']); exit; }

  $pdo->prepare('UPDATE feature_roadmap SET status=? WHERE id=?')->execute([$status, $id]);
  echo json_encode(['ok' => true]);
  exit;
}

// DELETE /admin/roadmap/:id
if (preg_match('#^/admin/roadmap/(\d+)$#', $uri, $m) && $method === 'DELETE') {

  $id = (int) $m[1];
  $pdo->prepare('DELETE FROM feature_roadmap WHERE id=?')->execute([$id]);
  echo json_encode(['ok' => true]);
  exit;
}

// ── BUG LIST ─────────────────────────────────────────────────────────────────

// GET /admin/bugs
if ($uri === '/admin/bugs' && $method === 'GET') {
  $where  = ['1=1'];
  $params = [];
  if (!empty($_GET['status']))   { $where[] = 'status = ?';   $params[] = $_GET['status']; }
  if (!empty($_GET['severity'])) { $where[] = 'severity = ?'; $params[] = $_GET['severity']; }
  if (!empty($_GET['category'])) { $where[] = 'category = ?'; $params[] = $_GET['category']; }
  $sql  = 'SELECT * FROM bugs WHERE ' . implode(' AND ', $where)
        . ' ORDER BY FIELD(status,"open","in_progress","fixed","wontfix"), FIELD(severity,"critical","high","medium","low"), id DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/bugs
if ($uri === '/admin/bugs' && $method === 'POST') {
  $title       = trim($body['title']    ?? '');
  $description = trim($body['description'] ?? '');
  $steps       = trim($body['steps']    ?? '');
  $severity    = $body['severity']  ?? 'medium';
  $status      = $body['status']    ?? 'open';
  $category    = $body['category']  ?? 'lainnya';
  $notes       = trim($body['notes'] ?? '');
  if (!$title) { http_response_code(400); echo json_encode(['error' => 'title required']); exit; }
  $stmt = $pdo->prepare('INSERT INTO bugs (title, description, steps, severity, status, category, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$title, $description ?: null, $steps ?: null, $severity, $status, $category, $notes ?: null]);
  $id = $pdo->lastInsertId();
  echo json_encode($pdo->query("SELECT * FROM bugs WHERE id = $id")->fetch());
  exit;
}

// PUT /admin/bugs/:id
if (preg_match('#^/admin/bugs/(\d+)$#', $uri, $m) && $method === 'PUT') {
  $id          = (int) $m[1];
  $title       = trim($body['title']    ?? '');
  $description = trim($body['description'] ?? '');
  $steps       = trim($body['steps']    ?? '');
  $severity    = $body['severity']  ?? 'medium';
  $status      = $body['status']    ?? 'open';
  $category    = $body['category']  ?? 'lainnya';
  $notes       = trim($body['notes'] ?? '');
  if (!$title) { http_response_code(400); echo json_encode(['error' => 'title required']); exit; }
  $pdo->prepare('UPDATE bugs SET title=?, description=?, steps=?, severity=?, status=?, category=?, notes=? WHERE id=?')
      ->execute([$title, $description ?: null, $steps ?: null, $severity, $status, $category, $notes ?: null, $id]);
  echo json_encode($pdo->query("SELECT * FROM bugs WHERE id = $id")->fetch());
  exit;
}

// PATCH /admin/bugs/:id/status
if (preg_match('#^/admin/bugs/(\d+)/status$#', $uri, $m) && $method === 'PATCH') {
  $id     = (int) $m[1];
  $status = $body['status'] ?? '';
  $valid  = ['open', 'in_progress', 'fixed', 'wontfix'];
  if (!in_array($status, $valid)) { http_response_code(400); echo json_encode(['error' => 'status tidak valid']); exit; }
  $pdo->prepare('UPDATE bugs SET status=? WHERE id=?')->execute([$status, $id]);
  echo json_encode(['ok' => true]);
  exit;
}

// DELETE /admin/bugs/:id
if (preg_match('#^/admin/bugs/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $id = (int) $m[1];
  $pdo->prepare('DELETE FROM bugs WHERE id=?')->execute([$id]);
  echo json_encode(['ok' => true]);
  exit;
}

// ── WHITEBOARD SESSIONS ──────────────────────────────────────────────────────

// GET /admin/whiteboard
if ($uri === '/admin/whiteboard' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT id, title, created_at, updated_at, JSON_LENGTH(content) AS object_count
    FROM whiteboard_sessions
    ORDER BY updated_at DESC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/whiteboard
if ($uri === '/admin/whiteboard' && $method === 'POST') {
  $title = trim($body['title'] ?? '');
  if (!$title) { http_response_code(400); echo json_encode(['error' => 'title wajib']); exit; }

  $stmt = $pdo->prepare('INSERT INTO whiteboard_sessions (title, content) VALUES (?, ?)');
  $stmt->execute([$title, json_encode([])]);
  $id = (int) $pdo->lastInsertId();

  $row = $pdo->prepare('SELECT id, title, created_at, updated_at, JSON_LENGTH(content) AS object_count FROM whiteboard_sessions WHERE id = ?');
  $row->execute([$id]);
  echo json_encode($row->fetch());
  exit;
}

// GET /admin/whiteboard/:id
if (preg_match('#^/admin/whiteboard/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = (int) $m[1];
  $stmt = $pdo->prepare('SELECT id, title, content, background, created_at, updated_at FROM whiteboard_sessions WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) { http_response_code(404); echo json_encode(['error' => 'Session tidak ditemukan']); exit; }
  $row['content'] = $row['content'] ? json_decode($row['content']) : [];
  echo json_encode($row);
  exit;
}

// PUT /admin/whiteboard/:id
if (preg_match('#^/admin/whiteboard/(\d+)$#', $uri, $m) && $method === 'PUT') {
  $id = (int) $m[1];
  $body = $body ?? [];

  $fields = [];
  $params = [];
  if (array_key_exists('title', $body)) {
    $title = trim($body['title'] ?? '');
    if (!$title) { http_response_code(400); echo json_encode(['error' => 'title wajib']); exit; }
    $fields[] = 'title = ?';
    $params[] = $title;
  }
  if (array_key_exists('content', $body)) {
    $fields[] = 'content = ?';
    $params[] = json_encode($body['content']);
  }
  if (array_key_exists('background', $body)) {
    $bg = $body['background'] ?? 'plain';
    if (!in_array($bg, ['plain', 'dots', 'grid'])) { http_response_code(400); echo json_encode(['error' => 'background tidak valid']); exit; }
    $fields[] = 'background = ?';
    $params[] = $bg;
  }
  if (!$fields) { http_response_code(400); echo json_encode(['error' => 'Tidak ada perubahan']); exit; }

  $params[] = $id;
  $pdo->prepare('UPDATE whiteboard_sessions SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

  $row = $pdo->prepare('SELECT id, title, created_at, updated_at, JSON_LENGTH(content) AS object_count FROM whiteboard_sessions WHERE id = ?');
  $row->execute([$id]);
  echo json_encode($row->fetch());
  exit;
}

// DELETE /admin/whiteboard/:id
if (preg_match('#^/admin/whiteboard/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $id = (int) $m[1];
  $pdo->prepare('DELETE FROM whiteboard_sessions WHERE id = ?')->execute([$id]);
  echo json_encode(['ok' => true]);
  exit;
}

// GET /admin/whiteboard/by-soal-kode?kode=W7OOUZ
// Find or create a whiteboard session pre-attached to the given soal kode.
if ($uri === '/admin/whiteboard/by-soal-kode' && $method === 'GET') {
  $kode = trim($_GET['kode'] ?? '');
  if (!$kode) { http_response_code(400); echo json_encode(['error' => 'kode wajib']); exit; }

  // Resolve kode → soal id
  $soalStmt = $pdo->prepare('SELECT id, kode FROM soal WHERE kode = ?');
  $soalStmt->execute([$kode]);
  $soal = $soalStmt->fetch();
  if (!$soal) { http_response_code(404); echo json_encode(['error' => 'Soal tidak ditemukan']); exit; }
  $soalId = (int) $soal['id'];

  // Look for an existing session whose first page references this soal
  $findStmt = $pdo->prepare("
    SELECT id, title, created_at, updated_at
    FROM whiteboard_sessions
    WHERE JSON_EXTRACT(content, '$[0].soalId') = ?
    ORDER BY updated_at DESC
    LIMIT 1
  ");
  $findStmt->execute([$soalId]);
  $existing = $findStmt->fetch();

  if ($existing) {
    echo json_encode($existing);
    exit;
  }

  // Create a new session with the soal pre-attached to page 1
  $title   = 'Pembahasan: ' . $soal['kode'];
  $content = json_encode([[
    'elements' => [],
    'soalId'   => $soalId,
  ]]);
  $ins = $pdo->prepare('INSERT INTO whiteboard_sessions (title, content) VALUES (?, ?)');
  $ins->execute([$title, $content]);
  $newId = (int) $pdo->lastInsertId();

  $row = $pdo->prepare('SELECT id, title, created_at, updated_at FROM whiteboard_sessions WHERE id = ?');
  $row->execute([$newId]);
  echo json_encode($row->fetch());
  exit;
}

// ── ACTIVE USERS ANALYTICS ───────────────────────────────────────────────────

// GET /admin/analytics/active-users
if ($uri === '/admin/analytics/active-users' && $method === 'GET') {

  $activityUnion = "
    SELECT user_id, DATE(created_at) AS d FROM sessions
    UNION ALL
    SELECT user_id, DATE(created_at) AS d FROM materi_sessions
    UNION ALL
    SELECT user_id, DATE(viewed_at)  AS d FROM soal_views WHERE user_id IS NOT NULL
  ";

  // Daily — last 30 days (fill gaps with 0)
  $daily = [];
  $rows  = $pdo->query("
    SELECT d AS date, COUNT(DISTINCT user_id) AS users
    FROM ($activityUnion) a
    WHERE d >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
    GROUP BY d ORDER BY d ASC
  ")->fetchAll();
  $dailyMap = array_column($rows, 'users', 'date');
  for ($i = 29; $i >= 0; $i--) {
    $date    = date('Y-m-d', strtotime("-$i days"));
    $daily[] = ['date' => $date, 'users' => (int)($dailyMap[$date] ?? 0)];
  }

  // Weekly — last 12 weeks
  $weekly = [];
  $rows   = $pdo->query("
    SELECT YEARWEEK(d, 1) AS wk, MIN(d) AS week_start, COUNT(DISTINCT user_id) AS users
    FROM ($activityUnion) a
    WHERE d >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
    GROUP BY wk ORDER BY wk ASC
  ")->fetchAll();
  $weeklyMap = array_column($rows, 'users', 'wk');
  $weeklyStarts = array_column($rows, 'week_start', 'wk');
  for ($i = 11; $i >= 0; $i--) {
    $wk         = date('oW', strtotime("-$i weeks")); // ISO year+week
    $weekStart  = date('Y-m-d', strtotime("-$i weeks Monday"));
    $weekly[]   = ['week' => $weekStart, 'users' => (int)($weeklyMap[$wk] ?? 0)];
  }

  // Monthly — last 12 months
  $monthly = [];
  $rows    = $pdo->query("
    SELECT DATE_FORMAT(d, '%Y-%m') AS mo, COUNT(DISTINCT user_id) AS users
    FROM ($activityUnion) a
    WHERE d >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY mo ORDER BY mo ASC
  ")->fetchAll();
  $monthlyMap = array_column($rows, 'users', 'mo');
  for ($i = 11; $i >= 0; $i--) {
    $mo        = date('Y-m', strtotime("-$i months"));
    $monthly[] = ['month' => $mo, 'users' => (int)($monthlyMap[$mo] ?? 0)];
  }

  // Avg sessions per active user per day (last 30 days) — attempts only, no views
  $attemptsUnion = "
    SELECT user_id, DATE(created_at) AS d FROM sessions
    UNION ALL
    SELECT user_id, DATE(created_at) AS d FROM materi_sessions
  ";
  $sessRows = $pdo->query("
    SELECT d, COUNT(*) AS sessions, COUNT(DISTINCT user_id) AS users
    FROM ($attemptsUnion) a
    WHERE d >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
    GROUP BY d
  ")->fetchAll();
  $sessMap = [];
  foreach ($sessRows as $r) $sessMap[$r['d']] = $r['sessions'] > 0 ? round($r['sessions'] / $r['users'], 1) : 0;
  $avgSessionsPerUser = [];
  for ($i = 29; $i >= 0; $i--) {
    $date               = date('Y-m-d', strtotime("-$i days"));
    $avgSessionsPerUser[] = ['date' => $date, 'avg' => (float)($sessMap[$date] ?? 0)];
  }

  // New registrations per day (last 30 days)
  $regRows = $pdo->query("
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM users
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
    GROUP BY DATE(created_at)
  ")->fetchAll();
  $regMap = array_column($regRows, 'count', 'date');
  $registrations = [];
  for ($i = 29; $i >= 0; $i--) {
    $date            = date('Y-m-d', strtotime("-$i days"));
    $registrations[] = ['date' => $date, 'count' => (int)($regMap[$date] ?? 0)];
  }

  echo json_encode(compact('daily', 'weekly', 'monthly', 'registrations', 'avgSessionsPerUser'));
  exit;
}

// GET /admin/site-settings
if ($uri === '/admin/site-settings' && $method === 'GET') {
  $rows = $pdo->query("SELECT `key`, `value` FROM site_settings")->fetchAll();
  $out = [];
  foreach ($rows as $r) $out[$r['key']] = (bool)(int)$r['value'];
  echo json_encode($out);
  exit;
}

// POST /admin/site-settings
if ($uri === '/admin/site-settings' && $method === 'POST') {
  $allowed = ['menu_soal', 'menu_materi', 'menu_paket', 'menu_latihan'];
  $stmt = $pdo->prepare("UPDATE site_settings SET `value` = ? WHERE `key` = ?");
  foreach ($allowed as $k) {
    if (array_key_exists($k, $body ?? [])) {
      $stmt->execute([$body[$k] ? '1' : '0', $k]);
    }
  }
  $rows = $pdo->query("SELECT `key`, `value` FROM site_settings")->fetchAll();
  $out = [];
  foreach ($rows as $r) $out[$r['key']] = (bool)(int)$r['value'];
  echo json_encode($out);
  exit;
}
