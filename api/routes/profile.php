<?php
// api/routes/profile.php

$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

// GET /profile
if ($uri === '/profile' && $method === 'GET') {
  $stmt = $pdo->prepare('SELECT id, name, email, xp, streak, soal_streak, soal_streak_best, role FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();

  // Badge
  $stmt = $pdo->prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC');
  $stmt->execute([$authUser['id']]);
  $badges = $stmt->fetchAll();

  // Riwayat soal — 20 terakhir
  $stmt = $pdo->prepare('
    SELECT s.kode, s.body, s.difficulty,
           st.nama as subtopik, m.nama as mapel,
           j.nama as jenjang, se.is_correct, se.created_at
    FROM sessions se
    JOIN soal s ON se.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE se.user_id = ?
    ORDER BY se.created_at DESC
    LIMIT 20
  ');
  $stmt->execute([$authUser['id']]);
  $riwayat = $stmt->fetchAll();

  // Stats
  $stmt = $pdo->prepare('SELECT COUNT(*) as total, SUM(is_correct) as benar FROM sessions WHERE user_id = ?');
  $stmt->execute([$authUser['id']]);
  $stats = $stmt->fetch();

  // XP History — 20 terakhir
  $stmt = $pdo->prepare('
    SELECT xp, reason, soal_kode, created_at
    FROM xp_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  ');
  $stmt->execute([$authUser['id']]);
  $xpHistory = $stmt->fetchAll();

  echo json_encode([
    'user'       => $user,
    'badges'     => $badges,
    'riwayat'    => $riwayat,
    'stats'      => $stats,
    'xp_history' => $xpHistory,
  ]);
  exit;
}

// PUT /profile
if ($uri === '/profile' && $method === 'PUT') {
  if (empty($body['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nama wajib diisi']);
    exit;
  }

  // Update nama
  $stmt = $pdo->prepare('UPDATE users SET name = ? WHERE id = ?');
  $stmt->execute([$body['name'], $authUser['id']]);

  // Update password kalau ada
  if (!empty($body['new_password'])) {
    if (empty($body['current_password'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Password lama wajib diisi']);
      exit;
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();

    if (!password_verify($body['current_password'], $user['password'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Password lama tidak sesuai']);
      exit;
    }

    if (strlen($body['new_password']) < 8) {
      http_response_code(400);
      echo json_encode(['error' => 'Password baru minimal 8 karakter']);
      exit;
    }

    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([password_hash($body['new_password'], PASSWORD_DEFAULT), $authUser['id']]);
  }

  echo json_encode(['message' => 'Profil berhasil diupdate']);
  exit;
}

// POST /profile/session
if ($uri === '/profile/session' && $method === 'POST') {
  $soal_id    = $body['soal_id']    ?? null;
  $kode       = $body['kode']       ?? null;
  $is_correct = $body['is_correct'] ?? 0;
  $difficulty = $body['difficulty'] ?? 1;

  if (!$soal_id || !$kode) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_id dan kode wajib']);
    exit;
  }

  // Cek apakah sudah pernah jawab soal ini sebelumnya
  $stmt = $pdo->prepare('SELECT id, is_correct FROM sessions WHERE user_id = ? AND soal_id = ? ORDER BY created_at ASC LIMIT 1');
  $stmt->execute([$authUser['id'], $soal_id]);
  $firstAttempt = $stmt->fetch();
  $isFirstTime  = !$firstAttempt;

  // Selalu simpan attempt baru
  $stmt = $pdo->prepare('INSERT INTO sessions (user_id, soal_id, kode, is_correct) VALUES (?, ?, ?, ?)');
  $stmt->execute([$authUser['id'], $soal_id, $kode, $is_correct]);

  // Ambil data user
  $stmt = $pdo->prepare('SELECT streak, last_active, soal_streak, soal_streak_best FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $user = $stmt->fetch();

  $xpEarned = 0;

  // XP hanya dihitung kalau pertama kali jawab DAN benar
  if ($isFirstTime && $is_correct) {

    // 1. Base XP berdasarkan difficulty
    $baseXP = match((int)$difficulty) {
      1 => 10,
      2 => 20,
      3 => 30,
      default => 10,
    };

    // 2. Streak hari bonus
    $streak = (int) $user['streak'];
    $dayBonusPercent = match(true) {
      $streak >= 30 => 50,
      $streak >= 21 => 40,
      $streak >= 11 => 30,
      $streak >= 6  => 20,
      $streak >= 3  => 10,
      default       => 0,
    };

    // 3. Streak soal bonus
    $soalStreak = (int) $user['soal_streak'];
    $soalBonusPercent = match(true) {
      $soalStreak >= 75 => 50,
      $soalStreak >= 51 => 40,
      $soalStreak >= 31 => 30,
      $soalStreak >= 16 => 20,
      $soalStreak >= 6  => 10,
      default           => 0,
    };

    // Total bonus
    $totalBonusPercent = $dayBonusPercent + $soalBonusPercent;
    $bonus    = (int) ceil($baseXP * $totalBonusPercent / 100);
    $xpEarned = $baseXP + $bonus;

    // Update XP user
    $stmt = $pdo->prepare('UPDATE users SET xp = xp + ? WHERE id = ?');
    $stmt->execute([$xpEarned, $authUser['id']]);

    // Catat ke xp_history
    $diffLabel = match((int)$difficulty) {
      1 => 'Easy',
      2 => 'Medium',
      3 => 'Hard',
      default => 'Easy',
    };

    $reason = "Soal $diffLabel";
    if ($totalBonusPercent > 0) {
      $reason .= " (+{$totalBonusPercent}% bonus streak)";
    }

    $stmt = $pdo->prepare('INSERT INTO xp_history (user_id, xp, reason, soal_kode) VALUES (?, ?, ?, ?)');
    $stmt->execute([$authUser['id'], $xpEarned, $reason, $kode]);
  }

  // Update soal_streak
  $newSoalStreak     = $is_correct ? (int) $user['soal_streak'] + 1 : 0;
  $newSoalStreakBest  = max($newSoalStreak, (int) $user['soal_streak_best']);

  $stmt = $pdo->prepare('UPDATE users SET soal_streak = ?, soal_streak_best = ? WHERE id = ?');
  $stmt->execute([$newSoalStreak, $newSoalStreakBest, $authUser['id']]);

  // Update streak hari — hanya kalau pertama kali aktif hari ini
  updateDailyStreak($pdo, $authUser['id']);

  // Ambil data terbaru
  $stmt = $pdo->prepare('SELECT xp, streak, soal_streak, soal_streak_best FROM users WHERE id = ?');
  $stmt->execute([$authUser['id']]);
  $updated = $stmt->fetch();

  echo json_encode([
    'message'          => 'Session tersimpan',
    'xp_earned'        => $xpEarned,
    'is_first'         => $isFirstTime,
    'soal_streak'      => (int) $updated['soal_streak'],
    'soal_streak_best' => (int) $updated['soal_streak_best'],
    'xp_total'         => (int) $updated['xp'],
  ]);
  exit;
}

// GET /profile/riwayat?filter=semua&page=1
if ($uri === '/profile/riwayat' && $method === 'GET') {
  $filter = $_GET['filter'] ?? 'semua';
  $page   = intval($_GET['page'] ?? 1);
  $limit  = 10;
  $offset = ($page - 1) * $limit;

  $where = 'WHERE se.user_id = ?';
  if ($filter === 'benar') $where .= ' AND se.is_correct = 1';
  if ($filter === 'salah') $where .= ' AND se.is_correct = 0';

$stmt = $pdo->prepare("
  SELECT s.kode, s.body, s.difficulty,
         st.nama as subtopik, m.nama as mapel,
         j.nama as jenjang,
         MAX(se.is_correct) as is_correct,
         COUNT(se.id) as total_attempt,
         MAX(se.created_at) as created_at
  FROM sessions se
  JOIN soal s ON se.soal_id = s.id
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  JOIN subjenjang sj ON m.subjenjang_id = sj.id
  JOIN jenjang j ON sj.jenjang_id = j.id
  $where
  GROUP BY s.id, s.kode, s.body, s.difficulty, st.nama, m.nama, j.nama
  ORDER BY MAX(se.created_at) DESC
  LIMIT $limit OFFSET $offset
");

  $stmt->execute([$authUser['id']]);
  $riwayat = $stmt->fetchAll();

$totalStmt = $pdo->prepare("
  SELECT COUNT(DISTINCT se.soal_id)
  FROM sessions se
  JOIN soal s ON se.soal_id = s.id
  $where
");
$totalStmt->execute([$authUser['id']]);

  echo json_encode([
    'data'  => $riwayat,
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// GET /profile/reports — laporan soal milik user
if ($uri === '/profile/reports' && $method === 'GET') {
  $stmt = $pdo->prepare('
    SELECT r.id, r.soal_kode, r.kategori, r.deskripsi,
           r.status, r.admin_notes, r.created_at,
           s.body as soal_body
    FROM reports r
    JOIN soal s ON r.soal_kode = s.kode
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  ');
  $stmt->execute([$authUser['id']]);
  echo json_encode($stmt->fetchAll());
  exit;
}