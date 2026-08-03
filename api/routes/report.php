<?php
// api/routes/report.php

// POST /report — submit report (tidak perlu login)
if ($uri === '/report' && $method === 'POST') {
  $soal_kode  = $body['soal_kode']  ?? null;
  $kategori   = $body['kategori']   ?? null;
  $deskripsi  = $body['deskripsi']  ?? null;

  if (!$soal_kode || !$kategori) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_kode dan kategori wajib']);
    exit;
  }

  $allowed = ['soal_salah', 'jawaban_salah', 'pembahasan_salah', 'typo', 'latex_error', 'duplikat', 'lainnya'];
  if (!in_array($kategori, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Kategori tidak valid']);
    exit;
  }

  // Cek soal ada tidak
  $stmt = $pdo->prepare('SELECT kode FROM soal WHERE kode = ?');
  $stmt->execute([$soal_kode]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Soal tidak ditemukan']);
    exit;
  }

  // Ambil user id kalau login
  $authUser = getAuthUser();
  $user_id  = $authUser ? $authUser['id'] : null;

  // Cek sudah pernah report soal ini dengan kategori yang sama (prevent spam)
  if ($user_id) {
    $stmt = $pdo->prepare('
      SELECT id FROM reports
      WHERE soal_kode = ? AND user_id = ? AND kategori = ? AND status = "pending"
    ');
    $stmt->execute([$soal_kode, $user_id, $kategori]);
    if ($stmt->fetch()) {
      http_response_code(400);
      echo json_encode(['error' => 'Kamu sudah pernah melaporkan soal ini dengan kategori yang sama']);
      exit;
    }
  }

  $stmt = $pdo->prepare('INSERT INTO reports (soal_kode, user_id, kategori, deskripsi) VALUES (?, ?, ?, ?)');
  $stmt->execute([$soal_kode, $user_id, $kategori, $deskripsi]);

  echo json_encode(['message' => 'Laporan berhasil dikirim, terima kasih!']);
  exit;
}