-- migration_materi_views.sql
-- Track individual materi page views for analytics (who viewed what, when)

-- 1. Add cached views counter to materi table (if not already exists)
ALTER TABLE materi
  ADD COLUMN IF NOT EXISTS `views` int(11) NOT NULL DEFAULT 0;

-- 2. New tracking table
CREATE TABLE IF NOT EXISTS `materi_views` (
  `id`        bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `materi_id` int(11)             NOT NULL,
  `user_id`   int(11)             DEFAULT NULL,  -- NULL = anonymous / belum login
  `viewed_at` datetime            NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_materi_id`      (`materi_id`),
  KEY `idx_user_id`        (`user_id`),
  KEY `idx_viewed_at`      (`viewed_at`),
  KEY `idx_materi_viewed`  (`materi_id`, `viewed_at`),
  CONSTRAINT `materi_views_ibfk_1` FOREIGN KEY (`materi_id`) REFERENCES `materi` (`id`) ON DELETE CASCADE,
  CONSTRAINT `materi_views_ibfk_2` FOREIGN KEY (`user_id`)   REFERENCES `users`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
