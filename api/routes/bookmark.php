<?php
// api/routes/bookmark.php

$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

// GET /bookmark — ambil semua bookmark user
if ($uri === '/bookmark' && $method === 'GET') {
  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.difficulty,
           st.nama as subtopik, m.nama as mapel,
           j.nama as jenjang, b.created_at
    FROM bookmarks b
    JOIN soal s ON b.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE b.user_id = ? AND s.is_published = 1
    ORDER BY b.created_at DESC
  ');
  $stmt->execute([$authUser['id']]);
  $bookmarks = $stmt->fetchAll();
  echo json_encode($bookmarks);
  exit;
}

// POST /bookmark — tambah bookmark
if ($uri === '/bookmark' && $method === 'POST') {
  $soal_id = $body['soal_id'] ?? null;
  if (!$soal_id) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_id wajib diisi']);
    exit;
  }

  // Cek soal exists dan published
  $stmt = $pdo->prepare('SELECT id FROM soal WHERE id = ? AND is_published = 1');
  $stmt->execute([$soal_id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Soal tidak ditemukan']);
    exit;
  }

  try {
    $stmt = $pdo->prepare('INSERT INTO bookmarks (user_id, soal_id) VALUES (?, ?)');
    $stmt->execute([$authUser['id'], $soal_id]);
    echo json_encode(['message' => 'Soal disimpan', 'bookmarked' => true]);
  } catch (PDOException $e) {
    // Duplicate entry — sudah di-bookmark
    echo json_encode(['message' => 'Sudah disimpan', 'bookmarked' => true]);
  }
  exit;
}

// DELETE /bookmark?soal_id=xxx
if ($uri === '/bookmark' && $method === 'DELETE') {
  $soal_id = $_GET['soal_id'] ?? null;  // ← dari query string, bukan body
  if (!$soal_id) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_id wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('DELETE FROM bookmarks WHERE user_id = ? AND soal_id = ?');
  $stmt->execute([$authUser['id'], $soal_id]);
  echo json_encode(['message' => 'Bookmark dihapus', 'bookmarked' => false]);
  exit;
}

// GET /bookmark/check?kode=xxx
if ($uri === '/bookmark/check' && $method === 'GET') {
  $kode = $_GET['kode'] ?? null;
  if (!$kode) {
    http_response_code(400);
    echo json_encode(['error' => 'kode wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT b.id FROM bookmarks b
    JOIN soal s ON b.soal_id = s.id
    WHERE b.user_id = ? AND s.kode = ?
  ');
  $stmt->execute([$authUser['id'], $kode]);
  $exists = $stmt->fetch();
  echo json_encode(['bookmarked' => (bool) $exists]);
  exit;
}