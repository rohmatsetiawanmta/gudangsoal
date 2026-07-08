-- migration_pertanyaan.sql
-- Tambah kolom pertanyaan (mini quiz) ke tabel materi
ALTER TABLE materi ADD COLUMN pertanyaan JSON NULL AFTER highlights;
