-- Local reference only, not deployed
CREATE TABLE IF NOT EXISTS soal_shares (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  soal_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  platform ENUM('whatsapp','twitter','threads','copy') NOT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_soal_id (soal_id),
  INDEX idx_created_at (created_at),
  INDEX idx_platform (platform)
);
