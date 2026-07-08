<?php
// api/config/mailer.php

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../vendor/autoload.php';

$_env = parse_ini_file(__DIR__ . '/../.env') ?: [];

define('SMTP_HOST',      'smtp.hostinger.com');
define('SMTP_PORT',      465);
define('SMTP_USER',      'noreply@gudangsoal.com');
define('SMTP_PASS',      $_env['SMTP_PASS'] ?? '');
define('SMTP_FROM',      'noreply@gudangsoal.com');
define('SMTP_FROM_NAME', 'Gudang Soal');
define('APP_URL',        'https://gudangsoal.com');

function sendVerificationEmail(string $toEmail, string $toName, string $token): bool {
  $mail = new PHPMailer(true);
  try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
    $mail->addAddress($toEmail, $toName);

    $verifyUrl = APP_URL . '/verify-email?token=' . $token;

    $mail->isHTML(true);
    $mail->Subject = 'Konfirmasi Email — Gudang Soal';
    $mail->Body    = buildEmailHtml($toName, $verifyUrl);
    $mail->AltBody = "Halo $toName,\n\nKlik link ini untuk konfirmasi email kamu:\n$verifyUrl\n\nLink berlaku 24 jam.\n\nJika kamu tidak mendaftar di Gudang Soal, abaikan email ini.";

    $mail->send();
    return true;
  } catch (\Exception $e) {
    error_log('Mailer error: ' . $e->getMessage());
    return false;
  }
}

function buildEmailHtml(string $name, string $url): string {
  return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Email</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f2efe8;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">

    <!-- Logo -->
    <div style="text-align:center;padding:28px 0 20px;">
      <span style="font-size:21px;font-weight:400;color:#0f0e17;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;letter-spacing:-0.3px;">
        Gudang <span style="color:#e84c2b;">Soal</span>
      </span>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:20px;padding:40px 36px;border:1px solid #e2ddd5;box-shadow:0 2px 12px rgba(0,0,0,.04);">

      <h1 style="font-size:22px;font-weight:800;color:#0f0e17;margin:0 0 10px;letter-spacing:-0.4px;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
        Konfirmasi email kamu
      </h1>
      <p style="font-size:15px;color:#6b6860;line-height:1.65;margin:0 0 28px;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
        Halo <strong style="color:#0f0e17;">$name</strong>, terima kasih sudah daftar di Gudang Soal!<br>
        Klik tombol di bawah untuk mengaktifkan akun kamu dan mulai belajar.
      </p>

      <a href="$url"
         style="display:inline-block;background:#e84c2b;color:white;font-size:15px;font-weight:700;padding:13px 28px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(232,76,43,.3);font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
        Konfirmasi Email
      </a>

      <p style="font-size:13px;color:#b4b2a9;margin:16px 0 0;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
        Jika tombol tidak bisa diklik, buka link berikut:<br>
        <a href="$url" style="color:#e84c2b;word-break:break-all;">$url</a>
      </p>

      <hr style="border:none;border-top:1px solid #f0ede6;margin:28px 0;">

      <p style="font-size:13px;color:#b4b2a9;margin:0;line-height:1.65;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
        Link ini berlaku selama <strong style="color:#6b6860;">24 jam</strong>.<br>
        Jika kamu tidak mendaftar di Gudang Soal, abaikan email ini.
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:12px;color:#b4b2a9;margin-top:20px;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
      © 2026 Gudang Soal &nbsp;·&nbsp;
      <a href="https://gudangsoal.com" style="color:#b4b2a9;text-decoration:none;">gudangsoal.com</a>
    </p>
  </div>
</body>
</html>
HTML;
}
