<?php
// api/routes/browse.php

// GET /browse/jenjang
if ($uri === '/browse/jenjang' && $method === 'GET') {
  $stmt = $pdo->query('SELECT * FROM jenjang WHERE is_published = 1 ORDER BY urutan ASC, id ASC');
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/subjenjang?jenjang_slug=sd
if ($uri === '/browse/subjenjang' && $method === 'GET') {
  $jenjang_slug = $_GET['jenjang_slug'] ?? null;
  if (!$jenjang_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'jenjang_slug wajib diisi']);
    exit;
  }
  $stmt = $pdo->prepare('
    SELECT sj.* FROM subjenjang sj
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE j.slug = ? AND j.is_published = 1 AND sj.is_published = 1
    ORDER BY sj.urutan ASC, sj.id ASC
  ');
  $stmt->execute([$jenjang_slug]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/mapel?jenjang_slug=sd&subjenjang_slug=kelas-6
if ($uri === '/browse/mapel' && $method === 'GET') {
  $jenjang_slug    = $_GET['jenjang_slug']    ?? null;
  $subjenjang_slug = $_GET['subjenjang_slug'] ?? null;
  if (!$jenjang_slug || !$subjenjang_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'jenjang_slug dan subjenjang_slug wajib diisi']);
    exit;
  }
  $stmt = $pdo->prepare('
    SELECT m.* FROM mapel m
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE j.slug = ? AND sj.slug = ?
      AND j.is_published = 1 AND sj.is_published = 1 AND m.is_published = 1
    ORDER BY m.urutan ASC, m.id ASC
  ');
  $stmt->execute([$jenjang_slug, $subjenjang_slug]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/topik?jenjang_slug=sd&subjenjang_slug=kelas-6&mapel_slug=matematika
if ($uri === '/browse/topik' && $method === 'GET') {
  $jenjang_slug    = $_GET['jenjang_slug']    ?? null;
  $subjenjang_slug = $_GET['subjenjang_slug'] ?? null;
  $mapel_slug      = $_GET['mapel_slug']      ?? null;
  if (!$jenjang_slug || !$subjenjang_slug || !$mapel_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'jenjang_slug, subjenjang_slug, dan mapel_slug wajib diisi']);
    exit;
  }
  $stmt = $pdo->prepare('
    SELECT t.* FROM topik t
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE j.slug = ? AND sj.slug = ? AND m.slug = ?
      AND j.is_published = 1 AND sj.is_published = 1
      AND m.is_published = 1 AND t.is_published = 1
    ORDER BY t.urutan ASC, t.id ASC
  ');
  $stmt->execute([$jenjang_slug, $subjenjang_slug, $mapel_slug]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/subtopik?jenjang_slug=sd&subjenjang_slug=kelas-6&mapel_slug=matematika&topik_slug=bangun-ruang
if ($uri === '/browse/subtopik' && $method === 'GET') {
  $jenjang_slug    = $_GET['jenjang_slug']    ?? null;
  $subjenjang_slug = $_GET['subjenjang_slug'] ?? null;
  $mapel_slug      = $_GET['mapel_slug']      ?? null;
  $topik_slug      = $_GET['topik_slug']      ?? null;
  if (!$jenjang_slug || !$subjenjang_slug || !$mapel_slug || !$topik_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'Semua slug wajib diisi']);
    exit;
  }
  $authUser = getAuthUser();
  $user_id  = $authUser ? $authUser['id'] : 0;
  $stmt = $pdo->prepare('
    SELECT st.*,
      COUNT(DISTINCT s.id) AS soal_count,
      COUNT(DISTINCT CASE WHEN se.is_correct = 1 THEN s.id END) AS answered_count
    FROM subtopik st
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    LEFT JOIN soal s ON s.subtopik_id = st.id AND s.is_published = 1 AND s.is_exclusive = 0
    LEFT JOIN sessions se ON se.soal_id = s.id AND se.user_id = ? AND se.is_correct = 1
    WHERE j.slug = ? AND sj.slug = ? AND m.slug = ? AND t.slug = ?
      AND j.is_published = 1 AND sj.is_published = 1
      AND m.is_published = 1 AND t.is_published = 1 AND st.is_published = 1
    GROUP BY st.id
    ORDER BY st.urutan ASC, st.id ASC
  ');
  $stmt->execute([$user_id, $jenjang_slug, $subjenjang_slug, $mapel_slug, $topik_slug]);
  $rows = $stmt->fetchAll();
  foreach ($rows as &$r) {
    $r['soal_count']    = (int) $r['soal_count'];
    $r['answered_count'] = (int) $r['answered_count'];
  }
  echo json_encode($rows);
  exit;
}

// GET /browse/soal?...semua slug
if ($uri === '/browse/soal' && $method === 'GET') {
  $jenjang_slug    = $_GET['jenjang_slug']    ?? null;
  $subjenjang_slug = $_GET['subjenjang_slug'] ?? null;
  $mapel_slug      = $_GET['mapel_slug']      ?? null;
  $topik_slug      = $_GET['topik_slug']      ?? null;
  $subtopik_slug   = $_GET['subtopik_slug']   ?? null;
  if (!$jenjang_slug || !$subjenjang_slug || !$mapel_slug || !$topik_slug || !$subtopik_slug) {
    http_response_code(400);
    echo json_encode(['error' => 'Semua slug wajib diisi']);
    exit;
  }
  $stmt = $pdo->prepare('
    SELECT s.id, s.kode, s.body, s.options, s.difficulty FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE j.slug = ? AND sj.slug = ? AND m.slug = ? AND t.slug = ? AND st.slug = ?
      AND j.is_published = 1 AND sj.is_published = 1 AND m.is_published = 1
      AND t.is_published = 1 AND st.is_published = 1 AND s.is_published = 1
      AND s.is_exclusive = 0
    ORDER BY s.created_at ASC
  ');
  $stmt->execute([$jenjang_slug, $subjenjang_slug, $mapel_slug, $topik_slug, $subtopik_slug]);
  $soal = $stmt->fetchAll();
  foreach ($soal as &$s) {
    $s['options'] = json_decode($s['options']);
    $s['answered_correct'] = false;
  }

  // Bulk answered status for logged-in user
  $authUser = getAuthUser();
  if ($authUser && !empty($soal)) {
    $kodes = array_column($soal, 'kode');
    $placeholders = implode(',', array_fill(0, count($kodes), '?'));
    $aStmt = $pdo->prepare("
      SELECT DISTINCT s.kode FROM sessions se
      JOIN soal s ON se.soal_id = s.id
      WHERE se.user_id = ? AND s.kode IN ($placeholders) AND se.is_correct = 1
    ");
    $aStmt->execute(array_merge([$authUser['id']], $kodes));
    $answeredSet = array_flip(array_column($aStmt->fetchAll(), 'kode'));
    foreach ($soal as &$s) {
      $s['answered_correct'] = isset($answeredSet[$s['kode']]);
    }
  }

  $metaStmt = $pdo->prepare('
    SELECT j.nama AS jenjang, sj.nama AS subjenjang, m.nama AS mapel, t.nama AS topik, st.nama AS subtopik
    FROM subtopik st
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE j.slug = ? AND sj.slug = ? AND m.slug = ? AND t.slug = ? AND st.slug = ?
    LIMIT 1
  ');
  $metaStmt->execute([$jenjang_slug, $subjenjang_slug, $mapel_slug, $topik_slug, $subtopik_slug]);
  $meta = $metaStmt->fetch() ?: (object)[];

  echo json_encode(['soal' => $soal, 'meta' => $meta]);
  exit;
}

// GET /browse/soal/detail?kode=A6E5M9
if ($uri === '/browse/soal/detail' && $method === 'GET') {
  $kode = $_GET['kode'] ?? null;
  if (!$kode) {
    http_response_code(400);
    echo json_encode(['error' => 'kode wajib diisi']);
    exit;
  }

  // Increment views
  $pdo->prepare('UPDATE soal SET views = views + 1 WHERE kode = ?')->execute([$kode]);

  $stmt = $pdo->prepare('
    SELECT s.*,
           st.nama as subtopik_nama, st.slug as subtopik_slug,
           t.nama  as topik_nama,    t.slug  as topik_slug,
           m.nama  as mapel_nama,    m.slug  as mapel_slug,
           sj.nama as subjenjang_nama, sj.slug as subjenjang_slug,
           j.nama  as jenjang_nama,  j.slug  as jenjang_slug
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE s.kode = ? AND s.is_published = 1
  ');
  $stmt->execute([$kode]);
  $soal = $stmt->fetch();

  if (!$soal) {
    http_response_code(404);
    echo json_encode(['error' => 'Soal tidak ditemukan']);
    exit;
  }

  $soal['options'] = json_decode($soal['options']);
  $soal['answer']  = json_decode($soal['answer']);

  // Materi terkait
  $materi_ids = $soal['materi_ids'] ? json_decode($soal['materi_ids'], true) : [];
  if (!empty($materi_ids)) {
    $placeholders = implode(',', array_fill(0, count($materi_ids), '?'));
    $mStmt = $pdo->prepare("SELECT id, judul FROM materi WHERE id IN ($placeholders) AND is_published = 1 ORDER BY FIELD(id, $placeholders)");
    $mStmt->execute(array_merge($materi_ids, $materi_ids));
    $soal['materi_terkait'] = $mStmt->fetchAll();
  } else {
    $soal['materi_terkait'] = [];
  }
  unset($soal['materi_ids']);

  // Stats soal
  $stmt = $pdo->prepare('
    SELECT
      COUNT(DISTINCT user_id) as total_user,
      COUNT(*) as total_attempt,
      COUNT(DISTINCT CASE WHEN is_correct = 1 THEN user_id END) as total_benar
    FROM sessions
    WHERE soal_id = ?
  ');
  $stmt->execute([$soal['id']]);
  $stats = $stmt->fetch();

  $soal['stats'] = [
    'total_user'    => (int) $stats['total_user'],
    'total_attempt' => (int) $stats['total_attempt'],
    'total_benar'   => (int) $stats['total_benar'],
    'akurasi' => $stats['total_attempt'] > 0
      ? round($stats['total_benar'] / $stats['total_attempt'] * 100)
      : 0,
  ];

  echo json_encode($soal);
  exit;
}

// GET /browse/search?q=aljabar&jenjang_slug=sma&difficulty=2&tipe=pilihan_ganda&page=1
if ($uri === '/browse/search' && $method === 'GET') {
  $q             = trim($_GET['q'] ?? '');
  $jenjang_slug  = $_GET['jenjang_slug']  ?? '';
  $difficulty    = $_GET['difficulty']    ?? '';
  $tipe          = $_GET['tipe']          ?? '';
  $page          = intval($_GET['page']   ?? 1);
  $limit         = 10;
  $offset        = ($page - 1) * $limit;

  if (strlen($q) < 2) {
    echo json_encode(['soal' => [], 'topik' => [], 'jenjang' => [], 'total' => 0]);
    exit;
  }

  $like = "%$q%";

  // Build where clause untuk soal
  $soalWhere  = ['s.is_published = 1', 's.body LIKE ?'];
  $soalParams = [$like];

  if ($jenjang_slug) {
    $soalWhere[]  = 'j.slug = ?';
    $soalParams[] = $jenjang_slug;
  }
  if ($difficulty && in_array($difficulty, ['1', '2', '3'])) {
    $soalWhere[]  = 's.difficulty = ?';
    $soalParams[] = $difficulty;
  }
  if ($tipe) {
    $allowed_tipe = ['pilihan_ganda', 'isian_singkat', 'isian_numerik', 'checklist', 'multiple_choice_table', 'menjodohkan'];
    if (in_array($tipe, $allowed_tipe)) {
      $soalWhere[]  = 's.tipe = ?';
      $soalParams[] = $tipe;
    }
  }

  $soalWhereClause = implode(' AND ', $soalWhere);

  // Count total
  $countStmt = $pdo->prepare("
    SELECT COUNT(*) FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE $soalWhereClause
  ");
  $countStmt->execute($soalParams);
  $totalSoal = (int) $countStmt->fetchColumn();

  // Soal dengan pagination
  $stmt = $pdo->prepare("
  SELECT s.id, s.kode, s.body, s.difficulty, s.tipe,
         st.nama as subtopik, t.nama as topik,
         m.nama as mapel, sj.nama as subjenjang, j.nama as jenjang,
         st.slug as subtopik_slug, t.slug as topik_slug,
         m.slug as mapel_slug, sj.slug as subjenjang_slug, j.slug as jenjang_slug
  FROM soal s
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  JOIN subjenjang sj ON m.subjenjang_id = sj.id
  JOIN jenjang j ON sj.jenjang_id = j.id
  WHERE $soalWhereClause
  ORDER BY s.created_at DESC
  LIMIT $limit OFFSET $offset
");
$stmt->execute($soalParams);
  $soal = $stmt->fetchAll();

  // Topik & Subtopik — hanya kalau tidak ada filter soal spesifik
  $topik = [];
  $jenjangResults = [];

  if (!$jenjang_slug && !$difficulty && !$tipe) {
    $stmt = $pdo->prepare('
      (SELECT t.id, t.nama as topik, t.slug as topik_slug,
             m.nama as mapel, m.slug as mapel_slug,
             sj.nama as subjenjang, sj.slug as subjenjang_slug,
             j.nama as jenjang, j.slug as jenjang_slug,
             "topik" as type
      FROM topik t
      JOIN mapel m ON t.mapel_id = m.id
      JOIN subjenjang sj ON m.subjenjang_id = sj.id
      JOIN jenjang j ON sj.jenjang_id = j.id
      WHERE t.is_published = 1 AND t.nama LIKE ?
      LIMIT 10)
      UNION
      (SELECT st.id, st.nama as topik, st.slug as topik_slug,
             m.nama as mapel, m.slug as mapel_slug,
             sj.nama as subjenjang, sj.slug as subjenjang_slug,
             j.nama as jenjang, j.slug as jenjang_slug,
             "subtopik" as type
      FROM subtopik st
      JOIN topik t ON st.topik_id = t.id
      JOIN mapel m ON t.mapel_id = m.id
      JOIN subjenjang sj ON m.subjenjang_id = sj.id
      JOIN jenjang j ON sj.jenjang_id = j.id
      WHERE st.is_published = 1 AND st.nama LIKE ?
      LIMIT 10)
    ');
    $stmt->execute([$like, $like]);
    $topik = $stmt->fetchAll();

    $stmt = $pdo->prepare('
      (SELECT j.id, j.nama, j.slug, j.kode, "jenjang" as type
      FROM jenjang j
      WHERE j.is_published = 1 AND j.nama LIKE ?
      LIMIT 10)
      UNION
      (SELECT sj.id, sj.nama, sj.slug, j.kode, "subjenjang" as type
      FROM subjenjang sj
      JOIN jenjang j ON sj.jenjang_id = j.id
      WHERE sj.is_published = 1 AND sj.nama LIKE ?
      LIMIT 10)
    ');
    $stmt->execute([$like, $like]);
    $jenjangResults = $stmt->fetchAll();
  }

  echo json_encode([
    'soal'    => $soal,
    'topik'   => $topik,
    'jenjang' => $jenjangResults,
    'total'   => $totalSoal,
    'page'    => $page,
    'limit'   => $limit,
  ]);
  exit;
}

// GET /browse/soal/status?kode=ABC123
if ($uri === '/browse/soal/status' && $method === 'GET') {
  $authUser = getAuthUser();
  if (!$authUser) {
    echo json_encode(['answered_correct' => false]);
    exit;
  }

  $kode = $_GET['kode'] ?? null;
  if (!$kode) {
    echo json_encode(['answered_correct' => false]);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT se.is_correct FROM sessions se
    JOIN soal s ON se.soal_id = s.id
    WHERE se.user_id = ? AND s.kode = ? AND se.is_correct = 1
    LIMIT 1
  ');
  $stmt->execute([$authUser['id'], $kode]);
  $found = $stmt->fetch();

  echo json_encode(['answered_correct' => (bool) $found]);
  exit;
}

// GET /browse/stats
if ($uri === '/browse/stats' && $method === 'GET') {
  $totalSoal     = $pdo->query('SELECT COUNT(*) FROM soal WHERE is_published = 1')->fetchColumn();
  $totalUser     = $pdo->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn();
  $totalJenjang  = $pdo->query('SELECT COUNT(*) FROM jenjang WHERE is_published = 1')->fetchColumn();
  $totalSubtopik = $pdo->query('SELECT COUNT(*) FROM subtopik WHERE is_published = 1')->fetchColumn();

  echo json_encode([
    'total_soal'     => (int) $totalSoal,
    'total_user'     => (int) $totalUser,
    'total_jenjang'  => (int) $totalJenjang,
    'total_subtopik' => (int) $totalSubtopik,
  ]);
  exit;
}

// GET /browse/random?jenjang_slug=utbk&subjenjang_slug=...&mapel_slug=...&difficulty=2
if ($uri === '/browse/random' && $method === 'GET') {
  $jenjang_slug    = $_GET['jenjang_slug']    ?? null;
  $subjenjang_slug = $_GET['subjenjang_slug'] ?? null;
  $mapel_slug      = $_GET['mapel_slug']      ?? null;
  $difficulty      = $_GET['difficulty']      ?? null;

  $where  = ['s.is_published = 1'];
  $params = [];

  if ($jenjang_slug) {
    $where[]  = 'j.slug = ?';
    $params[] = $jenjang_slug;
  }
  if ($subjenjang_slug) {
    $where[]  = 'sj.slug = ?';
    $params[] = $subjenjang_slug;
  }
  if ($mapel_slug) {
    $where[]  = 'm.slug = ?';
    $params[] = $mapel_slug;
  }
  if ($difficulty && in_array($difficulty, ['1', '2', '3'])) {
    $where[]  = 's.difficulty = ?';
    $params[] = $difficulty;
  }

  $whereClause = implode(' AND ', $where);

  $stmt = $pdo->prepare("
    SELECT s.kode FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    WHERE $whereClause
    ORDER BY RAND()
    LIMIT 1
  ");
  $stmt->execute($params);
  $soal = $stmt->fetch();

  if (!$soal) {
    http_response_code(404);
    echo json_encode(['error' => 'Tidak ada soal yang sesuai filter']);
    exit;
  }

  echo json_encode(['kode' => $soal['kode']]);
  exit;
}

// GET /browse/populer?limit=10
if ($uri === '/browse/populer' && $method === 'GET') {
  $limit = min(intval($_GET['limit'] ?? 10), 20);

  $stmt = $pdo->query("
    SELECT s.kode, s.body, s.difficulty, s.tipe,
           s.views,
           st.nama as subtopik, m.nama as mapel,
           j.nama as jenjang,
           COUNT(DISTINCT se.user_id) as total_dikerjakan,
           COUNT(DISTINCT CASE WHEN se.is_correct = 1 THEN se.user_id END) as total_benar,
           (
             COUNT(DISTINCT se.user_id) * 3 +
             s.views * 1 +
             (COUNT(DISTINCT CASE WHEN se.is_correct = 1 THEN se.user_id END) / NULLIF(COUNT(DISTINCT se.user_id), 0) * 100) * 2
           ) as skor_populer
    FROM soal s
    JOIN subtopik st ON s.subtopik_id = st.id
    JOIN topik t ON st.topik_id = t.id
    JOIN mapel m ON t.mapel_id = m.id
    JOIN subjenjang sj ON m.subjenjang_id = sj.id
    JOIN jenjang j ON sj.jenjang_id = j.id
    JOIN sessions se ON se.soal_id = s.id
    WHERE s.is_published = 1
    GROUP BY s.id
    ORDER BY skor_populer DESC
    LIMIT $limit
  ");

  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/soal-hari-ini
if ($uri === '/browse/soal-hari-ini' && $method === 'GET') {
  // Seed dari tanggal — semua user dapat soal yang sama
  $seed = (int) date('Ymd');

  // Ambil semua jenjang yang published
  $jenjangStmt = $pdo->query('SELECT id, nama, slug, kode FROM jenjang WHERE is_published = 1 ORDER BY urutan ASC, id ASC');
  $jenjangList = $jenjangStmt->fetchAll();

  $result = [];

  foreach ($jenjangList as $j) {
    // Ambil semua soal published di jenjang ini
$stmt = $pdo->prepare('
  SELECT s.id, s.kode, s.body, s.difficulty, s.tipe,
         st.nama as subtopik, t.nama as topik,
         m.nama as mapel, sj.nama as subjenjang
  FROM soal s
  JOIN subtopik st ON s.subtopik_id = st.id
  JOIN topik t ON st.topik_id = t.id
  JOIN mapel m ON t.mapel_id = m.id
  JOIN subjenjang sj ON m.subjenjang_id = sj.id
  JOIN jenjang j ON sj.jenjang_id = j.id
  WHERE j.id = ? AND s.is_published = 1
  ORDER BY s.id ASC
');
    $stmt->execute([$j['id']]);
    $soalList = $stmt->fetchAll();

    if (empty($soalList)) continue;

    // Pilih 1 soal berdasarkan seed tanggal
    $idx = ($seed + $j['id']) % count($soalList);
    $soal = $soalList[$idx];

    $result[] = [
      'jenjang_id'   => $j['id'],
      'jenjang_nama' => $j['nama'],
      'jenjang_slug' => $j['slug'],
      'jenjang_kode' => $j['kode'],
      'soal'         => $soal,
    ];
  }

  echo json_encode($result);
  exit;
}

// GET /browse/subjenjang-list?jenjang_id=X
if ($uri === '/browse/subjenjang-list' && $method === 'GET') {
  $jenjang_id = (int) ($_GET['jenjang_id'] ?? 0);
  if (!$jenjang_id) { echo json_encode([]); exit; }
  $stmt = $pdo->prepare('SELECT id, nama FROM subjenjang WHERE jenjang_id = ? AND is_published = 1 ORDER BY urutan ASC, id ASC');
  $stmt->execute([$jenjang_id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/mapel-list?subjenjang_id=X
if ($uri === '/browse/mapel-list' && $method === 'GET') {
  $subjenjang_id = (int) ($_GET['subjenjang_id'] ?? 0);
  if (!$subjenjang_id) { echo json_encode([]); exit; }
  $stmt = $pdo->prepare('SELECT id, nama FROM mapel WHERE subjenjang_id = ? AND is_published = 1 ORDER BY urutan ASC, id ASC');
  $stmt->execute([$subjenjang_id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/topik-list?mapel_id=X
if ($uri === '/browse/topik-list' && $method === 'GET') {
  $mapel_id = (int) ($_GET['mapel_id'] ?? 0);
  if (!$mapel_id) { echo json_encode([]); exit; }
  $stmt = $pdo->prepare('SELECT id, nama FROM topik WHERE mapel_id = ? AND is_published = 1 ORDER BY urutan ASC, id ASC');
  $stmt->execute([$mapel_id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/subtopik-list?topik_id=X
if ($uri === '/browse/subtopik-list' && $method === 'GET') {
  $topik_id = (int) ($_GET['topik_id'] ?? 0);
  if (!$topik_id) { echo json_encode([]); exit; }
  $stmt = $pdo->prepare('SELECT id, nama FROM subtopik WHERE topik_id = ? AND is_published = 1 ORDER BY urutan ASC, id ASC');
  $stmt->execute([$topik_id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/materi?subtopik_id=X  OR  ?subtopik_slug=X
if ($uri === '/browse/materi' && $method === 'GET' && (isset($_GET['subtopik_id']) || isset($_GET['subtopik_slug']))) {
  if (isset($_GET['subtopik_id'])) {
    $subtopik_id = (int) $_GET['subtopik_id'];
  } else {
    $slugStmt = $pdo->prepare('SELECT id FROM subtopik WHERE slug = ?');
    $slugStmt->execute([$_GET['subtopik_slug']]);
    $subtopik_id = (int) ($slugStmt->fetchColumn() ?: 0);
    if (!$subtopik_id) { echo json_encode([]); exit; }
  }
  $stmt = $pdo->prepare('
    SELECT m.id, m.judul, m.created_at, m.updated_at
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id    = j.id
    WHERE m.subtopik_id = ? AND m.is_published = 1
      AND st.is_published = 1 AND t.is_published = 1
      AND mp.is_published = 1 AND sj.is_published = 1 AND j.is_published = 1
    ORDER BY m.urutan ASC, m.id ASC
  ');
  $stmt->execute([$subtopik_id]);
  echo json_encode($stmt->fetchAll());
  exit;
}

// GET /browse/materi/list  (index publik semua materi, dengan pagination + search)
if ($uri === '/browse/materi/list' && $method === 'GET') {
  $page   = max(1, intval($_GET['page']  ?? 1));
  $limit  = min(40, max(1, intval($_GET['limit'] ?? 20)));
  $offset = ($page - 1) * $limit;
  $search = trim($_GET['search'] ?? '');

  $where  = ['m.is_published = 1', 'st.is_published = 1', 't.is_published = 1', 'mp.is_published = 1', 'sj.is_published = 1', 'j.is_published = 1'];
  $params = [];
  if ($search)                    { $where[] = 'm.judul LIKE ?'; $params[] = "%$search%"; }
  if (isset($_GET['subtopik_id']))     { $where[] = 'm.subtopik_id = ?';    $params[] = (int)$_GET['subtopik_id']; }
  elseif (isset($_GET['topik_id']))    { $where[] = 'st.topik_id = ?';      $params[] = (int)$_GET['topik_id']; }
  elseif (isset($_GET['mapel_id']))    { $where[] = 't.mapel_id = ?';       $params[] = (int)$_GET['mapel_id']; }
  elseif (isset($_GET['subjenjang_id'])) { $where[] = 'sj.id = ?';         $params[] = (int)$_GET['subjenjang_id']; }
  elseif (isset($_GET['jenjang_id'])) { $where[] = 'j.id = ?';             $params[] = (int)$_GET['jenjang_id']; }

  $whereStr = 'WHERE ' . implode(' AND ', $where);

  $orderBy = isset($_GET['subtopik_id'])
    ? 'ORDER BY m.urutan ASC, m.id ASC'
    : 'ORDER BY j.urutan ASC, sj.urutan ASC, mp.urutan ASC, t.urutan ASC, st.urutan ASC, m.urutan ASC, m.id ASC';

  $stmt = $pdo->prepare("
    SELECT m.id, m.judul, m.updated_at,
           st.nama AS subtopik, t.nama AS topik,
           mp.nama AS mapel, sj.nama AS subjenjang, j.nama AS jenjang
    FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id    = j.id
    $whereStr
    $orderBy
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);

  $countStmt = $pdo->prepare("
    SELECT COUNT(*) FROM materi m
    JOIN subtopik   st ON m.subtopik_id    = st.id
    JOIN topik       t ON st.topik_id      = t.id
    JOIN mapel      mp ON t.mapel_id       = mp.id
    JOIN subjenjang sj ON mp.subjenjang_id = sj.id
    JOIN jenjang     j ON sj.jenjang_id    = j.id
    $whereStr
  ");
  $countStmt->execute($params);

  echo json_encode([
    'data'  => $stmt->fetchAll(),
    'total' => (int) $countStmt->fetchColumn(),
    'page'  => $page,
    'limit' => $limit,
  ]);
  exit;
}
