<?php
// api/routes/feedback.php

$authUser = getAuthUser(); // nullable — tidak wajib login

// POST /feedback — kirim feedback
if ($uri === '/feedback' && $method === 'POST') {
  $kategori   = $body['kategori']  ?? 'lainnya';
  $judul      = trim($body['judul'] ?? '');
  $deskripsi  = trim($body['deskripsi'] ?? '');

  if (!$judul || !$deskripsi) {
    http_response_code(400);
    echo json_encode(['error' => 'Judul dan deskripsi wajib diisi']);
    exit;
  }

  $allowed_kategori = ['saran_fitur', 'bug', 'minta_topik', 'kualitas_konten', 'lainnya'];
  if (!in_array($kategori, $allowed_kategori)) $kategori = 'lainnya';

  $stmt = $pdo->prepare('
    INSERT INTO feedback (user_id, kategori, judul, deskripsi)
    VALUES (?, ?, ?, ?)
  ');
  $stmt->execute([
    $authUser['id'] ?? null,
    $kategori,
    $judul,
    $deskripsi,
  ]);

  http_response_code(201);
  echo json_encode(['message' => 'Masukan berhasil dikirim, terima kasih!']);
  exit;
}

// GET /feedback — ambil feedback milik user yang login
if ($uri === '/feedback' && $method === 'GET') {
  if (!$authUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT id, kategori, judul, deskripsi, status, catatan, created_at
    FROM feedback
    WHERE user_id = ?
    ORDER BY created_at DESC
  ');
  $stmt->execute([$authUser['id']]);
  echo json_encode($stmt->fetchAll());
  exit;
}