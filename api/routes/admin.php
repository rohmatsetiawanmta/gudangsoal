<?php
// api/routes/admin.php

// Cek auth + role admin
$authUser = getAuthUser();
if (!$authUser) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

$stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
$stmt->execute([$authUser['id']]);
$userRole = $stmt->fetchColumn();

if ($userRole !== 'admin') {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

// ==================
// SOAL
// ==================

// GET /admin/soal
if ($uri === '/admin/soal' && $method === 'GET') {
  $page       = intval($_GET['page']       ?? 1);
  $limit      = intval($_GET['limit']      ?? 20);
  $offset     = ($page - 1) * $limit;
  $search     = $_GET['search']     ?? '';
  $difficulty = isset($_GET['difficulty']) && $_GET['difficulty'] !== '' ? intval($_GET['difficulty']) : null;
  $published  = isset($_GET['published'])  && $_GET['published']  !== '' ? intval($_GET['published'])  : null;

  $where  = [];
  $params = [];

  if ($search)                { $where[] = 's.body LIKE ?';         $params[] = "%$search%"; }
  if ($difficulty !== null)   { $where[] = 's.difficulty = ?';      $params[] = $difficulty; }
  if ($published  !== null)   { $where[] = 's.is_published = ?';    $params[] = $published;  }

  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $stmt = $pdo->prepare('
    SELECT s.id, s.tipe, s.body, s.answer, s.difficulty, s.is_published, s.created_at, s.kode,
           st.nama as subtopik, t.nama as topik,
           m.nama as mapel, sj.nama as subjenjang, j.nama as jenjang
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    ' . $whereClause . '
    ORDER BY s.created_at DESC
    LIMIT ' . $limit . ' OFFSET ' . $offset . '
  ');
  $stmt->execute($params);

  $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM soal s ' . $whereClause);
  $totalStmt->execute($params);

  // counts for stats bar
  $published_count = (int) $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 1')->fetchColumn();
  $draft_count     = (int) $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 0')->fetchColumn();

  echo json_encode([
    'data'            => $stmt->fetchAll(),
    'total'           => (int) $totalStmt->fetchColumn(),
    'page'            => $page,
    'limit'           => $limit,
    'published_count' => $published_count,
    'draft_count'     => $draft_count,
  ]);
  exit;
}

// GET /admin/soal/detail?id=1
if ($uri === '/admin/soal/detail' && $method === 'GET') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare('
  SELECT s.*,
         st.nama as subtopik, t.nama as topik,
         m.nama as mapel, sj.nama as subjenjang,
         j.nama as jenjang
  FROM soal s
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  JOIN subjenjang sj ON m.subjenjang_id = sj.id
  JOIN jenjang j ON sj.jenjang_id = j.id
  WHERE s.id = ?
');
  $stmt->execute([$id]);
  $soal = $stmt->fetch();

  if (!$soal) { http_response_code(404); echo json_encode(['error' => 'Soal tidak ditemukan']); exit; }

  $soal['options'] = json_decode($soal['options']);
  $soal['answer']  = json_decode($soal['answer']);
  echo json_encode($soal);
  exit;
}

// POST /admin/soal
if ($uri === '/admin/soal' && $method === 'POST') {
  $required = ['subtopik_id', 'body', 'options', 'answer'];
  foreach ($required as $field) {
    if (empty($body[$field])) {
      http_response_code(400);
      echo json_encode(['error' => "$field wajib diisi"]);
      exit;
    }
  }

  // Generate kode unik 6 karakter
  $kode = '';
  do {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $kode = '';
    for ($i = 0; $i < 6; $i++) {
      $kode .= $chars[random_int(0, strlen($chars) - 1)];
    }
    $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
    $cek->execute([$kode]);
  } while ($cek->fetch()); // ulangi kalau bentrok

  $stmt = $pdo->prepare('
    INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([
    $kode,
    $body['subtopik_id'],
    $body['tipe']        ?? 'pilihan_ganda',
    $body['body'],
    json_encode($body['options']),
    json_encode($body['answer']), 
    $body['explanation'] ?? null,
    $body['difficulty']  ?? 1,
    $body['video_url']   ?? null,
    $body['is_public_explanation'] ?? 0,
  ]);

  http_response_code(201);
  echo json_encode(['id' => $pdo->lastInsertId(), 'kode' => $kode, 'message' => 'Soal berhasil ditambahkan']);
  exit;
}

// POST /admin/soal/bulk
if ($uri === '/admin/soal/bulk' && $method === 'POST') {
  $soalList = $body['soal'] ?? [];
  if (empty($soalList) || !is_array($soalList)) {
    http_response_code(400);
    echo json_encode(['error' => 'Array soal wajib diisi']);
    exit;
  }

  $saved  = [];
  $errors = [];
  $chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  foreach ($soalList as $i => $s) {
    $required = ['subtopik_id', 'body', 'options', 'answer'];
    $missing = false;
    foreach ($required as $field) {
      if (empty($s[$field])) { $missing = true; break; }
    }
    if ($missing) {
      $errors[] = ['index' => $i, 'reason' => 'Field tidak lengkap'];
      continue;
    }

    // Generate kode unik
    $kode = '';
    do {
      $kode = '';
      for ($j = 0; $j < 6; $j++) {
        $kode .= $chars[random_int(0, strlen($chars) - 1)];
      }
      $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
      $cek->execute([$kode]);
    } while ($cek->fetch());

    try {
      $stmt = $pdo->prepare('
        INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ');
      $stmt->execute([
        $kode,
        $s['subtopik_id'],
        $s['tipe']        ?? 'pilihan_ganda',
        $s['body'],
        json_encode($s['options']),
        json_encode($s['answer']),
        $s['explanation'] ?? null,
        $s['difficulty']  ?? 1,
        $s['video_url']   ?? null,
        $s['is_public_explanation'] ?? 0,
      ]);
      $saved[] = ['index' => $i, 'id' => $pdo->lastInsertId(), 'kode' => $kode];
    } catch (Exception $e) {
      $errors[] = ['index' => $i, 'reason' => $e->getMessage()];
    }
  }

  http_response_code(201);
  echo json_encode([
    'saved'  => $saved,
    'errors' => $errors,
    'total'  => count($saved),
  ]);
  exit;
}

// PUT /admin/soal?id=1
if ($uri === '/admin/soal' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $required = ['subtopik_id', 'body', 'options', 'answer'];
  foreach ($required as $field) {
    if (empty($body[$field])) {
      http_response_code(400);
      echo json_encode(['error' => "$field wajib diisi"]);
      exit;
    }
  }

  $stmt = $pdo->prepare('
    UPDATE soal
    SET subtopik_id=?, tipe=?, body=?, options=?, answer=?, explanation=?, difficulty=?, video_url=?, is_public_explanation=?
    WHERE id=?
  ');
  $stmt->execute([
    $body['subtopik_id'],
    $body['tipe']        ?? 'pilihan_ganda',
    $body['body'],
    json_encode($body['options']),
    json_encode($body['answer']),
    $body['explanation'] ?? null,
    $body['difficulty']  ?? 1,
    $body['video_url']   ?? null,
    $body['is_public_explanation'] ?? 0,
    $id,
  ]);

  echo json_encode(['message' => 'Soal berhasil diupdate']);
  exit;
}

// DELETE /admin/soal/bulk  — body: { ids: [1,2,3] }
if ($uri === '/admin/soal/bulk' && $method === 'DELETE') {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $ids  = array_filter(array_map('intval', $body['ids'] ?? []), fn($id) => $id > 0);
  if (empty($ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'ids wajib']);
    exit;
  }
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $pdo->prepare("DELETE FROM sessions   WHERE soal_id IN ($placeholders)")->execute($ids);
  $pdo->prepare("DELETE FROM xp_history WHERE soal_kode IN (SELECT kode FROM soal WHERE id IN ($placeholders))")->execute($ids);
  $pdo->prepare("DELETE FROM reports    WHERE soal_kode IN (SELECT kode FROM soal WHERE id IN ($placeholders))")->execute($ids);
  $pdo->prepare("DELETE FROM soal WHERE id IN ($placeholders)")->execute($ids);
  echo json_encode(['deleted' => count($ids)]);
  exit;
}

// DELETE /admin/soal?id=1
if ($uri === '/admin/soal' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  // Hapus data terkait dulu
  $pdo->prepare('DELETE FROM sessions    WHERE soal_id = ?')->execute([$id]);
  $pdo->prepare('DELETE FROM xp_history  WHERE soal_kode = (SELECT kode FROM soal WHERE id = ?)')->execute([$id]);
  $pdo->prepare('DELETE FROM reports     WHERE soal_kode = (SELECT kode FROM soal WHERE id = ?)')->execute([$id]);

  // Baru hapus soal
  $pdo->prepare('DELETE FROM soal WHERE id = ?')->execute([$id]);

  echo json_encode(['message' => 'Soal berhasil dihapus']);
  exit;
}

// ==================
// STRUKTUR
// ==================

// GET /admin/struktur
if ($uri === '/admin/struktur' && $method === 'GET') {
  $jenjang    = $pdo->query('SELECT * FROM jenjang ORDER BY urutan ASC, id ASC')->fetchAll();
  $subjenjang = $pdo->query('SELECT * FROM subjenjang ORDER BY urutan ASC, id ASC')->fetchAll();
  $mapel      = $pdo->query('SELECT * FROM mapel ORDER BY urutan ASC, id ASC')->fetchAll();
  $topik      = $pdo->query('SELECT * FROM topik ORDER BY urutan ASC, id ASC')->fetchAll();
  $subtopik   = $pdo->query('SELECT * FROM subtopik ORDER BY urutan ASC, id ASC')->fetchAll();

  // Count soal per subtopik
  $soalCount = $pdo->query('
    SELECT subtopik_id, COUNT(*) as total
    FROM soal
    GROUP BY subtopik_id
  ')->fetchAll();

  // Map subtopik_id => total
  $soalBySubtopik = [];
  foreach ($soalCount as $sc) {
    $soalBySubtopik[(int)$sc['subtopik_id']] = (int)$sc['total'];
  }

  // Inject ke subtopik
  foreach ($subtopik as &$st) {
    $st['jumlah_soal'] = $soalBySubtopik[(int)$st['id']] ?? 0;
  }
  unset($st);

  // Aggregate subtopik → topik
  $soalByTopik = [];
  foreach ($subtopik as $st) {
    $tid = (int)$st['topik_id'];
    $soalByTopik[$tid] = ($soalByTopik[$tid] ?? 0) + (int)$st['jumlah_soal'];
  }
  foreach ($topik as &$t) {
    $t['jumlah_soal'] = $soalByTopik[(int)$t['id']] ?? 0;
  }
  unset($t);

  // Aggregate topik → mapel
  $soalByMapel = [];
  foreach ($topik as $t) {
    $mid = (int)$t['mapel_id'];
    $soalByMapel[$mid] = ($soalByMapel[$mid] ?? 0) + (int)$t['jumlah_soal'];
  }
  foreach ($mapel as &$m) {
    $m['jumlah_soal'] = $soalByMapel[(int)$m['id']] ?? 0;
  }
  unset($m);

  // Aggregate mapel → subjenjang
  $soalBySubjenjang = [];
  foreach ($mapel as $m) {
    $sjid = (int)$m['subjenjang_id'];
    $soalBySubjenjang[$sjid] = ($soalBySubjenjang[$sjid] ?? 0) + (int)$m['jumlah_soal'];
  }
  foreach ($subjenjang as &$sj) {
    $sj['jumlah_soal'] = $soalBySubjenjang[(int)$sj['id']] ?? 0;
  }
  unset($sj);

  // Aggregate subjenjang → jenjang
  $soalByJenjang = [];
  foreach ($subjenjang as $sj) {
    $jid = (int)$sj['jenjang_id'];
    $soalByJenjang[$jid] = ($soalByJenjang[$jid] ?? 0) + (int)$sj['jumlah_soal'];
  }
  foreach ($jenjang as &$j) {
    $j['jumlah_soal'] = $soalByJenjang[(int)$j['id']] ?? 0;
  }
  unset($j);

  echo json_encode(compact('jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'));
  exit;
}

// POST /admin/struktur/:level
if (str_starts_with($uri, '/admin/struktur/') && $method === 'POST' && $uri !== '/admin/struktur/bulk-topik') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }

  $nama = trim($body['nama'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'nama wajib']); exit; }

  $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nama));
  $slug = trim($slug, '-');

  if ($level === 'jenjang') {
    $kode = $body['kode'] ?? $slug;
    $stmt = $pdo->prepare('INSERT INTO jenjang (kode, nama, slug, urutan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$kode, $nama, $slug, $body['urutan'] ?? 0]);

  } elseif ($level === 'subjenjang') {
    $jenjang_id = $body['jenjang_id'] ?? null;
    if (!$jenjang_id) { http_response_code(400); echo json_encode(['error' => 'jenjang_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO subjenjang (jenjang_id, nama, slug, urutan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$jenjang_id, $nama, $slug, $body['urutan'] ?? 0]);

  } elseif ($level === 'mapel') {
    $subjenjang_id = $body['subjenjang_id'] ?? null;
    if (!$subjenjang_id) { http_response_code(400); echo json_encode(['error' => 'subjenjang_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO mapel (subjenjang_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$subjenjang_id, $nama, $slug]);

  } elseif ($level === 'topik') {
    $mapel_id = $body['mapel_id'] ?? null;
    if (!$mapel_id) { http_response_code(400); echo json_encode(['error' => 'mapel_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO topik (mapel_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$mapel_id, $nama, $slug]);

  } elseif ($level === 'subtopik') {
    $topik_id = $body['topik_id'] ?? null;
    if (!$topik_id) { http_response_code(400); echo json_encode(['error' => 'topik_id wajib']); exit; }
    $stmt = $pdo->prepare('INSERT INTO subtopik (topik_id, nama, slug) VALUES (?, ?, ?)');
    $stmt->execute([$topik_id, $nama, $slug]);
  }

  http_response_code(201);
  echo json_encode([
    'id'      => $pdo->lastInsertId(),
    'slug'    => $slug,
    'message' => ucfirst($level) . ' berhasil ditambahkan',
  ]);
  exit;
}

// POST /admin/struktur/bulk-topik — body: { mapel_id, items: [{topik, subtopik:[]}] }
if ($uri === '/admin/struktur/bulk-topik' && $method === 'POST') {
  $mapel_id = (int)($body['mapel_id'] ?? 0);
  $items    = $body['items'] ?? [];
  if (!$mapel_id) { http_response_code(400); echo json_encode(['error' => 'mapel_id wajib']); exit; }
  if (!is_array($items) || count($items) === 0) { http_response_code(400); echo json_encode(['error' => 'items kosong']); exit; }

  $inserted_topik    = 0;
  $inserted_subtopik = 0;
  $errors            = [];

  $stmtFindTopik  = $pdo->prepare('SELECT id FROM topik WHERE mapel_id = ? AND nama = ? LIMIT 1');
  $stmtTopik      = $pdo->prepare('INSERT INTO topik (mapel_id, nama, slug) VALUES (?, ?, ?)');
  $stmtFindSt     = $pdo->prepare('SELECT id FROM subtopik WHERE topik_id = ? AND nama = ? LIMIT 1');
  $stmtSubtopik   = $pdo->prepare('INSERT INTO subtopik (topik_id, nama, slug) VALUES (?, ?, ?)');

  foreach ($items as $i => $item) {
    $topikNama = trim($item['topik'] ?? '');
    if (!$topikNama) { $errors[] = "Item #" . ($i + 1) . ": nama topik kosong"; continue; }
    $topikSlug = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $topikNama)), '-');
    try {
      // Reuse existing topik if name matches
      $stmtFindTopik->execute([$mapel_id, $topikNama]);
      $existing = $stmtFindTopik->fetch();
      if ($existing) {
        $topikId = (int)$existing['id'];
      } else {
        $stmtTopik->execute([$mapel_id, $topikNama, $topikSlug]);
        $topikId = (int)$pdo->lastInsertId();
        $inserted_topik++;
      }
      foreach (($item['subtopik'] ?? []) as $stNama) {
        $stNama = trim($stNama);
        if (!$stNama) continue;
        // Skip if subtopik with same name already exists under this topik
        $stmtFindSt->execute([$topikId, $stNama]);
        if ($stmtFindSt->fetch()) continue;
        $stSlug = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $stNama)), '-');
        $stmtSubtopik->execute([$topikId, $stNama, $stSlug]);
        $inserted_subtopik++;
      }
    } catch (Exception $e) {
      $errors[] = "Topik '$topikNama': " . $e->getMessage();
    }
  }

  echo json_encode(['inserted_topik' => $inserted_topik, 'inserted_subtopik' => $inserted_subtopik, 'errors' => $errors]);
  exit;
}

// PUT /admin/struktur/:level?id=1
if (str_starts_with($uri, '/admin/struktur/') && $method === 'PUT') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $nama = trim($body['nama'] ?? '');
  if (!$nama) { http_response_code(400); echo json_encode(['error' => 'nama wajib']); exit; }

  $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nama));
  $slug = trim($slug, '-');

  $stmt = $pdo->prepare("UPDATE $level SET nama = ?, slug = ? WHERE id = ?");
  $stmt->execute([$nama, $slug, $id]);

  echo json_encode(['message' => ucfirst($level) . ' berhasil diupdate']);
  exit;
}

// DELETE /admin/struktur/:level?id=1
if (str_starts_with($uri, '/admin/struktur/') && $method === 'DELETE') {
  $level   = str_replace('/admin/struktur/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare("DELETE FROM $level WHERE id = ?");
  $stmt->execute([$id]);

  echo json_encode(['message' => ucfirst($level) . ' berhasil dihapus']);
  exit;
}

// PUT /admin/publish/:level?id=1
if (str_starts_with($uri, '/admin/publish/') && $method === 'PUT') {
  $level   = str_replace('/admin/publish/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik', 'soal'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id) {
    http_response_code(400); echo json_encode(['error' => 'id wajib']); exit;
  }

  $stmt = $pdo->prepare("UPDATE $level SET is_published = NOT is_published WHERE id = ?");
  $stmt->execute([$id]);

  $stmt = $pdo->prepare("SELECT is_published FROM $level WHERE id = ?");
  $stmt->execute([$id]);
  $status = $stmt->fetchColumn();

  echo json_encode([
    'is_published' => (bool) $status,
    'message'      => $status ? ucfirst($level) . ' dipublish' : ucfirst($level) . ' di-unpublish',
  ]);
  exit;
}

// GET /admin/stats
if ($uri === '/admin/stats' && $method === 'GET') {
  $totalSoal          = $pdo->query('SELECT COUNT(*) FROM soal')->fetchColumn();
  $totalSoalPublished = $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 1')->fetchColumn();
  $totalUser          = $pdo->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn();
  $totalJenjang       = $pdo->query('SELECT COUNT(*) FROM jenjang')->fetchColumn();
  $totalSubtopik      = $pdo->query('SELECT COUNT(*) FROM subtopik')->fetchColumn();
  $totalSesi          = $pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn();
  $totalBenar         = $pdo->query('SELECT COUNT(*) FROM sessions WHERE is_correct = 1')->fetchColumn();

  // Soal terbaru
  $soalTerbaru = $pdo->query('
    SELECT s.kode, s.body, s.difficulty, s.is_published, s.created_at,
           st.nama as subtopik, m.nama as mapel
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    ORDER BY s.created_at DESC
    LIMIT 5
  ')->fetchAll();

  // User terbaru
  $userTerbaru = $pdo->query('
    SELECT id, name, email, xp, streak, created_at
    FROM users
    WHERE role = "user"
    ORDER BY created_at DESC
    LIMIT 5
  ')->fetchAll();
  
  // Soal per jenjang
  $soalPerJenjang = $pdo->query('
    SELECT j.nama, COUNT(s.id) as total
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE s.is_published = 1
    GROUP BY j.id, j.nama
    ORDER BY total DESC
  ')->fetchAll();

  // User aktif 7 hari terakhir
  $userAktif = $pdo->query('
    SELECT DATE(created_at) as tanggal, COUNT(DISTINCT user_id) as aktif
    FROM sessions
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY tanggal ASC
  ')->fetchAll();

  // Akurasi per difficulty
  $akurasiPerDifficulty = $pdo->query('
    SELECT s.difficulty,
      COUNT(*) as total,
      SUM(se.is_correct) as benar
    FROM sessions se
    JOIN soal s ON se.soal_id = s.id
    GROUP BY s.difficulty
    ORDER BY s.difficulty ASC
  ')->fetchAll();

  // Soal dibuat per hari 30 hari terakhir
  $soalPerHari = $pdo->query('
    SELECT DATE(created_at) as tanggal, COUNT(*) as total
    FROM soal
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY tanggal ASC
  ')->fetchAll();
  
  // 1. Soal paling sering salah (top 10, min 5 attempt)
$soalPalingSalah = $pdo->query('
  SELECT s.kode, s.body, s.difficulty,
         st.nama as subtopik, m.nama as mapel,
         COUNT(*) as total_attempt,
         SUM(se.is_correct) as total_benar,
         ROUND((1 - SUM(se.is_correct) / COUNT(*)) * 100) as error_rate
  FROM sessions se
  JOIN soal s ON se.soal_id = s.id
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  WHERE s.is_published = 1
  GROUP BY s.id, s.kode, s.body, s.difficulty, st.nama, m.nama
  HAVING total_attempt >= 5
  ORDER BY error_rate DESC
  LIMIT 10
')->fetchAll();

// 2. Registrasi user per hari 30 hari terakhir
$registrasiHarian = $pdo->query('
  SELECT DATE(created_at) as tanggal, COUNT(*) as total
  FROM users
  WHERE role = "user"
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(created_at)
  ORDER BY tanggal ASC
')->fetchAll();

// Registrasi per minggu 12 minggu terakhir
$registrasiMingguan = $pdo->query('
  SELECT
    YEAR(created_at) as tahun,
    WEEK(created_at, 1) as minggu,
    MIN(DATE(created_at)) as tanggal_mulai,
    COUNT(*) as total
  FROM users
  WHERE role = "user"
  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
  GROUP BY YEAR(created_at), WEEK(created_at, 1)
  ORDER BY tahun ASC, minggu ASC
')->fetchAll();

// 3. XP didistribusikan per hari 30 hari terakhir
$xpPerHari = $pdo->query('
  SELECT DATE(created_at) as tanggal, SUM(xp) as total_xp, COUNT(*) as total_transaksi
  FROM xp_history
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(created_at)
  ORDER BY tanggal ASC
')->fetchAll();

// 4. Soal terpopuler
$soalTerpopuler = $pdo->query('
  SELECT s.kode, s.body, s.difficulty,
         st.nama as subtopik, m.nama as mapel,
         s.views,
         COUNT(se.id) as total_attempt,
         COUNT(DISTINCT se.user_id) as total_user,
         ROUND(SUM(se.is_correct) / NULLIF(COUNT(*), 0) * 100) as akurasi
  FROM soal s
  LEFT JOIN sessions se ON se.soal_id = s.id
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  WHERE s.is_published = 1
  GROUP BY s.id, s.kode, s.body, s.difficulty, st.nama, m.nama, s.views
  HAVING COUNT(se.id) >= 3
  ORDER BY (s.views * 0.3 + COUNT(se.id) * 0.5 + COUNT(DISTINCT se.user_id) * 0.2) DESC
  LIMIT 10
')->fetchAll();

  echo json_encode([
    'total_soal'           => (int) $totalSoal,
    'total_soal_published' => (int) $totalSoalPublished,
    'total_soal_draft'     => (int) $totalSoal - (int) $totalSoalPublished,
    'total_user'           => (int) $totalUser,
    'total_jenjang'        => (int) $totalJenjang,
    'total_subtopik'       => (int) $totalSubtopik,
    'total_sesi'           => (int) $totalSesi,
    'total_benar'          => (int) $totalBenar,
    'akurasi'              => $totalSesi > 0 ? round($totalBenar / $totalSesi * 100) : 0,
    'soal_terbaru'         => $soalTerbaru,
    'user_terbaru'         => $userTerbaru,
    'soal_per_jenjang'        => $soalPerJenjang,
    'user_aktif'              => $userAktif,
    'akurasi_per_difficulty'  => $akurasiPerDifficulty,
    'soal_per_hari'           => $soalPerHari,
    'soal_paling_salah'    => $soalPalingSalah,
'registrasi_harian'    => $registrasiHarian,
'registrasi_mingguan'  => $registrasiMingguan,
'xp_per_hari'          => $xpPerHari,
'soal_terpopuler'      => $soalTerpopuler,
  ]);
  exit;
}

// PUT /admin/urutan/:level?id=1
if (str_starts_with($uri, '/admin/urutan/') && $method === 'PUT') {
  $level   = str_replace('/admin/urutan/', '', $uri);
  $id      = $_GET['id'] ?? null;
  $urutan  = $body['urutan'] ?? null;
  $allowed = ['jenjang', 'subjenjang', 'mapel', 'topik', 'subtopik'];

  if (!in_array($level, $allowed)) {
    http_response_code(400); echo json_encode(['error' => 'Level tidak valid']); exit;
  }
  if (!$id || $urutan === null) {
    http_response_code(400); echo json_encode(['error' => 'id dan urutan wajib']); exit;
  }

  $stmt = $pdo->prepare("UPDATE `$level` SET urutan = ? WHERE id = ?");
  $stmt->execute([$urutan, $id]);

  echo json_encode(['message' => 'Urutan berhasil diupdate']);
  exit;
}

// GET /admin/users?page=1&search=
if ($uri === '/admin/users' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $search = $_GET['search'] ?? '';

  if ($search) {
    $stmt = $pdo->prepare('
      SELECT id, name, email, role, xp, streak, soal_streak, created_at
      FROM users
      WHERE (name LIKE ? OR email LIKE ?)
      ORDER BY created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute(["%$search%", "%$search%"]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE name LIKE ? OR email LIKE ?');
    $totalStmt->execute(["%$search%", "%$search%"]);
  } else {
    $stmt = $pdo->prepare('
      SELECT id, name, email, role, xp, streak, soal_streak, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM users');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// GET /admin/users/detail?id=1
if ($uri === '/admin/users/detail' && $method === 'GET') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare('
    SELECT id, name, email, role, xp, streak, soal_streak, soal_streak_best, created_at
    FROM users WHERE id = ?
  ');
  $stmt->execute([$id]);
  $user = $stmt->fetch();
  if (!$user) { http_response_code(404); echo json_encode(['error' => 'User tidak ditemukan']); exit; }

  // Stats sesi
  $stmt = $pdo->prepare('SELECT COUNT(*) as total, SUM(is_correct) as benar FROM sessions WHERE user_id = ?');
  $stmt->execute([$id]);
  $sesi = $stmt->fetch();

  echo json_encode(['user' => $user, 'sesi' => $sesi]);
  exit;
}

// PUT /admin/users?id=1
if ($uri === '/admin/users' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $allowed = ['name', 'role', 'xp'];
  $sets    = [];
  $values  = [];

  foreach ($allowed as $field) {
    if (isset($body[$field])) {
      $sets[]   = "$field = ?";
      $values[] = $body[$field];
    }
  }

  if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Tidak ada field yang diupdate']); exit; }

  $values[] = $id;
  $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?');
  $stmt->execute($values);

  echo json_encode(['message' => 'User berhasil diupdate']);
  exit;
}

// POST /admin/users/reset-password?id=1
if ($uri === '/admin/users/reset-password' && $method === 'POST') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $newPassword = $body['password'] ?? null;
  if (!$newPassword || strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password minimal 8 karakter']);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
  $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), $id]);

  echo json_encode(['message' => 'Password berhasil direset']);
  exit;
}

// GET /admin/reports?page=1&status=pending
if ($uri === '/admin/reports' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $status = $_GET['status'] ?? '';

  if ($status && in_array($status, ['pending', 'resolved', 'dismissed'])) {
    $stmt = $pdo->prepare('
      SELECT r.*, u.name as user_name, s.body as soal_body
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      JOIN soal s ON r.soal_kode = s.kode
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute([$status]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM reports WHERE status = ?');
    $totalStmt->execute([$status]);
  } else {
    $stmt = $pdo->prepare('
      SELECT r.*, u.name as user_name, s.body as soal_body
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      JOIN soal s ON r.soal_kode = s.kode
      ORDER BY r.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM reports');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/reports?id=1
if ($uri === '/admin/reports' && $method === 'PUT') {
  $id     = $_GET['id']     ?? null;
  $status = $body['status'] ?? null;
  $admin_notes = $body['admin_notes'] ?? null;

  if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'id dan status wajib']);
    exit;
  }

  if (!in_array($status, ['pending', 'resolved', 'dismissed'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE reports SET status = ?, admin_notes = ? WHERE id = ?');
  $stmt->execute([$status, $admin_notes, $id]);

  // Notifikasi — update pesan juga sertakan admin_notes
  if (in_array($status, ['resolved', 'dismissed'])) {
    $repStmt = $pdo->prepare('SELECT user_id, soal_kode FROM reports WHERE id = ?');
    $repStmt->execute([$id]);
    $rep = $repStmt->fetch();

    if ($rep && $rep['user_id']) {
      if ($status === 'resolved') {
        $judul = 'Laporan soal ditindaklanjuti';
        $pesan = 'Laporan kamu untuk soal #' . $rep['soal_kode'] . ' telah ditindaklanjuti.';
        $tipe  = 'report_resolved';
      } else {
        $judul = 'Laporan soal ditutup';
        $pesan = 'Laporan kamu untuk soal #' . $rep['soal_kode'] . ' telah ditinjau dan ditutup.';
        $tipe  = 'report_dismissed';
      }
      if ($admin_notes) $pesan .= ' Catatan: ' . $admin_notes;

      $notifStmt = $pdo->prepare('INSERT INTO notifications (user_id, tipe, judul, pesan, link) VALUES (?, ?, ?, ?, ?)');
      $notifStmt->execute([$rep['user_id'], $tipe, $judul, $pesan, '/soal/' . $rep['soal_kode']]);
    }
  }

  echo json_encode(['message' => 'Status report berhasil diupdate']);
  exit;
}

// GET /admin/soal-requests?page=1&status=pending
if ($uri === '/admin/soal-requests' && $method === 'GET') {
  $page   = intval($_GET['page']  ?? 1);
  $limit  = intval($_GET['limit'] ?? 20);
  $offset = ($page - 1) * $limit;
  $status = $_GET['status'] ?? '';

  if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
    $stmt = $pdo->prepare('
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM soal_requests sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.status = ?
      ORDER BY sr.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute([$status]);

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM soal_requests WHERE status = ?');
    $totalStmt->execute([$status]);
  } else {
    $stmt = $pdo->prepare('
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM soal_requests sr
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
      LIMIT ' . $limit . ' OFFSET ' . $offset . '
    ');
    $stmt->execute();

    $totalStmt = $pdo->query('SELECT COUNT(*) FROM soal_requests');
  }

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $totalStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/soal-requests?id=1 — approve atau reject
if ($uri === '/admin/soal-requests' && $method === 'PUT') {
  $id          = $_GET['id']          ?? null;
  $status      = $body['status']      ?? null;
  $admin_notes = $body['admin_notes'] ?? null;
  $soal_kode   = $body['soal_kode']   ?? null;

  if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'id dan status wajib']);
    exit;
  }

  if (!in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  if ($status === 'approved' && !$soal_kode) {
    http_response_code(400);
    echo json_encode(['error' => 'soal_kode wajib diisi saat approve']);
    exit;
  }

  $stmt = $pdo->prepare('
    UPDATE soal_requests
    SET status = ?, admin_notes = ?, soal_kode = ?
    WHERE id = ?
  ');
  $stmt->execute([$status, $admin_notes, $soal_kode, $id]);

  // Kirim notifikasi ke user
  $reqStmt = $pdo->prepare('SELECT user_id, body FROM soal_requests WHERE id = ?');
$reqStmt->execute([$id]);
$req = $reqStmt->fetch();

if ($req && $req['user_id']) {
  if ($status === 'approved') {
    $judul = 'Request soal disetujui';
    $pesan = 'Request soal kamu "' . mb_substr($req['body'], 0, 60) . '..." telah disetujui oleh admin.';
    $link  = $soal_kode ? "/soal/$soal_kode" : null;
    $tipe  = 'request_approved';
  } else {
    $judul = 'Request soal ditolak';
    $pesan = 'Request soal kamu "' . mb_substr($req['body'], 0, 60) . '..." tidak dapat dipenuhi saat ini.';
    if ($admin_notes) $pesan .= ' Catatan admin: ' . $admin_notes;
    $link  = null;
    $tipe  = 'request_rejected';
  }

  $notifStmt = $pdo->prepare('
    INSERT INTO notifications (user_id, tipe, judul, pesan, link)
    VALUES (?, ?, ?, ?, ?)
  ');
  $notifStmt->execute([$req['user_id'], $tipe, $judul, $pesan, $link]);
}

  echo json_encode(['message' => 'Request berhasil diupdate']);
  exit;
}

// GET /admin/changelog
if ($uri === '/admin/changelog' && $method === 'GET') {
  $stmt = $pdo->query('
    SELECT * FROM changelogs
    ORDER BY released_at DESC, id DESC
  ');
  echo json_encode($stmt->fetchAll());
  exit;
}

// POST /admin/changelog
if ($uri === '/admin/changelog' && $method === 'POST') {
  $versi        = $body['versi']        ?? null;
  $judul        = $body['judul']        ?? null;
  $deskripsi    = $body['deskripsi']    ?? null;
  $tipe         = $body['tipe']         ?? 'feature';
  $released_at  = $body['released_at']  ?? date('Y-m-d');
  $is_published = $body['is_published'] ?? 0;
  $audience     = $body['audience']     ?? 'all';

  if (!$versi || !$judul) {
    http_response_code(400);
    echo json_encode(['error' => 'versi dan judul wajib diisi']);
    exit;
  }

  $allowed_tipe = ['feature', 'improvement', 'fix', 'breaking'];
  if (!in_array($tipe, $allowed_tipe)) $tipe = 'feature';

  $allowed_audience = ['all', 'user', 'admin'];
  if (!in_array($audience, $allowed_audience)) $audience = 'all';

  $stmt = $pdo->prepare('
    INSERT INTO changelogs (versi, judul, deskripsi, tipe, is_published, released_at, audience)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([$versi, $judul, $deskripsi, $tipe, $is_published, $released_at, $audience]);

  echo json_encode(['message' => 'Changelog berhasil ditambahkan']);
  exit;
}

// PUT /admin/changelog?id=1
if ($uri === '/admin/changelog' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  $versi        = $body['versi']        ?? null;
  $judul        = $body['judul']        ?? null;
  $deskripsi    = $body['deskripsi']    ?? null;
  $tipe         = $body['tipe']         ?? 'feature';
  $released_at  = $body['released_at']  ?? date('Y-m-d');
  $is_published = $body['is_published'] ?? 0;
  $audience     = $body['audience']     ?? 'all';

  if (!$versi || !$judul) {
    http_response_code(400);
    echo json_encode(['error' => 'versi dan judul wajib diisi']);
    exit;
  }

  $allowed_tipe = ['feature', 'improvement', 'fix', 'breaking'];
  if (!in_array($tipe, $allowed_tipe)) $tipe = 'feature';

  $allowed_audience = ['all', 'user', 'admin'];
  if (!in_array($audience, $allowed_audience)) $audience = 'all';

  $stmt = $pdo->prepare('
    UPDATE changelogs
    SET versi=?, judul=?, deskripsi=?, tipe=?, is_published=?, released_at=?, audience=?
    WHERE id=?
  ');
  $stmt->execute([$versi, $judul, $deskripsi, $tipe, $is_published, $released_at, $audience, $id]);

  echo json_encode(['message' => 'Changelog berhasil diupdate']);
  exit;
}

// DELETE /admin/changelog?id=1
if ($uri === '/admin/changelog' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $pdo->prepare('DELETE FROM changelogs WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Changelog berhasil dihapus']);
  exit;
}

// GET /admin/feedback?page=1&status=&kategori=
if ($uri === '/admin/feedback' && $method === 'GET') {
  $page     = intval($_GET['page']     ?? 1);
  $limit    = intval($_GET['limit']    ?? 20);
  $offset   = ($page - 1) * $limit;
  $status   = $_GET['status']   ?? '';
  $kategori = $_GET['kategori'] ?? '';

  $where  = [];
  $params = [];

  if ($status && in_array($status, ['pending', 'dibaca', 'ditindaklanjuti'])) {
    $where[]  = 'f.status = ?';
    $params[] = $status;
  }
  if ($kategori && in_array($kategori, ['saran_fitur', 'bug', 'minta_topik', 'kualitas_konten', 'lainnya'])) {
    $where[]  = 'f.kategori = ?';
    $params[] = $kategori;
  }

  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $stmt = $pdo->prepare("
    SELECT f.*, u.name as user_name, u.email as user_email
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    $whereClause
    ORDER BY f.created_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM feedback f $whereClause");
  $countStmt->execute($params);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $countStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}

// PUT /admin/feedback?id=1 — update status + catatan
if ($uri === '/admin/feedback' && $method === 'PUT') {
  $id      = $_GET['id']      ?? null;
  $status  = $body['status']  ?? null;
  $catatan = $body['catatan'] ?? null;

  if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id wajib']);
    exit;
  }

  $allowed = ['pending', 'dibaca', 'ditindaklanjuti'];
  if ($status && !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Status tidak valid']);
    exit;
  }

  $sets   = [];
  $params = [];
  if ($status)           { $sets[] = 'status = ?';  $params[] = $status; }
  if ($catatan !== null) { $sets[] = 'catatan = ?'; $params[] = $catatan; }

  if (empty($sets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tidak ada yang diupdate']);
    exit;
  }

  $params[] = $id;
  $stmt = $pdo->prepare('UPDATE feedback SET ' . implode(', ', $sets) . ' WHERE id = ?');
  $stmt->execute($params);

  // Kirim notifikasi ke user — hanya saat ditindaklanjuti dan ada catatan
  if ($status === 'ditindaklanjuti' && $catatan) {
    $fbStmt = $pdo->prepare('SELECT user_id, judul FROM feedback WHERE id = ?');
    $fbStmt->execute([$id]);
    $fb = $fbStmt->fetch();

    if ($fb && $fb['user_id']) {
      $notifStmt = $pdo->prepare('
        INSERT INTO notifications (user_id, tipe, judul, pesan, link)
        VALUES (?, ?, ?, ?, ?)
      ');
      $notifStmt->execute([
        $fb['user_id'],
        'feedback_responded',
        'Masukan kamu ditindaklanjuti',
        'Masukan kamu "' . mb_substr($fb['judul'], 0, 60) . '" telah ditindaklanjuti. Catatan: ' . $catatan,
        '/profile',
      ]);
    }
  }

  echo json_encode(['message' => 'Feedback berhasil diupdate']);
  exit;
}

// DELETE /admin/feedback?id=1
if ($uri === '/admin/feedback' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $pdo->prepare('DELETE FROM feedback WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Feedback dihapus']);
  exit;
}

// POST /admin/soal/salin?id=1
if ($uri === '/admin/soal/salin' && $method === 'POST') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  // Ambil soal asli
  $stmt = $pdo->prepare('SELECT * FROM soal WHERE id = ?');
  $stmt->execute([$id]);
  $soal = $stmt->fetch();
  if (!$soal) { http_response_code(404); echo json_encode(['error' => 'Soal tidak ditemukan']); exit; }

  // Generate kode unik baru
  do {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $kode = '';
    for ($i = 0; $i < 6; $i++) $kode .= $chars[random_int(0, strlen($chars) - 1)];
    $cek = $pdo->prepare('SELECT id FROM soal WHERE kode = ?');
    $cek->execute([$kode]);
  } while ($cek->fetch());

  // Insert soal baru — is_published = 0 (draft)
  $stmt = $pdo->prepare('
    INSERT INTO soal (kode, subtopik_id, tipe, body, options, answer, explanation, difficulty, video_url, is_public_explanation, is_published, is_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  ');
  $stmt->execute([
    $kode,
    $soal['subtopik_id'],
    $soal['tipe'],
    $soal['body'],
    $soal['options'],
    $soal['answer'],
    $soal['explanation'],
    $soal['difficulty'],
    $soal['video_url'],
    $soal['is_public_explanation'],
    $soal['is_exclusive'],
  ]);

  $newId = $pdo->lastInsertId();
  echo json_encode(['id' => $newId, 'kode' => $kode, 'message' => 'Soal berhasil disalin']);
  exit;
}

// ==================
// MATERI
// ==================

// GET /admin/materi
if ($uri === '/admin/materi' && $method === 'GET') {
  $page        = intval($_GET['page']        ?? 1);
  $limit       = intval($_GET['limit']       ?? 20);
  $offset      = ($page - 1) * $limit;
  $search      = $_GET['search']      ?? '';
  $subtopik_id = isset($_GET['subtopik_id']) && $_GET['subtopik_id'] !== '' ? intval($_GET['subtopik_id']) : null;
  $published   = isset($_GET['published'])   && $_GET['published']   !== '' ? intval($_GET['published'])   : null;

  $where  = [];
  $params = [];
  if ($search)              { $where[] = 'm.judul LIKE ?';     $params[] = "%$search%"; }
  if ($subtopik_id !== null){ $where[] = 'm.subtopik_id = ?'; $params[] = $subtopik_id; }
  if ($published !== null)  { $where[] = 'm.is_published = ?'; $params[] = $published; }
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  $orderBy = $subtopik_id !== null
    ? 'm.urutan ASC, m.id ASC'
    : 'm.updated_at DESC, m.id DESC';

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.is_published, m.urutan, m.views, m.created_at, m.updated_at,
           st.nama AS subtopik, t.nama AS topik,
           mp.nama AS mapel, sj.nama AS subjenjang, j.nama AS jenjang
    FROM materi m
    JOIN subtopik st ON m.subtopik_id = st.id
    JOIN topik    t  ON st.topik_id   = t.id
    JOIN mapel    mp ON t.mapel_id    = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang    j  ON sj.jenjang_id    = j.id
    $whereClause
    ORDER BY {$orderBy}
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM materi m $whereClause");
  $totalStmt->execute($params);

  echo json_encode([
    'data'            => $stmt->fetchAll(),
    'total'           => (int) $totalStmt->fetchColumn(),
    'page'            => $page,
    'limit'           => $limit,
    'published_count' => (int) $pdo->query('SELECT COUNT(*) FROM materi WHERE is_published = 1')->fetchColumn(),
    'draft_count'     => (int) $pdo->query('SELECT COUNT(*) FROM materi WHERE is_published = 0')->fetchColumn(),
  ]);
  exit;
}

// GET /admin/materi/detail?id=X
if ($uri === '/admin/materi/detail' && $method === 'GET') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }

  $stmt = $pdo->prepare("
    SELECT m.*,
           st.nama AS subtopik, st.id AS subtopik_id,
           t.nama  AS topik,    t.id  AS topik_id,
           mp.nama AS mapel,    mp.id AS mapel_id,
           sj.nama AS subjenjang, sj.id AS subjenjang_id,
           j.nama  AS jenjang,  j.id  AS jenjang_id
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id   = j.id
    WHERE m.id = ?
  ");
  $stmt->execute([$id]);
  $materi = $stmt->fetch();
  if (!$materi) { http_response_code(404); echo json_encode(['error' => 'Materi tidak ditemukan']); exit; }

  $materi['highlights'] = json_decode($materi['highlights'] ?? '[]');
  echo json_encode($materi);
  exit;
}

// POST /admin/materi
if ($uri === '/admin/materi' && $method === 'POST') {
  if (empty($body['subtopik_id']) || empty($body['judul'])) {
    http_response_code(400); echo json_encode(['error' => 'subtopik_id dan judul wajib']); exit;
  }
  $stmt = $pdo->prepare('
    INSERT INTO materi (subtopik_id, judul, konten, highlights, is_published, urutan)
    VALUES (?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([
    $body['subtopik_id'],
    trim($body['judul']),
    $body['konten']       ?? null,
    json_encode($body['highlights'] ?? []),
    $body['is_published'] ?? 0,
    isset($body['urutan']) ? (int)$body['urutan'] : 0,
  ]);
  http_response_code(201);
  echo json_encode(['id' => (int) $pdo->lastInsertId(), 'message' => 'Materi berhasil ditambahkan']);
  exit;
}

// POST /admin/materi/bulk
if ($uri === '/admin/materi/bulk' && $method === 'POST') {
  $items = $body['items'] ?? null;
  if (!is_array($items) || count($items) === 0) {
    http_response_code(400); echo json_encode(['error' => 'items harus array dan tidak boleh kosong']); exit;
  }
  $stmt = $pdo->prepare('
    INSERT INTO materi (subtopik_id, judul, konten, highlights, is_published, urutan)
    VALUES (?, ?, ?, ?, ?, ?)
  ');
  $inserted = 0;
  $errors   = [];
  foreach ($items as $i => $item) {
    if (empty($item['subtopik_id']) || empty($item['judul'])) {
      $errors[] = "Item #" . ($i + 1) . ": subtopik_id dan judul wajib ada";
      continue;
    }
    try {
      $stmt->execute([
        (int) $item['subtopik_id'],
        trim($item['judul']),
        $item['konten']       ?? null,
        json_encode($item['highlights'] ?? []),
        isset($item['is_published']) ? (int)$item['is_published'] : 0,
        isset($item['urutan'])       ? (int)$item['urutan']       : 0,
      ]);
      $inserted++;
    } catch (Exception $e) {
      $errors[] = "Item #" . ($i + 1) . " (" . $item['judul'] . "): " . $e->getMessage();
    }
  }
  http_response_code($inserted > 0 ? 201 : 400);
  echo json_encode(['inserted' => $inserted, 'errors' => $errors]);
  exit;
}

// PUT /admin/materi?id=X
if ($uri === '/admin/materi' && $method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }
  if (empty($body['subtopik_id']) || empty($body['judul'])) {
    http_response_code(400); echo json_encode(['error' => 'subtopik_id dan judul wajib']); exit;
  }
  $stmt = $pdo->prepare('
    UPDATE materi
    SET subtopik_id=?, judul=?, konten=?, highlights=?, is_published=?, urutan=?, updated_at=NOW()
    WHERE id=?
  ');
  $stmt->execute([
    $body['subtopik_id'],
    trim($body['judul']),
    $body['konten']       ?? null,
    json_encode($body['highlights'] ?? []),
    $body['is_published'] ?? 0,
    isset($body['urutan']) ? (int)$body['urutan'] : 0,
    $id,
  ]);
  echo json_encode(['message' => 'Materi berhasil diupdate']);
  exit;
}

// DELETE /admin/materi/bulk  — body: { ids: [1,2,3] }
if ($uri === '/admin/materi/bulk' && $method === 'DELETE') {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $ids  = array_filter(array_map('intval', $body['ids'] ?? []), fn($id) => $id > 0);
  if (empty($ids)) { http_response_code(400); echo json_encode(['error' => 'ids wajib']); exit; }
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $pdo->prepare("DELETE FROM materi WHERE id IN ($placeholders)")->execute($ids);
  echo json_encode(['deleted' => count($ids)]);
  exit;
}

// PUT /admin/materi/reorder — body: { items: [{id, urutan}] }
if ($uri === '/admin/materi/reorder' && $method === 'PUT') {
  $items = $body['items'] ?? [];
  $updated = 0;
  $stmt = $pdo->prepare("UPDATE materi SET urutan = ? WHERE id = ?");
  foreach ($items as $item) {
    $id = (int)($item['id'] ?? 0);
    $urutan = (int)($item['urutan'] ?? 0);
    if ($id > 0) { $stmt->execute([$urutan, $id]); $updated++; }
  }
  echo json_encode(['updated' => $updated]);
  exit;
}

// DELETE /admin/materi?id=X
if ($uri === '/admin/materi' && $method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if (!$id) { http_response_code(400); echo json_encode(['error' => 'id wajib']); exit; }
  $pdo->prepare('DELETE FROM materi WHERE id = ?')->execute([$id]);
  echo json_encode(['message' => 'Materi berhasil dihapus']);
  exit;
}
