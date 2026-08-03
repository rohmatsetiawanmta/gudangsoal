<?php
// render.php — Server-side meta tag injection for SPA routes
$base = 'https://gudangsoal.com';
$uri  = strtok($_SERVER['REQUEST_URI'] ?? '/', '?');

$title     = 'Gudang Soal — Platform Latihan Matematika Terlengkap';
$desc      = 'Latihan soal matematika dari SD hingga UTBK, CPNS, dan OSN. Dilengkapi pembahasan detail, sistem XP, dan tracking progress belajarmu. Gratis selamanya.';
$canonical = $base . $uri;
$robots    = 'index, follow';
$status    = 200;

// ── Klasifikasi URL ───────────────────────────────────────────────────────────
// Route statis yang diketahui valid (tidak butuh DB)
$staticRoutes = [
    '/', '/home', '/browse', '/materi', '/latihan', '/games',
    '/faq', '/changelog', '/privacy', '/login', '/register', '/populer',
    '/search', '/request-soal', '/profile', '/verify-email',
];
$staticPrefixes = ['/games/', '/admin/', '/latihan/', '/quiz/'];

function isStaticRoute($uri, $staticRoutes, $staticPrefixes) {
    if (in_array($uri, $staticRoutes)) return true;
    foreach ($staticPrefixes as $p) {
        if (str_starts_with($uri, $p)) return true;
    }
    // /browse dengan depth partial (tanpa mencapai subtopik) tetap valid
    if (preg_match('#^/browse(/[^/]+){0,4}$#', $uri)) return true;
    return false;
}

// ── Koneksi DB ────────────────────────────────────────────────────────────────
$pdo           = null;
$dbRouteHit    = false; // URL cocok dengan pola DB-backed
$dbFound       = false; // Data ditemukan di DB

try {
    $env = parse_ini_file(__DIR__ . '/api/.env') ?: [];
    $pdo = new PDO(
        'mysql:host=' . $env['DB_HOST'] . ';dbname=' . $env['DB_NAME'] . ';charset=utf8mb4',
        $env['DB_USER'], $env['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Exception $e) { /* serve with defaults if DB unavailable */ }

if ($pdo) {
    // /soal/:kode
    if (preg_match('#^/soal/([A-Z0-9]+)$#i', $uri, $m)) {
        $dbRouteHit = true;
        $stmt = $pdo->prepare('
            SELECT s.body, s.kode, mp.nama AS mapel
            FROM soal s
            JOIN subtopik st ON s.subtopik_id = st.id
            JOIN topik     t  ON st.topik_id   = t.id
            JOIN mapel     mp ON t.mapel_id    = mp.id
            WHERE s.kode = ? AND s.is_published = 1
        ');
        $stmt->execute([$m[1]]);
        if ($row = $stmt->fetch()) {
            $dbFound = true;
            $title   = 'Soal ' . $row['mapel'] . ' (#' . $row['kode'] . ') | Gudang Soal';
            $plain   = preg_replace(['/\$\$?[^$]+\$\$?/', '/[*_~`#\[\]>]/'], '', $row['body']);
            $desc    = mb_substr(trim($plain), 0, 155) . '…';
        }

    // /materi/:id
    } elseif (preg_match('#^/materi/(\d+)$#', $uri, $m)) {
        $dbRouteHit = true;
        $stmt = $pdo->prepare('
            SELECT m.judul, mp.nama AS mapel, t.nama AS topik, st.nama AS subtopik
            FROM materi m
            JOIN subtopik   st ON m.subtopik_id    = st.id
            JOIN topik       t ON st.topik_id      = t.id
            JOIN mapel      mp ON t.mapel_id       = mp.id
            WHERE m.id = ? AND m.is_published = 1
        ');
        $stmt->execute([(int)$m[1]]);
        if ($row = $stmt->fetch()) {
            $dbFound = true;
            $title   = $row['judul'] . ' | Gudang Soal';
            $parts   = array_filter([$row['mapel'], $row['topik'], $row['subtopik']]);
            $desc    = 'Materi belajar: ' . $row['judul'] . ' — ' . implode(', ', $parts) . '. Lengkap dengan rumus dan ringkasan.';
        }

    // /browse/:j/:sj/:m/:t/:st (halaman daftar soal per subtopik)
    } elseif (preg_match('#^/browse/([^/]+)/([^/]+)/([^/]+)/([^/]+)/([^/]+)$#', $uri, $m)) {
        $dbRouteHit = true;
        $stmt = $pdo->prepare('
            SELECT st.nama AS subtopik, mp.nama AS mapel, j.nama AS jenjang,
                   (SELECT COUNT(*) FROM soal s WHERE s.subtopik_id = st.id AND s.is_published = 1) AS total
            FROM subtopik   st
            JOIN topik       t  ON st.topik_id      = t.id
            JOIN mapel      mp  ON t.mapel_id       = mp.id
            JOIN subjenjang sj  ON mp.subjenjang_id = sj.id
            JOIN jenjang     j  ON sj.jenjang_id    = j.id
            WHERE j.slug = ? AND sj.slug = ? AND mp.slug = ? AND t.slug = ? AND st.slug = ?
              AND st.is_published = 1
        ');
        $stmt->execute([$m[1], $m[2], $m[3], $m[4], $m[5]]);
        if ($row = $stmt->fetch()) {
            $dbFound = true;
            $title   = $row['subtopik'] . ' — ' . $row['mapel'] . ' | Gudang Soal';
            $desc    = $row['total'] . ' soal latihan ' . $row['subtopik'] . ' ' . $row['mapel']
                     . ' jenjang ' . $row['jenjang'] . '. Lengkap dengan pembahasan detail.';
        }
    }
}

// ── Tentukan status HTTP + robots ─────────────────────────────────────────────
if ($dbRouteHit && !$dbFound) {
    // Pola cocok (soal/materi/browse) tapi tidak ada di DB atau unpublished
    $status    = 404;
    $robots    = 'noindex, nofollow';
    $canonical = $base; // jangan self-reference URL yang tidak valid
} elseif (!$dbRouteHit && !isStaticRoute($uri, $staticRoutes, $staticPrefixes)) {
    // URL sama sekali tidak dikenal — bukan pola valid manapun
    $status    = 404;
    $robots    = 'noindex, nofollow';
    $canonical = $base;
}

http_response_code($status);

// ── Load & inject index.html ──────────────────────────────────────────────────
$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    // Fallback minimal jika index.html tidak bisa dibaca
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">'
       . '<meta name="robots" content="noindex">'
       . '<title>Gudang Soal</title></head><body><div id="root"></div></body></html>';
    exit;
}

$t = htmlspecialchars($title,     ENT_QUOTES, 'UTF-8');
$d = htmlspecialchars($desc,      ENT_QUOTES, 'UTF-8');
$c = htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8');
$r = $robots;

$html = preg_replace('/(<meta\s+name=["\']robots["\']\s+content=)["\'][^"\']*["\']/',              '$1"' . $r . '"', $html);
$html = preg_replace('/<title>[^<]*<\/title>/',                                                    "<title>$t</title>", $html);
$html = preg_replace('/(<meta\s+name=["\']title["\']\s+content=)["\'][^"\']*["\']/',               '$1"' . $t . '"', $html);
$html = preg_replace('/(<meta\s+name=["\']description["\']\s+content=)["\'][^"\']*["\']/',         '$1"' . $d . '"', $html);
$html = preg_replace('/(<link\s+rel=["\']canonical["\']\s+href=)["\'][^"\']*["\']/',               '$1"' . $c . '"', $html);
$html = preg_replace('/(<meta\s+property=["\']og:url["\']\s+content=)["\'][^"\']*["\']/',          '$1"' . $c . '"', $html);
$html = preg_replace('/(<meta\s+property=["\']og:title["\']\s+content=)["\'][^"\']*["\']/',        '$1"' . $t . '"', $html);
$html = preg_replace('/(<meta\s+property=["\']og:description["\']\s+content=)["\'][^"\']*["\']/',  '$1"' . $d . '"', $html);
$html = preg_replace('/(<meta\s+name=["\']twitter:title["\']\s+content=)["\'][^"\']*["\']/',       '$1"' . $t . '"', $html);
$html = preg_replace('/(<meta\s+name=["\']twitter:description["\']\s+content=)["\'][^"\']*["\']/', '$1"' . $d . '"', $html);

echo $html;
