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
 * Ambil status transaksi langsung dari API Midtrans (dipakai untuk sinkronisasi manual).
 * Return array status Midtrans, atau null kalau gagal dihubungi.
 */
function midtransFetchStatus($orderId) {
  if (!MIDTRANS_SERVER_KEY) return null;
  $base = MIDTRANS_IS_PRODUCTION ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
  $ch = curl_init($base . '/v2/' . rawurlencode($orderId) . '/status');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
      'Accept: application/json',
      'Authorization: Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':'),
    ],
    CURLOPT_TIMEOUT => 15,
  ]);
  $res  = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($res === false || $code !== 200) return null;
  $data = json_decode($res, true);
  return is_array($data) && isset($data['transaction_status']) ? $data : null;
}

/**
 * Terjemahkan transaction_status + fraud_status Midtrans ke status internal.
 * Status yang tidak dikenal mempertahankan status sekarang, supaya tidak ada
 * perubahan diam-diam.
 */
function midtransMapStatus($transactionStatus, $fraudStatus, $current) {
  if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
    if ($fraudStatus === 'challenge') return 'pending';
    if ($fraudStatus === 'deny')      return 'failed';
    return 'success';
  }
  if (in_array($transactionStatus, ['pending', 'authorize'], true)) return 'pending';
  if (in_array($transactionStatus, ['deny', 'cancel', 'failure'], true)) return 'failed';
  if ($transactionStatus === 'expire') return 'expired';
  if (in_array($transactionStatus, ['refund', 'partial_refund', 'chargeback', 'partial_chargeback'], true)) return 'refunded';
  return $current;
}

/**
 * Terapkan data status Midtrans ke satu transaksi. Dipakai webhook dan sinkronisasi.
 * Nominal harus cocok dengan transaksi di database; kalau tidak, data diabaikan.
 */
function midtransApplyStatus(PDO $pdo, array $trx, array $data, $updatedBy = null) {
  if ((int) round((float) ($data['gross_amount'] ?? 0)) !== (int) $trx['amount']) {
    error_log('[midtrans] nominal tidak cocok untuk order ' . $trx['order_id']);
    return false;
  }

  $newStatus = midtransMapStatus($data['transaction_status'] ?? '', $data['fraud_status'] ?? null, $trx['status']);

  $stmt = $pdo->prepare('
    UPDATE paket_soal_transactions
    SET status = ?, payment_type = ?, midtrans_transaction_id = ?, raw_notification = ?,
        paid_at = IF(? = 1 AND paid_at IS NULL, NOW(), paid_at),
        updated_by = COALESCE(?, updated_by)
    WHERE order_id = ?
  ');
  $stmt->execute([
    $newStatus,
    $data['payment_type'] ?? null,
    $data['transaction_id'] ?? null,
    json_encode($data),
    $newStatus === 'success' ? 1 : 0,
    $updatedBy,
    $trx['order_id'],
  ]);
  return $newStatus;
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
