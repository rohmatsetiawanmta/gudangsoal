-- Migration: Paket Soal
-- Jalankan sekali di database

CREATE TABLE IF NOT EXISTS paket_soal (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  tahun       SMALLINT NULL,
  jenis       ENUM('olimpiade','un','utbk','seleksi','ujian_sekolah','lainnya') NOT NULL DEFAULT 'lainnya',
  deskripsi   TEXT NULL,
  is_published TINYINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paket_soal_items (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  paket_id  INT NOT NULL,
  soal_id   INT NOT NULL,
  urutan    INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_paket_soal (paket_id, soal_id),
  FOREIGN KEY (paket_id) REFERENCES paket_soal(id) ON DELETE CASCADE,
  FOREIGN KEY (soal_id)  REFERENCES soal(id) ON DELETE CASCADE
);
