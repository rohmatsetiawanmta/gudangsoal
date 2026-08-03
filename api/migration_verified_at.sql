ALTER TABLE users
  ADD COLUMN verified_at DATETIME NULL AFTER email_verified;

-- Untuk user lama yang sudah verified, set verified_at = created_at sebagai estimasi
UPDATE users SET verified_at = created_at WHERE email_verified = 1 AND verified_at IS NULL;
