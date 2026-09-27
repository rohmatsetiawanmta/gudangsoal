-- Kolom materi.urutan (urutan materi dalam satu subtopik) — dipakai routes/materi.php (prev/next)
-- dan admin.php. Disamakan dengan DB live (dicek via phpMyAdmin, 26 Sep 2026).
-- ADD COLUMN IF NOT EXISTS (MariaDB): aman dijalankan di DB yang kolomnya sudah ada.

ALTER TABLE `materi`
  ADD COLUMN IF NOT EXISTS `urutan` int(11) NOT NULL DEFAULT 0 AFTER `updated_at`;
