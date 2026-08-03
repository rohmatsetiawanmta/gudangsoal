<?php
// api/routes/notifications.php

$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

// GET /notifications — ambil notif + unread count
if ($uri === '/notifications' && $method === 'GET') {
  $stmt = $pdo->prepare('
    SELECT id, tipe, judul, pesan, link, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  ');
  $stmt->execute([$authUser['id']]);
  $notifs = $stmt->fetchAll();

  $countStmt = $pdo->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0');
  $countStmt->execute([$authUser['id']]);
  $unread = (int) $countStmt->fetchColumn();

  echo json_encode(['data' => $notifs, 'unread' => $unread]);
  exit;
}

// PUT /notifications/read — tandai semua dibaca
if ($uri === '/notifications/read' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;

  if ($id) {
    // Tandai satu dibaca
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $authUser['id']]);
  } else {
    // Tandai semua dibaca
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
    $stmt->execute([$authUser['id']]);
  }

  echo json_encode(['message' => 'Notifikasi ditandai dibaca']);
  exit;
}