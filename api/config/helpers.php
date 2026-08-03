<?php

function effectiveStreak($streak, $lastActive) {
  if (!$lastActive) return 0;
  $yesterday = date('Y-m-d', strtotime('-1 day'));
  $today     = date('Y-m-d');
  if ($lastActive === $today || $lastActive === $yesterday) return (int) $streak;
  return 0;
}

function updateDailyStreak($pdo, $userId) {
  $stmt = $pdo->prepare('SELECT last_active FROM users WHERE id = ?');
  $stmt->execute([$userId]);
  $user = $stmt->fetch();

  $today      = date('Y-m-d');
  $yesterday  = date('Y-m-d', strtotime('-1 day'));
  $lastActive = $user['last_active'] ?? null;

  if ($lastActive !== $today) {
    if ($lastActive === $yesterday) {
      $stmt = $pdo->prepare('UPDATE users SET streak = streak + 1, last_active = ? WHERE id = ?');
      $stmt->execute([$today, $userId]);
    } else {
      $stmt = $pdo->prepare('UPDATE users SET streak = 1, last_active = ? WHERE id = ?');
      $stmt->execute([$today, $userId]);
    }
  }
}

function calculateQuizXP($score, $total, $maxXP) {
  if ($total === 0) return 0;
  $persen = ($score / $total) * 100;
  if ($persen < 50)       return 0;
  if ($persen < 60)       return (int) round($maxXP * 0.25);
  if ($persen < 75)       return (int) round($maxXP * 0.50);
  if ($persen < 90)       return (int) round($maxXP * 0.75);
  return $maxXP;
}