-- Track individual soal page views for analytics
CREATE TABLE IF NOT EXISTS `soal_views` (
  `id`       bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `soal_id`  int(11)             NOT NULL,
  `user_id`  int(11)             DEFAULT NULL,
  `viewed_at` datetime           NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_soal_id`     (`soal_id`),
  KEY `idx_user_id`     (`user_id`),
  KEY `idx_viewed_at`   (`viewed_at`),
  KEY `idx_soal_viewed` (`soal_id`, `viewed_at`),
  CONSTRAINT `soal_views_ibfk_1` FOREIGN KEY (`soal_id`) REFERENCES `soal` (`id`) ON DELETE CASCADE,
  CONSTRAINT `soal_views_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
