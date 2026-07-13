<?php
// api/routes/auth.php

// POST /auth/login
if ($uri === '/auth/login' && $method === 'POST') {

  if (empty($body['email']) || empty($body['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email dan password wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
  $stmt->execute([$body['email']]);
  $user = $stmt->fetch();

  if (!$user || !password_verify($body['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah']);
    exit;
  }

  if (!$user['email_verified']) {
    http_response_code(403);
    echo json_encode([
      'error'      => 'Email belum diverifikasi. Cek inbox kamu dan klik link konfirmasi.',
      'unverified' => true,
      'email'      => $user['email'],
    ]);
    exit;
  }

  $token = generateToken(['id' => $user['id'], 'email' => $user['email']]);

  echo json_encode([
    'user' => [
      'id'     => $user['id'],
      'name'   => $user['name'],
      'email'  => $user['email'],
      'xp'     => $user['xp'],
      'streak' => effectiveStreak($user['streak'], $user['last_active']),
      'role'   => $user['role'],
    ],
    'token' => $token,
  ]);
  exit;
}

// POST /auth/register
if ($uri === '/auth/register' && $method === 'POST') {

  if (empty($body['name']) || empty($body['email']) || empty($body['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nama, email, dan password wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
  $stmt->execute([$body['email']]);
  if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email sudah terdaftar']);
    exit;
  }

  $verificationToken   = bin2hex(random_bytes(32));
  $verificationExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));

  $stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_expires_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)'
  );
  $stmt->execute([
    $body['name'],
    $body['email'],
    password_hash($body['password'], PASSWORD_DEFAULT),
    'user',
    $verificationToken,
    $verificationExpires,
  ]);

  require_once __DIR__ . '/../config/mailer.php';
  $sent = sendVerificationEmail($body['email'], $body['name'], $verificationToken);

  http_response_code(201);
  echo json_encode([
    'message' => $sent
      ? 'Akun berhasil dibuat! Cek email kamu untuk konfirmasi.'
      : 'Akun berhasil dibuat, tapi email gagal dikirim. Gunakan fitur kirim ulang.',
    'email' => $body['email'],
  ]);
  exit;
}

// GET /auth/verify-email
if ($uri === '/auth/verify-email' && $method === 'GET') {

  $token = $_GET['token'] ?? '';
  if (!$token) {
    http_response_code(400);
    echo json_encode(['error' => 'Token tidak ditemukan']);
    exit;
  }

  $stmt = $pdo->prepare(
    'SELECT id, name, email FROM users
     WHERE verification_token = ? AND verification_expires_at > NOW() AND email_verified = 0'
  );
  $stmt->execute([$token]);
  $user = $stmt->fetch();

  if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'Link tidak valid atau sudah kedaluwarsa. Minta link baru.']);
    exit;
  }

  $stmt = $pdo->prepare(
    'UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE id = ?'
  );
  $stmt->execute([$user['id']]);

  echo json_encode(['message' => 'Email berhasil dikonfirmasi! Silakan login.']);
  exit;
}

// POST /auth/resend-verification
if ($uri === '/auth/resend-verification' && $method === 'POST') {

  if (empty($body['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id, name, email, email_verified FROM users WHERE email = ?');
  $stmt->execute([$body['email']]);
  $user = $stmt->fetch();

  // Selalu response sama supaya tidak leak apakah email terdaftar
  if (!$user || $user['email_verified']) {
    echo json_encode(['message' => 'Jika email terdaftar dan belum diverifikasi, link baru telah dikirim.']);
    exit;
  }

  $verificationToken   = bin2hex(random_bytes(32));
  $verificationExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));

  $stmt = $pdo->prepare(
    'UPDATE users SET verification_token = ?, verification_expires_at = ? WHERE id = ?'
  );
  $stmt->execute([$verificationToken, $verificationExpires, $user['id']]);

  require_once __DIR__ . '/../config/mailer.php';
  sendVerificationEmail($user['email'], $user['name'], $verificationToken);

  echo json_encode(['message' => 'Jika email terdaftar dan belum diverifikasi, link baru telah dikirim.']);
  exit;
}

// GET /auth/profile
if ($uri === '/auth/profile' && $method === 'GET') {

  $authUser = getAuthUser();
  if (!$authUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id, name, email, xp, streak, last_active, role FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();

  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User tidak ditemukan']);
    exit;
  }

  $user['streak'] = effectiveStreak($user['streak'], $user['last_active']);
  unset($user['last_active']);
  echo json_encode($user);
  exit;
}

// PUT /auth/profile
if ($uri === '/auth/profile' && $method === 'PUT') {

  $authUser = getAuthUser();
  if (!$authUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
  }

  if (empty($body['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nama wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE users SET name = ? WHERE id = ?');
  $stmt->execute([$body['name'], $authUser['id']]);

  echo json_encode(['message' => 'Profile berhasil diupdate']);
  exit;
}
