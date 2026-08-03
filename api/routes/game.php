<?php
// api/routes/game.php

// GET /games/by-topik?topik_slug=barisan-deret
if ($uri === '/games/by-topik' && $method === 'GET') {
  $topik_slug = $_GET['topik_slug'] ?? null;
  if (!$topik_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'topik_slug wajib diisi']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT g.id, g.slug
    FROM game g
    JOIN game_topic gt ON gt.game_id = g.id
    JOIN topik t ON t.id = gt.topik_id
    WHERE t.slug = ? AND t.is_published = 1
    ORDER BY g.id ASC
  ');
  $stmt->execute([$topik_slug]);
  echo json_encode($stmt->fetchAll());
  exit;
}