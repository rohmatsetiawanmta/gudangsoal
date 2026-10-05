-- Migration: transaksi paket v2
-- Tambah status refunded, catatan admin, dan jejak perubahan manual.

ALTER TABLE `paket_soal_transactions`
  MODIFY `status` enum('pending','success','failed','expired','cancelled','refunded') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `admin_note` varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `updated_by` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp();
