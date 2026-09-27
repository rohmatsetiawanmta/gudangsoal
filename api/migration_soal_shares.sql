-- Local reference only, not deployed
-- platform disamakan dengan DB live (27 Sep 2026); versi awalnya hanya whatsapp/twitter/threads/copy,
-- lalu diperluas oleh migration_shares_platform_enum.sql. Jalankan file ini SEBELUM file enum itu.
CREATE TABLE IF NOT EXISTS soal_shares (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  soal_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  platform ENUM('whatsapp','telegram','facebook','twitter','threads','email','copy') NOT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_soal_id (soal_id),
  INDEX idx_created_at (created_at),
  INDEX idx_platform (platform)
);
