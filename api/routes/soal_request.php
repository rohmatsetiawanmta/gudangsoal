<?php
// api/routes/soal_request.php

// POST /soal-request
if ($uri === '/soal-request' && $method === 'POST') {
  $authUser = getAuthUser();
  if (!$authUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Login diperlukan']);
    exit;
  }

  $soal_body = $body['body']     ?? null;  // ganti nama variable
  $foto_url  = $body['foto_url'] ?? null;
  $catatan   = $body['catatan']  ?? null;

  if (!$soal_body || !trim($soal_body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Isi soal wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('
    INSERT INTO soal_requests (user_id, body, foto_url, catatan)
    VALUES (?, ?, ?, ?)
  ');
  $stmt->execute([$authUser['id'], trim($soal_body), $foto_url, $catatan]);

  echo json_encode(['message' => 'Request soal berhasil dikirim!']);
  exit;
}

// GET /soal-request — list request milik user yang login
if ($uri === '/soal-request' && $method === 'GET') {
  $authUser = getAuthUser();
  if (!$authUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Login diperlukan']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT sr.*, s.kode as linked_soal_kode
    FROM soal_requests sr
    LEFT JOIN soal s ON sr.soal_kode = s.kode
    WHERE sr.user_id = ?
    ORDER BY sr.created_at DESC
  ');
  $stmt->execute([$authUser['id']]);

  echo json_encode($stmt->fetchAll());
  exit;
}