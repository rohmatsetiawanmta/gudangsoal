-- Disamakan dengan DB live (dicek via phpMyAdmin, 26 Sep 2026): key varchar(50), value text,
-- ditambah updated_at. Versi lama file ini memakai key varchar(64) dan value varchar(255) DEFAULT '1'.
CREATE TABLE IF NOT EXISTS `site_settings` (
  `key`        VARCHAR(50) NOT NULL PRIMARY KEY,
  `value`      TEXT        NOT NULL,
  `updated_at` TIMESTAMP   NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `site_settings` (`key`, `value`) VALUES
  ('menu_soal', '1'),
  ('menu_materi', '1'),
  ('menu_paket', '1'),
  ('menu_latihan', '1');
