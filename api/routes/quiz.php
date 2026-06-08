<?php
// api/routes/quiz.php

// ─── USER ENDPOINTS ───────────────────────────────────────────

// GET /quiz — daftar set soal published
if ($uri === '/quiz' && $method === 'GET') {
  $authUser    = getAuthUser(); // nullable
  $jenjang_id  = $_GET['jenjang_id'] ?? '';

  $where  = ['qs.is_published = 1'];
  $params = [];

  if ($jenjang_id) {
    $where[]  = 'qs.jenjang_id = ?';
    $params[] = $jenjang_id;
  }

  $whereClause = implode(' AND ', $where);

  $stmt = $pdo->prepare("
    SELECT qs.*,
           j.nama as jenjang_nama,
           COUNT(qss.id) as jumlah_soal
    FROM quiz_sets qs
    LEFT JOIN jenjang j ON qs.jenjang_id = j.id
    LEFT JOIN quiz_set_soal qss ON qs.id = qss.quiz_set_id
    WHERE $whereClause
    GROUP BY qs.id
    ORDER BY qs.urutan ASC, qs.created_at DESC
  ");
  $stmt->execute($params);
  $sets = $stmt->fetchAll();

  // Kalau login, tambahkan info attempt user per set soal
  if ($authUser) {
    foreach ($sets as &$set) {
      $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_attempt,
               MAX(score / NULLIF(total, 0) * 100) as best_persen,
               MAX(score) as best_score,
               MAX(total) as best_total,
               SUM(xp_earned) as total_xp,
               MAX(id) as best_session_id
        FROM quiz_sessions
        WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL
      ");
      $stmt->execute([$authUser['id'], $set['id']]);
      $attemptInfo = $stmt->fetch();

      $set['attempt_ke']      = (int) $attemptInfo['total_attempt'];
      $set['sisa_attempt']    = max(0, $set['max_attempt'] - (int) $attemptInfo['total_attempt']);
      $set['best_persen']     = $attemptInfo['best_persen'] ? round($attemptInfo['best_persen']) : null;
      $set['best_score']      = $attemptInfo['best_score'];
      $set['best_total']      = $attemptInfo['best_total'];
      $set['total_xp']        = (int) $attemptInfo['total_xp'];
      $set['best_session_id'] = $attemptInfo['best_session_id'];
    }
  }

  echo json_encode($sets);
  exit;
}

// GET /quiz/:id — detail set soal
if (preg_match('#^/quiz/(\d+)$#', $uri, $m) && $method === 'GET') {
  $authUser = getAuthUser(); // nullable
  $id = $m[1];

  $stmt = $pdo->prepare("
    SELECT qs.*,
           j.nama as jenjang_nama,
           COUNT(qss.id) as jumlah_soal
    FROM quiz_sets qs
    LEFT JOIN jenjang j ON qs.jenjang_id = j.id
    LEFT JOIN quiz_set_soal qss ON qs.id = qss.quiz_set_id
    WHERE qs.id = ? AND qs.is_published = 1
    GROUP BY qs.id
  ");
  $stmt->execute([$id]);
  $set = $stmt->fetch();

  if (!$set) {
    http_response_code(404);
    echo json_encode(['error' => 'Set soal tidak ditemukan']);
    exit;
  }

  // Info attempt user
  if ($authUser) {
    $stmt = $pdo->prepare("
      SELECT COUNT(*) as total_attempt,
             MAX(score / NULLIF(total, 0) * 100) as best_persen,
             MAX(score) as best_score,
             MAX(total) as best_total,
             SUM(xp_earned) as total_xp,
             MAX(id) as best_session_id,
             MAX(is_final) as is_final
      FROM quiz_sessions
      WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL
    ");
    $stmt->execute([$authUser['id'], $id]);
    $attemptInfo = $stmt->fetch();

    $set['attempt_ke']      = (int) $attemptInfo['total_attempt'];
    $set['sisa_attempt']    = max(0, $set['max_attempt'] - (int) $attemptInfo['total_attempt']);
    $set['best_persen']     = $attemptInfo['best_persen'] ? round($attemptInfo['best_persen']) : null;
    $set['best_score']      = $attemptInfo['best_score'];
    $set['best_total']      = $attemptInfo['best_total'];
    $set['total_xp']        = (int) $attemptInfo['total_xp'];
    $set['best_session_id'] = $attemptInfo['best_session_id'];
    $set['is_final'] = (int) $attemptInfo['is_final'];
  }

  echo json_encode($set);
  exit;
}

// POST /quiz/:id/start — mulai atau resume attempt
if (preg_match('#^/quiz/(\d+)/start$#', $uri, $m) && $method === 'POST') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Login diperlukan']); exit; }

  $id = $m[1];

  // Ambil set soal
  $stmt = $pdo->prepare('SELECT * FROM quiz_sets WHERE id = ? AND is_published = 1');
  $stmt->execute([$id]);
  $set = $stmt->fetch();
  if (!$set) { http_response_code(404); echo json_encode(['error' => 'Set soal tidak ditemukan']); exit; }

  // Cek attempt limit
  $stmt = $pdo->prepare('SELECT COUNT(*) FROM quiz_sessions WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL');
  $stmt->execute([$authUser['id'], $id]);
  $totalFinished = (int) $stmt->fetchColumn();
  if ($totalFinished >= $set['max_attempt']) {
    http_response_code(400);
    echo json_encode(['error' => 'Attempt sudah habis']);
    exit;
  }

  // Cek session aktif untuk set soal ini
  $stmt = $pdo->prepare('SELECT * FROM quiz_sessions WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NULL ORDER BY started_at DESC LIMIT 1');
  $stmt->execute([$authUser['id'], $id]);
  $activeSession = $stmt->fetch();

  if ($activeSession) {
    // Hitung sisa waktu
    $elapsed   = (time() - strtotime($activeSession['started_at']));
    $sisaWaktu = ($set['durasi'] * 60) - $elapsed;

    if ($sisaWaktu <= 0) {
      // Waktu habis — auto finish
      $answers = json_decode($activeSession['answers'] ?? '{}', true) ?: [];
      $soalList = json_decode($activeSession['urutan_soal'] ?? '[]', true) ?: [];

      // Hitung skor
      $score = 0;
      foreach ($soalList as $soalId) {
        $soalStmt = $pdo->prepare('SELECT tipe, answer FROM soal WHERE id = ?');
        $soalStmt->execute([$soalId]);
        $soalData = $soalStmt->fetch();
        $jawabanUser = $answers[$soalId]['jawaban'] ?? null;
        if ($jawabanUser !== null && checkQuizAnswer($soalData['tipe'], $jawabanUser, json_decode($soalData['answer'], true))) {
          $score++;
        }
      }

      $total  = count($soalList);
      $xp     = calculateQuizXP($score, $total, $set['max_xp']);

      // Delta XP
      $bestStmt = $pdo->prepare('SELECT MAX(xp_earned) FROM quiz_sessions WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL');
      $bestStmt->execute([$authUser['id'], $id]);
      $bestXP    = (int) $bestStmt->fetchColumn();
      $deltaXP   = max(0, $xp - $bestXP);

      $pdo->prepare('UPDATE quiz_sessions SET finished_at = NOW(), score = ?, total = ?, xp_earned = ?, sisa_waktu = 0 WHERE id = ?')
          ->execute([$score, $total, $xp, $activeSession['id']]);

      if ($deltaXP > 0) {
        $pdo->prepare('UPDATE users SET xp = xp + ? WHERE id = ?')->execute([$deltaXP, $authUser['id']]);
        $pdo->prepare('INSERT INTO xp_history (user_id, xp, reason) VALUES (?, ?, ?)')->execute([$authUser['id'], $deltaXP, 'Quiz: ' . $set['judul']]);
      }

      updateDailyStreak($pdo, $authUser['id']);

      echo json_encode(['resumed' => false, 'auto_finished' => true, 'session_id' => $activeSession['id']]);
      exit;
    }

    // Masih ada sisa waktu — resume
    echo json_encode([
      'resumed'     => true,
      'session_id'  => $activeSession['id'],
      'sisa_waktu'  => $sisaWaktu,
      'answers'     => json_decode($activeSession['answers'] ?? '{}', true),
      'urutan_soal' => json_decode($activeSession['urutan_soal'] ?? '[]', true),
    ]);
    exit;
  }

  // Buat session baru
  $stmt = $pdo->prepare('SELECT soal_id FROM quiz_set_soal WHERE quiz_set_id = ? ORDER BY urutan ASC');
  $stmt->execute([$id]);
  $soalIds = array_column($stmt->fetchAll(), 'soal_id');

  if ($set['urutan_mode'] === 'random') shuffle($soalIds);

  $attemptKe = $totalFinished + 1;

  $stmt = $pdo->prepare('INSERT INTO quiz_sessions (user_id, quiz_set_id, urutan_soal, attempt_ke) VALUES (?, ?, ?, ?)');
  $stmt->execute([$authUser['id'], $id, json_encode($soalIds), $attemptKe]);
  $sessionId = $pdo->lastInsertId();

  echo json_encode([
    'resumed'     => false,
    'session_id'  => $sessionId,
    'sisa_waktu'  => $set['durasi'] * 60,
    'answers'     => (object)[],
    'urutan_soal' => $soalIds,
  ]);
  exit;
}

// PATCH /quiz/session/:id — auto-save answers + sisa_waktu
if (preg_match('#^/quiz/session/(\d+)$#', $uri, $m) && $method === 'PATCH') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit; }

  $sessionId  = $m[1];
  $answers    = $body['answers']    ?? null;
  $sisaWaktu  = $body['sisa_waktu'] ?? null;

  $sets   = [];
  $params = [];

  if ($answers !== null)   { $sets[] = 'answers = ?';    $params[] = json_encode($answers); }
  if ($sisaWaktu !== null) { $sets[] = 'sisa_waktu = ?'; $params[] = $sisaWaktu; }

  if (empty($sets)) { echo json_encode(['message' => 'Nothing to update']); exit; }

  $params[] = $sessionId;
  $params[] = $authUser['id'];

  $pdo->prepare('UPDATE quiz_sessions SET ' . implode(', ', $sets) . ' WHERE id = ? AND user_id = ? AND finished_at IS NULL')
      ->execute($params);

  echo json_encode(['message' => 'Saved']);
  exit;
}

// POST /quiz/session/:id/finish — submit jawaban
if (preg_match('#^/quiz/session/(\d+)/finish$#', $uri, $m) && $method === 'POST') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit; }

  $sessionId = $m[1];

  $stmt = $pdo->prepare('SELECT qs.*, qset.max_xp, qset.judul FROM quiz_sessions qs JOIN quiz_sets qset ON qs.quiz_set_id = qset.id WHERE qs.id = ? AND qs.user_id = ? AND qs.finished_at IS NULL');
  $stmt->execute([$sessionId, $authUser['id']]);
  $session = $stmt->fetch();

  if (!$session) { http_response_code(404); echo json_encode(['error' => 'Session tidak ditemukan']); exit; }

  $answers  = json_decode($session['answers'] ?? '{}', true) ?: [];
  $soalIds  = json_decode($session['urutan_soal'] ?? '[]', true) ?: [];
  $total    = count($soalIds);
  $score    = 0;

  foreach ($soalIds as $soalId) {
    $soalStmt = $pdo->prepare('SELECT tipe, answer FROM soal WHERE id = ?');
    $soalStmt->execute([$soalId]);
    $soalData = $soalStmt->fetch();
    $jawabanUser = $answers[$soalId]['jawaban'] ?? null;
    if ($jawabanUser !== null && checkQuizAnswer($soalData['tipe'], $jawabanUser, json_decode($soalData['answer'], true))) {
      $score++;
    }
  }

  $xp = calculateQuizXP($score, $total, $session['max_xp']);

  // Delta XP dari attempt sebelumnya
  $bestStmt = $pdo->prepare('SELECT MAX(xp_earned) FROM quiz_sessions WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL');
  $bestStmt->execute([$authUser['id'], $session['quiz_set_id']]);
  $bestXP  = (int) $bestStmt->fetchColumn();
  $deltaXP = max(0, $xp - $bestXP);

  // Finish session
  $pdo->prepare('UPDATE quiz_sessions SET finished_at = NOW(), score = ?, total = ?, xp_earned = ? WHERE id = ?')
      ->execute([$score, $total, $xp, $sessionId]);

  // Tambah XP kalau ada delta
  if ($deltaXP > 0) {
    $pdo->prepare('UPDATE users SET xp = xp + ? WHERE id = ?')->execute([$deltaXP, $authUser['id']]);
    $pdo->prepare('INSERT INTO xp_history (user_id, xp, reason) VALUES (?, ?, ?)')->execute([$authUser['id'], $deltaXP, 'Quiz: ' . $session['judul']]);
  }

  // Trigger daily streak
  updateDailyStreak($pdo, $authUser['id']);

  echo json_encode([
    'message'  => 'Quiz selesai',
    'score'    => $score,
    'total'    => $total,
    'persen'   => $total > 0 ? round($score / $total * 100) : 0,
    'xp'       => $xp,
    'delta_xp' => $deltaXP,
  ]);
  exit;
}

// PUT /quiz/session/:id/final — set is_final = 1
if (preg_match('#^/quiz/session/(\d+)/final$#', $uri, $m) && $method === 'PUT') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit; }

  $sessionId = $m[1];
  $pdo->prepare('UPDATE quiz_sessions SET is_final = 1 WHERE id = ? AND user_id = ?')->execute([$sessionId, $authUser['id']]);
  echo json_encode(['message' => 'Session finalized']);
  exit;
}

// GET /quiz/session/:id/result — ambil data hasil
if (preg_match('#^/quiz/session/(\d+)/result$#', $uri, $m) && $method === 'GET') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit; }

  $sessionId = $m[1];

  $stmt = $pdo->prepare('
    SELECT qs.*, qset.judul, qset.max_xp, qset.max_attempt, qset.show_answer, qset.durasi
    FROM quiz_sessions qs
    JOIN quiz_sets qset ON qs.quiz_set_id = qset.id
    WHERE qs.id = ? AND qs.user_id = ?
  ');
  $stmt->execute([$sessionId, $authUser['id']]);
  $session = $stmt->fetch();

  if (!$session) { http_response_code(404); echo json_encode(['error' => 'Session tidak ditemukan']); exit; }

  $answers  = json_decode($session['answers'] ?? '{}', true) ?: [];
  $soalIds  = json_decode($session['urutan_soal'] ?? '[]', true) ?: [];

  // Ambil detail soal + hasil per soal
  $soalDetails = [];
  foreach ($soalIds as $soalId) {
    $stmt = $pdo->prepare('
      SELECT s.id, s.kode, s.body, s.tipe, s.options, s.difficulty, s.answer, s.explanation,
             st.id as subtopik_id, st.nama as subtopik, st.urutan as subtopik_urutan, t.nama as topik, m.nama as mapel
      FROM soal s
      JOIN subtopik st ON s.subtopik_id = st.id
      JOIN topik t ON st.topik_id = t.id
      JOIN mapel m ON t.mapel_id = m.id
      WHERE s.id = ?
    ');
    $stmt->execute([$soalId]);
    $soal = $stmt->fetch();

    $jawabanUser = $answers[$soalId]['jawaban'] ?? null;
    $waktuDetik  = $answers[$soalId]['waktu_detik'] ?? 0;
    $isCorrect   = $jawabanUser !== null && checkQuizAnswer($soal['tipe'], $jawabanUser, json_decode($soal['answer'], true));

    $soal['jawaban_user'] = $jawabanUser;
    $soal['waktu_detik']  = $waktuDetik;
    $soal['is_correct']   = $isCorrect;

    // Sembunyikan answer kalau belum is_final
    if (!$session['is_final']) {
      unset($soal['answer']);
      unset($soal['explanation']);
    } else {
      $soal['options'] = json_decode($soal['options'], true);
      $soal['answer']      = json_decode($soal['answer'], true);
      $soal['explanation'] = $soal['explanation'];
    }

    $soalDetails[] = $soal;
  }

  // Semua attempt untuk set soal ini (untuk chart perbandingan)
  $stmt = $pdo->prepare('
    SELECT id, attempt_ke, score, total, xp_earned, finished_at, is_final   
    FROM quiz_sessions
    WHERE user_id = ? AND quiz_set_id = ? AND finished_at IS NOT NULL
    ORDER BY attempt_ke ASC
  ');
  $stmt->execute([$authUser['id'], $session['quiz_set_id']]);
  $allAttempts = $stmt->fetchAll();

  // Total attempt finished
  $totalFinished = count($allAttempts);
  $sisaAttempt   = max(0, $session['max_attempt'] - $totalFinished);

  echo json_encode([
    'session'      => $session,
    'soal'         => $soalDetails,
    'all_attempts' => $allAttempts,
    'sisa_attempt' => $sisaAttempt,
  ]);
  exit;
}

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────

// GET /admin/quiz — daftar semua set soal
if ($uri === '/admin/quiz' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT qs.*, j.nama as jenjang_nama, COUNT(qss.id) as jumlah_soal
    FROM quiz_sets qs
    LEFT JOIN jenjang j ON qs.jenjang_id = j.id
    LEFT JOIN quiz_set_soal qss ON qs.id = qss.quiz_set_id
    GROUP BY qs.id
    ORDER BY qs.urutan ASC, qs.created_at DESC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/quiz — buat set soal baru
if ($uri === '/admin/quiz' && $method === 'POST') {
  $judul       = trim($body['judul']       ?? '');
  $deskripsi   = trim($body['deskripsi']   ?? '');
  $jenjang_id  = $body['jenjang_id']       ?? null;
  $durasi      = intval($body['durasi']    ?? 60);
  $max_xp      = intval($body['max_xp']   ?? 100);
  $max_attempt = intval($body['max_attempt'] ?? 3);
  $urutan      = intval($body['urutan']    ?? 0);
  $urutan_mode = $body['urutan_mode']      ?? 'fixed';
  $show_answer = intval($body['show_answer'] ?? 1);

  if (!$judul) { http_response_code(400); echo json_encode(['error' => 'Judul wajib diisi']); exit; }
  if (!in_array($urutan_mode, ['fixed', 'random'])) $urutan_mode = 'fixed';

  $stmt = $pdo->prepare('INSERT INTO quiz_sets (judul, deskripsi, jenjang_id, durasi, max_xp, max_attempt, urutan, urutan_mode, show_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$judul, $deskripsi ?: null, $jenjang_id ?: null, $durasi, $max_xp, $max_attempt, $urutan, $urutan_mode, $show_answer]);

  echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Set soal berhasil dibuat']);
  exit;
}

// PUT /admin/quiz/:id — update set soal
if (preg_match('#^/admin/quiz/(\d+)$#', $uri, $m) && $method === 'PUT') {
  $id          = $m[1];
  $judul       = trim($body['judul']         ?? '');
  $deskripsi   = trim($body['deskripsi']     ?? '');
  $jenjang_id  = $body['jenjang_id']         ?? null;
  $durasi      = intval($body['durasi']      ?? 60);
  $max_xp      = intval($body['max_xp']      ?? 100);
  $max_attempt = intval($body['max_attempt'] ?? 3);
  $urutan      = intval($body['urutan']      ?? 0);
  $urutan_mode = $body['urutan_mode']        ?? 'fixed';
  $show_answer = intval($body['show_answer'] ?? 1);

  if (!$judul) { http_response_code(400); echo json_encode(['error' => 'Judul wajib diisi']); exit; }

  $pdo->prepare('UPDATE quiz_sets SET judul = ?, deskripsi = ?, jenjang_id = ?, durasi = ?, max_xp = ?, max_attempt = ?, urutan = ?, urutan_mode = ?, show_answer = ? WHERE id = ?')
      ->execute([$judul, $deskripsi ?: null, $jenjang_id ?: null, $durasi, $max_xp, $max_attempt, $urutan, $urutan_mode, $show_answer, $id]);

  echo json_encode(['message' => 'Set soal berhasil diupdate']);
  exit;
}

// PUT /admin/quiz/:id/publish — toggle publish
if (preg_match('#^/admin/quiz/(\d+)/publish$#', $uri, $m) && $method === 'PUT') {
  $id = $m[1];
  $pdo->prepare('UPDATE quiz_sets SET is_published = NOT is_published WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Status publish berhasil diupdate']);
  exit;
}

// DELETE /admin/quiz/:id — hapus set soal
if (preg_match('#^/admin/quiz/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $id = $m[1];
  $pdo->prepare('DELETE FROM quiz_set_soal WHERE quiz_set_id = ?')->execute([$id]);
  $pdo->prepare('DELETE FROM quiz_sets WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Set soal berhasil dihapus']);
  exit;
}

// GET /admin/quiz/:id/soal — daftar soal dalam set
if (preg_match('#^/admin/quiz/(\d+)/soal$#', $uri, $m) && $method === 'GET') {
  $id = $m[1];
  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.tipe, s.difficulty,
           st.nama as subtopik, m.nama as mapel,
           qss.urutan
    FROM quiz_set_soal qss
    JOIN soal s ON qss.soal_id = s.id
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    WHERE qss.quiz_set_id = ?
    ORDER BY qss.urutan ASC
  ');
  $stmt->execute([$id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/quiz/:id/soal — tambah soal baru ke set
if (preg_match('#^/admin/quiz/(\d+)/soal$#', $uri, $m) && $method === 'POST') {
  $quizSetId = $m[1];

  // Ambil urutan terakhir
  $stmt = $pdo->prepare('SELECT MAX(urutan) FROM quiz_set_soal WHERE quiz_set_id = ?');
  $stmt->execute([$quizSetId]);
  $maxUrutan = (int) $stmt->fetchColumn();

  // Insert soal baru — is_exclusive = 1, is_published = 1
  $subtopikId  = $body['subtopik_id']  ?? null;
  $tipe        = $body['tipe']         ?? 'pilihan_ganda';
  $bodyText    = $body['body']         ?? '';
  $options     = $body['options']      ?? null;
  $answer      = $body['answer']       ?? null;
  $explanation = $body['explanation']  ?? '';
  $difficulty  = $body['difficulty']   ?? 1;
  $video_url   = $body['video_url']    ?? null;
  $is_public_explanation = $body['is_public_explanation'] ?? 0;

  // Generate kode unik
  do {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $kode  = '';
    for ($i = 0; $i < 6; $i++) $kode .= $chars[random_int(0, strlen($chars) - 1)];
    $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
    $cek->execute([$kode]);
  } while ($cek->fetch());

  $stmt = $pdo->prepare('
    INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation, is_published, is_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  ');
  $stmt->execute([
    $kode, $subtopikId, $tipe, $bodyText,
    $options ? json_encode($options) : null,
    $answer  ? json_encode($answer)  : null,
    $explanation, $difficulty, $video_url, $is_public_explanation,
  ]);
  $soalId = $pdo->lastInsertId();

  // Hubungkan ke set soal
  $pdo->prepare('INSERT INTO quiz_set_soal (quiz_set_id, soal_id, urutan) VALUES (?, ?, ?)')
      ->execute([$quizSetId, $soalId, $maxUrutan + 1]);

  echo json_encode(['id' => $soalId, 'kode' => $kode, 'message' => 'Soal berhasil ditambahkan']);
  exit;
}

// PUT /admin/quiz/:id/soal/:soal_id — edit soal dalam set
if (preg_match('#^/admin/quiz/(\d+)/soal/(\d+)$#', $uri, $m) && $method === 'PUT') {
  $soalId = $m[2];

  $pdo->prepare('
    UPDATE soal SET tipe = ?, body = ?, options = ?, answer = ?, explanation = ?, difficulty = ?, video_url = ?, is_public_explanation = ?, subtopik_id = ?
    WHERE id = ? AND is_exclusive = 1
  ')->execute([
    $body['tipe']        ?? 'pilihan_ganda',
    $body['body']        ?? '',
    isset($body['options']) ? json_encode($body['options']) : null,
    isset($body['answer'])  ? json_encode($body['answer'])  : null,
    $body['explanation'] ?? '',
    $body['difficulty']  ?? 1,
    $body['video_url']   ?? null,
    $body['is_public_explanation'] ?? 0,
    $body['subtopik_id'] ?? null,
    $soalId,
  ]);

  echo json_encode(['message' => 'Soal berhasil diupdate']);
  exit;
}

// PUT /admin/quiz/:id/soal/urutan — update urutan soal
if (preg_match('#^/admin/quiz/(\d+)/soal/urutan$#', $uri, $m) && $method === 'PUT') {
  $quizSetId = $m[1];
  $urutan    = $body['urutan'] ?? []; // [{soal_id, urutan}]

  foreach ($urutan as $item) {
    $pdo->prepare('UPDATE quiz_set_soal SET urutan = ? WHERE quiz_set_id = ? AND soal_id = ?')
        ->execute([$item['urutan'], $quizSetId, $item['soal_id']]);
  }

  echo json_encode(['message' => 'Urutan berhasil diupdate']);
  exit;
}

// PUT /admin/quiz/:id/soal/bulk-subtopik
if (preg_match('#^/admin/quiz/(\d+)/soal/bulk-subtopik$#', $uri, $m) && $method === 'PUT') {
  $soalIds    = $body['soal_ids'] ?? [];
  $subtopikId = $body['subtopik_id'] ?? null;

  if (empty($soalIds) || !$subtopikId) {
    http_response_code(400);
    echo json_encode(['error' => 'Data tidak lengkap']);
    exit;
  }

  $placeholders = implode(',', array_fill(0, count($soalIds), '?'));
  $params = array_merge([$subtopikId], $soalIds);
  $pdo->prepare("
    UPDATE soal SET subtopik_id = ?
    WHERE id IN ($placeholders) AND is_exclusive = 1
  ")->execute($params);

  echo json_encode(['message' => 'Subtopik berhasil diupdate']);
  exit;
}

// DELETE /admin/quiz/:id/soal/:soal_id — hapus soal dari set
if (preg_match('#^/admin/quiz/(\d+)/soal/(\d+)$#', $uri, $m) && $method === 'DELETE') {
  $quizSetId = $m[1];
  $soalId    = $m[2];

  $pdo->prepare('DELETE FROM quiz_set_soal WHERE quiz_set_id = ? AND soal_id = ?')->execute([$quizSetId, $soalId]);
  $pdo->prepare('DELETE FROM soal WHERE id = ? AND is_exclusive = 1')->execute([$soalId]);

  echo json_encode(['message' => 'Soal berhasil dihapus']);
  exit;
}

// POST /admin/quiz/:id/soal/link — hubungkan soal existing ke set
if (preg_match('#^/admin/quiz/(\d+)/soal/link$#', $uri, $m) && $method === 'POST') {
  $quizSetId = $m[1];
  $soalId    = $body['soal_id'] ?? null;

  if (!$soalId) { http_response_code(400); echo json_encode(['error' => 'soal_id wajib']); exit; }

  $stmt = $pdo->prepare('SELECT MAX(urutan) FROM quiz_set_soal WHERE quiz_set_id = ?');
  $stmt->execute([$quizSetId]);
  $maxUrutan = (int) $stmt->fetchColumn();

  $pdo->prepare('INSERT IGNORE INTO quiz_set_soal (quiz_set_id, soal_id, urutan) VALUES (?, ?, ?)')
      ->execute([$quizSetId, $soalId, $maxUrutan + 1]);

  echo json_encode(['message' => 'Soal berhasil dihubungkan']);
  exit;
}

// ─── HELPER ───────────────────────────────────────────────────

function checkQuizAnswer($tipe, $jawabanUser, $answer) {
  switch ($tipe) {
    case 'pilihan_ganda':
      return $jawabanUser === $answer;

    case 'isian_singkat':
      return strtolower(trim($jawabanUser)) === strtolower(trim($answer));

    case 'isian_numerik':
    case 'isian_multi':
      if (is_array($answer) && is_array($jawabanUser)) {
        foreach ($answer as $idx => $ans) {
          $userAns = str_replace(',', '.', trim($jawabanUser[$idx] ?? ''));
          $correct = str_replace(',', '.', trim($ans));
          if ($userAns !== $correct) return false;
        }
        return true;
      }
      return str_replace(',', '.', trim($jawabanUser)) === str_replace(',', '.', trim($answer));

    case 'checklist':
      if (!is_array($jawabanUser) || !is_array($answer)) return false;
      sort($jawabanUser); sort($answer);
      return $jawabanUser === $answer;

    case 'multiple_choice_table':
      if (!is_array($jawabanUser) || !is_array($answer)) return false;
      foreach ($answer as $key => $val) {
        if (($jawabanUser[$key] ?? null) !== $val) return false;
      }
      return true;

    case 'menjodohkan':
      if (!is_array($jawabanUser) || !is_array($answer)) return false;
      foreach ($answer as $key => $val) {
        if (($jawabanUser[$key] ?? null) !== $val) return false;
      }
      return true;

    default:
      return false;
  }
}

// GET /quiz/soal/:id — ambil detail soal untuk quiz (butuh login, cek bahwa soal ada di quiz_session user)
if (preg_match('#^/quiz/soal/(\d+)$#', $uri, $m) && $method === 'GET') {
  $authUser = getAuthUser();
  if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit; }

  $soalId = $m[1];

  // Verifikasi soal ini ada di session aktif milik user
  $stmt = $pdo->prepare('
    SELECT s.id FROM quiz_sessions qs
    JOIN quiz_set_soal qss ON qs.quiz_set_id = qss.quiz_set_id
    JOIN soal s ON qss.soal_id = s.id
    WHERE qs.user_id = ? AND s.id = ?
    LIMIT 1
  ');
  $stmt->execute([$authUser['id'], $soalId]);
  if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Akses ditolak']);
    exit;
  }

  // Ambil detail soal — tanpa answer
  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.tipe, s.options, s.difficulty,
           st.nama as subtopik, t.nama as topik, m.nama as mapel
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    WHERE s.id = ?
  ');
  $stmt->execute([$soalId]);
  $soal = $stmt->fetch();
  $soal['options'] = json_decode($soal['options'], true);

  echo json_encode($soal);
  exit;
}