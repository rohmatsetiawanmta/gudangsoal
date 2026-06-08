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

  $token = generateToken(['id' => $user['id'], 'email' => $user['email']]);

  echo json_encode([
    'user' => [
      'id'     => $user['id'],
      'name'   => $user['name'],
      'email'  => $user['email'],
      'xp'     => $user['xp'],
      'streak' => $user['streak'],
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

  $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  $stmt->execute([
    $body['name'],
    $body['email'],
    password_hash($body['password'], PASSWORD_DEFAULT),
    'user',
  ]);
  $id = $pdo->lastInsertId();

  $token = generateToken(['id' => $id, 'email' => $body['email']]);

  http_response_code(201);
  echo json_encode([
    'user' => [
      'id'     => $id,
      'name'   => $body['name'],
      'email'  => $body['email'],
      'xp'     => 0,
      'streak' => 0,
      'role'   => 'user',
    ],
    'token' => $token,
  ]);
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

  $stmt = $pdo->prepare('SELECT id, name, email, xp, streak, role FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();

  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User tidak ditemukan']);
    exit;
  }

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