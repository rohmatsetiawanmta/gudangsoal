-- Kolom soal.stimulus — teks konteks/stimulus opsional yang tampil sebelum teks soal
-- (gaya ANBK/TKA numerasi). Boleh kosong, tidak semua soal punya stimulus.

ALTER TABLE `soal`
  ADD COLUMN IF NOT EXISTS `stimulus` text DEFAULT NULL AFTER `tags`;
