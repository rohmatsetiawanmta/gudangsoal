<?php
// api/routes/paket.php — browse endpoints (public)

// GET /paket — list paket published
if ($uri === '/paket' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT p.id, p.nama, p.tahun, p.jenis, p.deskripsi,
           COUNT(pi.id) as jumlah_soal
    FROM paket_soal p
    LEFT JOIN paket_soal_items pi ON pi.paket_id = p.id
    WHERE p.is_published = 1
    GROUP BY p.id
    ORDER BY p.tahun DESC, p.nama ASC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /paket/:id — detail paket + list soal
if (preg_match('#^/paket/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = $m[1];

  $stmt = $pdo->prepare('SELECT * FROM paket_soal WHERE id = ? AND is_published = 1');
  $stmt->execute([$id]);
  $paket = $stmt->fetch();
  if (!$paket) { http_response_code(404); echo json_encode(['error' => 'Paket tidak ditemukan']); exit; }

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
  $authUser = getAuthUser();
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

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
