<?php
// api/config/cache.php — file-based query cache

define('CACHE_DIR', sys_get_temp_dir() . '/gs_cache/');

if (!is_dir(CACHE_DIR)) {
  @mkdir(CACHE_DIR, 0700, true);
}

function cache_key(string $ns, array $parts = []): string {
  return md5($ns . implode('|', $parts));
}

function cache_get(string $key): mixed {
  $file = CACHE_DIR . $key . '.json';
  if (!file_exists($file)) {
    header('X-Cache: MISS');
    return null;
  }
  $raw = file_get_contents($file);
  if ($raw === false) { header('X-Cache: MISS'); return null; }
  $data = json_decode($raw, true);
  if (!$data || ($data['expires'] ?? 0) < time()) {
    @unlink($file);
    header('X-Cache: MISS (expired)');
    return null;
  }
  $ttl_left = $data['expires'] - time();
  header("X-Cache: HIT (ttl={$ttl_left}s)");
  return $data['payload'];
}

function cache_set(string $key, mixed $payload, int $ttl = 300, string $ns = ''): void {
  $file = CACHE_DIR . $key . '.json';
  file_put_contents($file, json_encode([
    'expires' => time() + $ttl,
    'payload' => $payload,
    'ns'      => $ns,
  ]), LOCK_EX);
}

function cache_bust_prefix(string $prefix): void {
  foreach (glob(CACHE_DIR . '*.json') ?: [] as $file) {
    $raw = file_get_contents($file);
    $data = $raw ? json_decode($raw, true) : null;
    if ($data && isset($data['ns']) && str_starts_with($data['ns'], $prefix)) {
      @unlink($file);
    }
  }
}
