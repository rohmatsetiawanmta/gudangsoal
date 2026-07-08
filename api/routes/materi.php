<?php
// api/routes/materi.php — public endpoint, no auth required

// GET /materi/:id
if (preg_match('#^/materi/(\d+)$#', $uri, $m) && $method === 'GET') {
  $id = (int) $m[1];

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.konten, m.highlights, m.pertanyaan, m.urutan, m.views,
           m.created_at, m.updated_at,
           st.nama AS subtopik, st.id AS subtopik_id, st.slug AS subtopik_slug,
           t.nama  AS topik,    t.id  AS topik_id,    t.slug  AS topik_slug,
           mp.nama AS mapel,    mp.id AS mapel_id,    mp.slug AS mapel_slug,
           sj.nama AS subjenjang,                     sj.slug AS subjenjang_slug,
           j.nama  AS jenjang,  j.slug AS jenjang_slug
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id   = j.id
    WHERE m.id = ? AND m.is_published = 1
      AND st.is_published = 1 AND t.is_published = 1
      AND mp.is_published = 1 AND sj.is_published = 1 AND j.is_published = 1
  ");
  $stmt->execute([$id]);
  $materi = $stmt->fetch();

  if (!$materi) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $materi['highlights']  = json_decode($materi['highlights']  ?? '[]') ?: [];
  $materi['pertanyaan']  = json_decode($materi['pertanyaan']  ?? '[]') ?: [];

  // prev/next within same subtopik, ordered by urutan then id
  $prev = $pdo->prepare("
    SELECT id, judul FROM materi
    WHERE subtopik_id = ? AND is_published = 1
      AND (urutan < ? OR (urutan = ? AND id < ?))
    ORDER BY urutan DESC, id DESC LIMIT 1
  ");
  $prev->execute([$materi['subtopik_id'], $materi['urutan'], $materi['urutan'], $id]);
  $materi['prev'] = $prev->fetch() ?: null;

  $next = $pdo->prepare("
    SELECT id, judul FROM materi
    WHERE subtopik_id = ? AND is_published = 1
      AND (urutan > ? OR (urutan = ? AND id > ?))
    ORDER BY urutan ASC, id ASC LIMIT 1
  ");
  $next->execute([$materi['subtopik_id'], $materi['urutan'], $materi['urutan'], $id]);
  $materi['next'] = $next->fetch() ?: null;

  $sibStmt = $pdo->prepare("SELECT id, judul, urutan FROM materi WHERE subtopik_id = ? AND is_published = 1 ORDER BY urutan ASC, id ASC");
  $sibStmt->execute([$materi['subtopik_id']]);
  $materi['siblings'] = $sibStmt->fetchAll();

  echo json_encode($materi);
  exit;
}

// POST /materi/:id/view  — increment views (fire-and-forget)
if (preg_match('#^/materi/(\d+)/view$#', $uri, $m) && $method === 'POST') {
  $id = (int) $m[1];
  $pdo->prepare('UPDATE materi SET views = views + 1 WHERE id = ? AND is_published = 1')->execute([$id]);
  echo json_encode(['ok' => true]);
  exit;
}

// GET /materi/:id/my-answers  — load user's previous quiz answers for this materi
if (preg_match('#^/materi/(\d+)/my-answers$#', $uri, $m) && $method === 'GET') {
  $materi_id = (int) $m[1];
  $authUser  = getAuthUser();
  if (!$authUser) { echo json_encode([]); exit; }

  $stmt = $pdo->prepare('SELECT question_index, is_correct, user_answer FROM materi_sessions WHERE user_id = ? AND materi_id = ?');
  $stmt->execute([$authUser['id'], $materi_id]);
  $rows = $stmt->fetchAll();

  $result = [];
  foreach ($rows as $row) {
    $result[(int) $row['question_index']] = [
      'is_correct'  => (bool) $row['is_correct'],
      'user_answer' => $row['user_answer'] ?? '',
    ];
  }

  echo json_encode($result);
  exit;
}

// POST /materi/:id/answer  — record mini quiz answer, award XP on first correct
if (preg_match('#^/materi/(\d+)/answer$#', $uri, $m) && $method === 'POST') {
  $materi_id = (int) $m[1];
  $authUser  = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Login diperlukan']); exit; }

  $body           = json_decode(file_get_contents('php://input'), true) ?? [];
  $question_index = isset($body['question_index']) ? (int) $body['question_index'] : -1;
  $user_answer    = trim((string) ($body['user_answer'] ?? ''));

  $stmt = $pdo->prepare('SELECT pertanyaan FROM materi WHERE id = ? AND is_published = 1');
  $stmt->execute([$materi_id]);
  $materi = $stmt->fetch();
  if (!$materi) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $pertanyaan = json_decode($materi['pertanyaan'] ?? '[]', true) ?: [];
  if ($question_index < 0 || !isset($pertanyaan[$question_index])) {
    http_response_code(400); echo json_encode(['error' => 'Pertanyaan tidak ditemukan']); exit;
  }

  $q      = $pertanyaan[$question_index];
  $tipe   = $q['tipe']   ?? 'pilihan_ganda';
  $jawaban = $q['jawaban'] ?? '';

  if ($tipe === 'isian_numerik') {
    $is_correct = abs(floatval($user_answer) - floatval($jawaban)) < 1e-9;
  } elseif ($tipe === 'isian_singkat') {
    $is_correct = strtolower(trim($user_answer)) === strtolower(trim($jawaban));
  } else {
    // pilihan_ganda: user sends label (A/B/C); normalize jawaban to label for backward compat
    $optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (in_array($jawaban, $optionLabels)) {
      $is_correct = $user_answer === $jawaban;
    } else {
      $pilihan = array_values($q['pilihan'] ?? []);
      $idx = array_search($jawaban, $pilihan);
      $correctLabel = $idx !== false ? $optionLabels[$idx] : null;
      $is_correct = $correctLabel !== null && $user_answer === $correctLabel;
    }
  }

  // Check if already answered
  $stmt = $pdo->prepare('SELECT id FROM materi_sessions WHERE user_id = ? AND materi_id = ? AND question_index = ? LIMIT 1');
  $stmt->execute([$authUser['id'], $materi_id, $question_index]);
  $existing = $stmt->fetch();

  if (!$existing) {
    $pdo->prepare('INSERT INTO materi_sessions (user_id, materi_id, question_index, is_correct, user_answer) VALUES (?, ?, ?, ?, ?)')
        ->execute([$authUser['id'], $materi_id, $question_index, $is_correct ? 1 : 0, $user_answer]);
  }

  $xpEarned = 0;
  if (!$existing && $is_correct) {
    $baseXP = 10;

    $stmt = $pdo->prepare('SELECT streak, soal_streak, soal_streak_best FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();

    $streak = (int) ($user['streak'] ?? 0);
    $dayBonusPct = match(true) {
      $streak >= 30 => 50,
      $streak >= 21 => 40,
      $streak >= 11 => 30,
      $streak >= 6  => 20,
      $streak >= 3  => 10,
      default       => 0,
    };
    $soalStreak = (int) ($user['soal_streak'] ?? 0);
    $soalBonusPct = match(true) {
      $soalStreak >= 75 => 50,
      $soalStreak >= 51 => 40,
      $soalStreak >= 31 => 30,
      $soalStreak >= 16 => 20,
      $soalStreak >= 6  => 10,
      default            => 0,
    };

    $totalBonusPct = $dayBonusPct + $soalBonusPct;
    $bonus    = (int) ceil($baseXP * $totalBonusPct / 100);
    $xpEarned = $baseXP + $bonus;

    $pdo->prepare('UPDATE users SET xp = xp + ? WHERE id = ?')->execute([$xpEarned, $authUser['id']]);

    $reason = 'Materi Quiz (Easy)';
    if ($totalBonusPct > 0) $reason .= " (+{$totalBonusPct}% streak)";
    $pdo->prepare('INSERT INTO xp_history (user_id, xp, reason, soal_kode) VALUES (?, ?, ?, NULL)')
        ->execute([$authUser['id'], $xpEarned, $reason]);
  }

  if (!$existing) {
    // soal_streak: increment on correct, reset on wrong
    $stmt = $pdo->prepare('SELECT soal_streak, soal_streak_best FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $streakUser        = $stmt->fetch();
    $newSoalStreak     = $is_correct ? (int)($streakUser['soal_streak'] ?? 0) + 1 : 0;
    $newSoalStreakBest  = max($newSoalStreak, (int)($streakUser['soal_streak_best'] ?? 0));
    $pdo->prepare('UPDATE users SET soal_streak = ?, soal_streak_best = ? WHERE id = ?')
        ->execute([$newSoalStreak, $newSoalStreakBest, $authUser['id']]);

    // daily streak
    updateDailyStreak($pdo, $authUser['id']);
  }

  echo json_encode(['is_correct' => (bool) $is_correct, 'xp_earned' => $xpEarned, 'first_time' => !$existing]);
  exit;
}

// POST /materi/:id/report
if (preg_match('#^/materi/(\d+)/report$#', $uri, $m) && $method === 'POST') {
  $id    = (int) $m[1];
  $body  = json_decode(file_get_contents('php://input'), true) ?? [];
  $alasan    = trim($body['alasan']    ?? '');
  $deskripsi = trim($body['deskripsi'] ?? '');

  if (!$alasan) { http_response_code(400); echo json_encode(['error' => 'alasan wajib']); exit; }

  // Verify materi exists
  $exists = $pdo->prepare('SELECT id FROM materi WHERE id = ? AND is_published = 1');
  $exists->execute([$id]);
  if (!$exists->fetch()) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $pdo->prepare('INSERT INTO materi_reports (materi_id, alasan, deskripsi) VALUES (?, ?, ?)')
      ->execute([$id, $alasan, $deskripsi ?: null]);

  echo json_encode(['message' => 'Laporan berhasil dikirim']);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
