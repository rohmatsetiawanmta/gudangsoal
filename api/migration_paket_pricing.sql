-- Tambah harga per paket (0 = gratis) + tabel transaksi pembayaran Midtrans.
-- Idempotent (aman dijalankan ulang).

ALTER TABLE `paket_soal`
  ADD COLUMN IF NOT EXISTS `harga` int(11) NOT NULL DEFAULT 0 AFTER `jenis`;

CREATE TABLE IF NOT EXISTS `paket_soal_transactions` (
  `id`                       int(11)      NOT NULL AUTO_INCREMENT,
  `user_id`                  int(11)      NOT NULL,
  `paket_id`                 int(11)      NOT NULL,
  `order_id`                 varchar(100) NOT NULL,
  `amount`                   int(11)      NOT NULL,
  `status`                   enum('pending','success','failed','expired','cancelled') NOT NULL DEFAULT 'pending',
  `payment_type`             varchar(50)  DEFAULT NULL,
  `midtrans_transaction_id`  varchar(100) DEFAULT NULL,
  `raw_notification`         longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_notification`)),
  `created_at`                timestamp    NULL DEFAULT current_timestamp(),
  `paid_at`                  timestamp    NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_id` (`order_id`),
  KEY `idx_user_paket` (`user_id`, `paket_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_pst_user`  FOREIGN KEY (`user_id`)  REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pst_paket` FOREIGN KEY (`paket_id`) REFERENCES `paket_soal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
