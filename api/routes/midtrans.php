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

  try {
    midtransApplyStatus($pdo, $trx, $data);
  } catch (Throwable $e) {
    error_log('[midtrans] update transaksi gagal: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Gagal update transaksi']);
    exit;
  }

  echo json_encode(['message' => 'OK']);
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
