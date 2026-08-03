<?php
// api/routes/changelog.php

// GET /changelog — public, list semua yang published
if ($uri === '/changelog' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT * FROM changelogs
    WHERE is_published = 1 AND audience != "admin"
    ORDER BY released_at DESC, id ASC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}