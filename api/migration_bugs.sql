CREATE TABLE IF NOT EXISTS bugs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  steps       TEXT         NULL,
  severity    ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  status      ENUM('open','in_progress','fixed','wontfix') NOT NULL DEFAULT 'open',
  category    ENUM('frontend','backend','api','lainnya') NOT NULL DEFAULT 'lainnya',
  notes       TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status   (status),
  INDEX idx_severity (severity),
  INDEX idx_category (category)
);
