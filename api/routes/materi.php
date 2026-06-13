<?php
// api/routes/materi.php — public endpoint, no auth required

// GET /materi/:id
if (preg_match('#^/materi/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = (int) $m[1];

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.konten, m.highlights, m.urutan, m.views,
           m.created_at, m.updated_at,
           st.nama AS subtopik, st.id AS subtopik_id,
           t.nama  AS topik,    t.id  AS topik_id,
           mp.nama AS mapel,    mp.id AS mapel_id,
           sj.nama AS subjenjang,
           j.nama  AS jenjang,  j.slug AS jenjang_slug
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id   = j.id
    WHERE m.id = ? AND m.is_published = 1
  ");
  $stmt->execute([$id]);
  $materi = $stmt->fetch();

  if (!$materi) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $materi['highlights'] = json_decode($materi['highlights'] ?? '[]');

  // prev/next within same subtopik, ordered by urutan then id
  $prev = $pdo->prepare("
    SELECT id, judul FROM materi
    WHERE subtopik_id = ? AND is_published = 1
      AND (urutan < ? OR (urutan = ? AND id < ?))
    ORDER BY urutan DESC, id DESC LIMIT 1
  ");
  $prev->execute([$materi['subtopik_id'], $materi['urutan'], $materi['urutan'], $id]);
  $materi['prev'] = $prev->fetch() ?: null;

  $next = $pdo->prepare("
    SELECT id, judul FROM materi
    WHERE subtopik_id = ? AND is_published = 1
      AND (urutan > ? OR (urutan = ? AND id > ?))
    ORDER BY urutan ASC, id ASC LIMIT 1
  ");
  $next->execute([$materi['subtopik_id'], $materi['urutan'], $materi['urutan'], $id]);
  $materi['next'] = $next->fetch() ?: null;

  echo json_encode($materi);
  exit;
}

// POST /materi/:id/view  — increment views (fire-and-forget)
if (preg_match('#^/materi/(\d+)/view$#', $uri, $m) && $method === 'POST') {
  $id = (int) $m[1];
  $pdo->prepare('UPDATE materi SET views = views + 1 WHERE id = ? AND is_published = 1')->execute([$id]);
  echo json_encode(['ok' => true]);
  exit;
}

// POST /materi/:id/report
if (preg_match('#^/materi/(\d+)/report$#', $uri, $m) && $method === 'POST') {
  $id    = (int) $m[1];
  $body  = json_decode(file_get_contents('php://input'), true) ?? [];
  $alasan    = trim($body['alasan']    ?? '');
  $deskripsi = trim($body['deskripsi'] ?? '');

  if (!$alasan) { http_response_code(400); echo json_encode(['error' => 'alasan wajib']); exit; }

  // Verify materi exists
  $exists = $pdo->prepare('SELECT id FROM materi WHERE id = ? AND is_published = 1');
  $exists->execute([$id]);
  if (!$exists->fetch()) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $pdo->prepare('INSERT INTO materi_reports (materi_id, alasan, deskripsi) VALUES (?, ?, ?)')
      ->execute([$id, $alasan, $deskripsi ?: null]);

  echo json_encode(['message' => 'Laporan berhasil dikirim']);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
