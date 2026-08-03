-- Jalankan di phpMyAdmin atau MySQL CLI

ALTER TABLE users
  ADD COLUMN email_verified        TINYINT(1)   NOT NULL DEFAULT 0   AFTER role,
  ADD COLUMN verification_token    VARCHAR(64)  NULL                  AFTER email_verified,
  ADD COLUMN verification_expires_at DATETIME   NULL                  AFTER verification_token;

-- Tandai semua akun LAMA sebagai sudah terverifikasi
-- (supaya user yang sudah ada tidak kena lock-out)
UPDATE users SET email_verified = 1 WHERE email_verified = 0;
