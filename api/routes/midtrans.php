<?php
// api/routes/midtrans.php — konfigurasi publik + webhook notifikasi Midtrans

// GET /midtrans/config — client key publik (aman diekspos ke frontend,
// beda dengan server key yang wajib rahasia)
if ($uri === '/midtrans/config' && $method === 'GET') {
  echo json_encode([
    'client_key'    => MIDTRANS_CLIENT_KEY,
    'is_production' => MIDTRANS_IS_PRODUCTION,
    'enabled'       => MIDTRANS_CLIENT_KEY !== '' && MIDTRANS_SERVER_KEY !== '',
  ]);
  exit;
}

// POST /midtrans/notification — webhook server-to-server dari Midtrans.
// Diatur di dashboard Midtrans: Settings > Configuration > Payment Notification URL
// = https://gudangsoal.com/api/midtrans/notification
if ($uri === '/midtrans/notification' && $method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);

  if (!$data || !isset($data['order_id'], $data['status_code'], $data['gross_amount'], $data['signature_key'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload tidak valid']);
    exit;
  }

  $orderId = $data['order_id'];
  $valid   = midtransVerifySignature($orderId, $data['status_code'], $data['gross_amount'], $data['signature_key']);
  if (!$valid) {
    http_response_code(403);
    echo json_encode(['error' => 'Signature tidak valid']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT * FROM paket_soal_transactions WHERE order_id = ?');
  $stmt->execute([$orderId]);
  $trx = $stmt->fetch();
  if (!$trx) {
    // Tetap balas 200 supaya Midtrans tidak retry terus untuk order_id yang
    // memang bukan dari sistem kita.
    echo json_encode(['message' => 'Order tidak dikenali, diabaikan']);
    exit;
  }

  $transactionStatus = $data['transaction_status'] ?? '';
  $fraudStatus        = $data['fraud_status'] ?? null;

  if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
    $newStatus = ($fraudStatus === null || $fraudStatus === 'accept') ? 'success' : $trx['status'];
  } elseif ($transactionStatus === 'pending') {
    $newStatus = 'pending';
  } elseif (in_array($transactionStatus, ['deny', 'cancel'], true)) {
    $newStatus = 'failed';
  } elseif ($transactionStatus === 'expire') {
    $newStatus = 'expired';
  } else {
    $newStatus = $trx['status'];
  }

  $stmt = $pdo->prepare('
    UPDATE paket_soal_transactions
    SET status = ?, payment_type = ?, midtrans_transaction_id = ?, raw_notification = ?,
        paid_at = CASE WHEN ? = "success" AND paid_at IS NULL THEN NOW() ELSE paid_at END
    WHERE order_id = ?
  ');
  $stmt->execute([
    $newStatus,
    $data['payment_type'] ?? null,
    $data['transaction_id'] ?? null,
    json_encode($data),
    $newStatus,
    $orderId,
  ]);

  echo json_encode(['message' => 'OK']);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
