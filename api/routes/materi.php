<?php
// api/routes/materi.php — public endpoint, no auth required

// GET /materi/:id
if (preg_match('#^/materi/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = (int) $m[1];

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.konten, m.highlights, m.created_at, m.updated_at,
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
  echo json_encode($materi);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
