<?php
// api/routes/upload.php
$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

if ($uri === '/upload/image' && $method === 'POST') {
  if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'File tidak ditemukan']);
    exit;
  }

  $file    = $_FILES['image'];
  $maxSize = 2 * 1024 * 1024;
  $allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Ukuran file maksimal 2MB']);
    exit;
  }

  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime  = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);

  if (!in_array($mime, $allowedMime)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format file harus JPG, PNG, WebP, atau GIF']);
    exit;
  }

  // Tentukan folder
  $folder        = $_GET['folder'] ?? 'uploads';
  $allowedFolder = ['uploads', 'uploads/request'];
  if (!in_array($folder, $allowedFolder)) $folder = 'uploads';

  // Folder uploads (soal) — hanya admin
  // Folder uploads/request — semua user yang login
  if ($folder === 'uploads') {
    $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $role = $stmt->fetchColumn();
    if ($role !== 'admin') {
      http_response_code(403);
      echo json_encode(['error' => 'Forbidden']);
      exit;
    }
  }

  $ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  $uploadDir = __DIR__ . '/../../' . $folder . '/';

  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }

  $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  do {
    $name = '';
    for ($i = 0; $i < 6; $i++) {
      $name .= $chars[random_int(0, strlen($chars) - 1)];
    }
    $filename = $name . '.' . $ext;
  } while (file_exists($uploadDir . $filename));

  if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal menyimpan file']);
    exit;
  }

  $url = 'https://gudangsoal.com/' . $folder . '/' . $filename;
  echo json_encode(['url' => $url, 'filename' => $filename]);
  exit;
}