<?php
// api/helpers/jwt.php

define('JWT_SECRET', 'ganti-dengan-random-string-panjang-dan-unik');
define('JWT_EXPIRY', 60 * 60 * 24 * 7); // 7 hari dalam detik

function generateToken($payload) {
  $header  = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $payload = base64UrlEncode(json_encode(array_merge($payload, [
    'iat' => time(),
    'exp' => time() + JWT_EXPIRY,
  ])));
  $signature = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
  return "$header.$payload.$signature";
}

function verifyToken($token) {
  $parts = explode('.', $token);
  if (count($parts) !== 3) return null;

  [$header, $payload, $signature] = $parts;

  // Cek signature
  $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
  if (!hash_equals($expected, $signature)) return null;

  // Decode payload
  $data = json_decode(base64UrlDecode($payload), true);

  // Cek expired
  if ($data['exp'] < time()) return null;

  return $data;
}

function getAuthUser() {
  $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$header) return null;

  $token = str_replace('Bearer ', '', $header);
  return verifyToken($token);
}

// Helper encode/decode agar kompatibel dengan standar JWT
function base64UrlEncode($data) {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
  return base64_decode(strtr($data, '-_', '+/'));
}