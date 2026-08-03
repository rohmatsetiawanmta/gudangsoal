CREATE TABLE IF NOT EXISTS feature_roadmap (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  category    ENUM('user','konten','admin','teknis','lainnya') NOT NULL DEFAULT 'lainnya',
  priority    ENUM('low','medium','high')                      NOT NULL DEFAULT 'medium',
  status      ENUM('idea','planned','in_progress','done','cancelled') NOT NULL DEFAULT 'idea',
  notes       TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status   (status),
  INDEX idx_priority (priority),
  INDEX idx_category (category)
);
