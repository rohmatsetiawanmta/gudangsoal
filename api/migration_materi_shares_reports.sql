-- Tabel share & report untuk materi (dipakai routes/materi.php).
-- Disamakan dengan struktur di DB live (dicek via phpMyAdmin, 26 Sep 2026).
-- IF NOT EXISTS: aman dijalankan di DB yang tabelnya sudah ada.

CREATE TABLE IF NOT EXISTS `materi_shares` (
  `id`         bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `materi_id`  int(10) UNSIGNED    NOT NULL,
  `user_id`    int(10) UNSIGNED    DEFAULT NULL,
  `platform`   enum('whatsapp','telegram','facebook','twitter','threads','email','copy') NOT NULL,
  `ip_address` varchar(45)         DEFAULT NULL,
  `created_at` timestamp           NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_materi_id`  (`materi_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_platform`   (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `materi_reports` (
  `id`         int(11)      NOT NULL AUTO_INCREMENT,
  `materi_id`  int(11)      NOT NULL,
  `alasan`     varchar(255) NOT NULL,
  `deskripsi`  text         DEFAULT NULL,
  `created_at` timestamp    NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `materi_id` (`materi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
