<?php
// api/index.php
date_default_timezone_set('Asia/Jakarta');
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require 'config/db.php';
require 'config/helpers.php';
require 'helpers/jwt.php';

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true);

if (str_starts_with($uri, '/auth/')) {
  require 'routes/auth.php';
} elseif (str_starts_with($uri, '/browse/')) {
  require 'routes/browse.php';
} elseif (str_starts_with($uri, '/admin/quiz')) {
  require 'routes/quiz.php';
} elseif (str_starts_with($uri, '/admin/')) {
  require 'routes/admin.php';
} elseif (str_starts_with($uri, '/profile')) {
  require 'routes/profile.php';
} elseif ($uri === '/upload/image' && $method === 'POST') {
  require 'routes/upload.php';
} elseif ($uri === '/report') {
  require 'routes/report.php';
} elseif (str_starts_with($uri, '/soal-request')) {
  require 'routes/soal_request.php';
} elseif (str_starts_with($uri, '/changelog')) {
  require 'routes/changelog.php';
} elseif (str_starts_with($uri, '/bookmark')) {
  require 'routes/bookmark.php';
} elseif (str_starts_with($uri, '/feedback')) {
  require 'routes/feedback.php';
} elseif (str_starts_with($uri, '/notifications')) {
  require 'routes/notifications.php';
} elseif (str_starts_with($uri, '/quiz')) {
  require 'routes/quiz.php';
} elseif (str_starts_with($uri, '/games')) {
  require 'routes/game.php';
} else {
  http_response_code(404);
  echo json_encode(['error' => 'Endpoint tidak ditemukan']);
}