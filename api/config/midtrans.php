<?php
// api/config/midtrans.php
//
// Isi di api/.env (belum ada = fitur pembayaran nonaktif dengan aman, checkout
// akan mengembalikan error yang jelas, bukan crash):
//   MIDTRANS_SERVER_KEY=<server key dari dashboard Midtrans>
//   MIDTRANS_CLIENT_KEY=<client key dari dashboard Midtrans>
//   MIDTRANS_IS_PRODUCTION=false   (isi "true" kalau sudah pakai key production)

$env = parse_ini_file(__DIR__ . '/../.env') ?: [];

define('MIDTRANS_SERVER_KEY',    $env['MIDTRANS_SERVER_KEY']    ?? '');
define('MIDTRANS_CLIENT_KEY',    $env['MIDTRANS_CLIENT_KEY']    ?? '');
define('MIDTRANS_IS_PRODUCTION', ($env['MIDTRANS_IS_PRODUCTION'] ?? 'false') === 'true');

define('MIDTRANS_SNAP_TRANSACTION_URL', MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions');

/**
 * Buat transaksi Snap baru di Midtrans.
 * Return array response Midtrans (ada 'token' & 'redirect_url') kalau sukses,
 * atau ['error' => [...]] kalau gagal / server key belum di-set.
 */
function midtransCreateSnapTransaction($orderId, $grossAmount, $itemDetails, $customerDetails) {
  if (!MIDTRANS_SERVER_KEY) {
    return ['error' => ['Pembayaran belum dikonfigurasi (MIDTRANS_SERVER_KEY kosong).']];
  }

  $payload = [
    'transaction_details' => [
      'order_id'     => $orderId,
      'gross_amount' => (int) $grossAmount,
    ],
    'item_details'     => $itemDetails,
    'customer_details' => $customerDetails,
  ];

  $ch = curl_init(MIDTRANS_SNAP_TRANSACTION_URL);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
      'Content-Type: application/json',
      'Accept: application/json',
      'Authorization: Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':'),
    ],
    CURLOPT_TIMEOUT => 15,
  ]);
  $res  = curl_exec($ch);
  $err  = curl_error($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($res === false) {
    return ['error' => ["Gagal menghubungi Midtrans: $err"]];
  }

  $data = json_decode($res, true);
  if ($code >= 200 && $code < 300 && isset($data['token'])) {
    return $data;
  }
  return ['error' => $data['error_messages'] ?? ["Midtrans menolak permintaan (HTTP $code)"]];
}

/**
 * Verifikasi signature_key dari notification callback Midtrans.
 * WAJIB pakai nilai gross_amount PERSIS seperti yang dikirim Midtrans di body
 * notifikasi (string, misal "50000.00") — jangan format ulang dari DB sendiri.
 */
function midtransVerifySignature($orderId, $statusCode, $grossAmount, $signatureKey) {
  if (!MIDTRANS_SERVER_KEY || !$signatureKey) return false;
  $expected = hash('sha512', $orderId . $statusCode . $grossAmount . MIDTRANS_SERVER_KEY);
  return hash_equals($expected, $signatureKey);
}
