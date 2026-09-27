-- Kolom soal.materi_ids (relasi ke materi, array JSON disimpan sebagai text) dan soal.tags
-- (array JSON). Dipakai admin.php & browse.php. Disamakan dengan DB live (dicek via phpMyAdmin,
-- 26 Sep 2026): keduanya ada di urutan terakhir, setelah `views`.
-- ADD COLUMN IF NOT EXISTS (MariaDB): aman dijalankan di DB yang kolomnya sudah ada.

ALTER TABLE `soal`
  ADD COLUMN IF NOT EXISTS `materi_ids` text DEFAULT NULL AFTER `views`,
  ADD COLUMN IF NOT EXISTS `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)) AFTER `materi_ids`;
