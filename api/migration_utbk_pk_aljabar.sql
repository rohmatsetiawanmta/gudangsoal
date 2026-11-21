-- =====================================================================
-- Migration: Restrukturisasi subtopik UTBK Pengetahuan Kuantitatif (PK)
--            Topik: Aljabar & Fungsi (topik_id = 4, mapel_id = 6)
-- =====================================================================
-- Strategi: RENAME + REPARENT row subtopik yang SUDAH ADA (bukan bikin
-- row baru). Reassign soal.subtopik_id untuk kasus MERGE dilakukan DULU,
-- baru subtopik lama di-UNPUBLISH (is_published = 0, TIDAK DI-DELETE).
--
-- PENTING: file ini HANYA berisi operasi yang murni di dalam topik_id=4
-- (merge/rename). Subtopik yang PINDAH KELUAR dari topik_id=4 ditangani
-- di file migration lain supaya tidak ada UPDATE topik_id yang bentrok
-- dijalankan dua kali di dua file berbeda:
--   - id=20, 21, 22, 29 -> pindah ke topik_id=6 (Bilangan),
--     lihat migration_utbk_pk_bilangan.sql
--   - id=5  -> pindah ke topik_id=9 (Geometri),
--     lihat migration_utbk_pk_geometri.sql
--
-- Verifikasi yang sudah dilakukan (lihat juga catatan lengkap di
-- migration_utbk_pk_bilangan.sql):
--   - UNIQUE KEY (topik_id, slug) di tabel subtopik: tidak ada collision
--     untuk rename di file ini karena topik_id tidak berubah (slug lama
--     tetap unik terhadap dirinya sendiri).
--   - slug SENGAJA TIDAK DIUBAH meski nama berubah (alasan sama seperti
--     file migration lain — menghindari breaking URL publik/bookmark
--     tanpa keharusan, karena tidak ada collision yang memaksa).
--   - materi.subtopik_id ON DELETE CASCADE ke subtopik(id) -> konfirmasi
--     kenapa row yang di-merge-out WAJIB di-UNPUBLISH, bukan DI-DELETE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- MERGE: id=17 "Pertidaksamaan" (1 soal) digabung ke survivor
--        id=8 "Persamaan" (3 soal).
-- Urutan WAJIB: reassign soal DULU, baru unpublish subtopik lama.
-- ---------------------------------------------------------------------
UPDATE soal SET subtopik_id = 8 WHERE subtopik_id = 17;

UPDATE subtopik SET is_published = 0 WHERE id = 17;

UPDATE subtopik SET nama = 'Persamaan & Pertidaksamaan' WHERE id = 8;

-- ---------------------------------------------------------------------
-- MERGE: id=38 "Fungsi Kuadrat" (1 soal) digabung ke survivor
--        id=35 "Persamaan Kuadrat" (2 soal).
-- ---------------------------------------------------------------------
UPDATE soal SET subtopik_id = 35 WHERE subtopik_id = 38;

UPDATE subtopik SET is_published = 0 WHERE id = 38;

UPDATE subtopik SET nama = 'Persamaan & Fungsi Kuadrat' WHERE id = 35;

-- ---------------------------------------------------------------------
-- RENAME ONLY: id=19 "Fungsi Komposisi dan Invers" (1 soal, sudah
-- published) -> "Fungsi (Komposisi & Invers)". Tidak ada merge.
-- id=18 "Fungsi" (0 soal, sudah unpublished dari sebelumnya) SENGAJA
-- TIDAK DISENTUH — tidak ada soal untuk direassign, biarkan apa adanya.
-- ---------------------------------------------------------------------
UPDATE subtopik SET nama = 'Fungsi (Komposisi & Invers)' WHERE id = 19;

COMMIT;

-- Tidak ada perubahan untuk id=34 "Bentuk Aljabar", id=24 "Sistem
-- Persamaan", id=23 "Matriks" — nama dan topik_id tetap, tidak perlu
-- statement apapun.

-- =====================================================================
-- VERIFIKASI MANUAL (jalankan setelah migration, bukan bagian migration)
-- =====================================================================
-- 1) Pastikan row merge losers sudah unpublished, bukan hilang:
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE id IN (8, 17, 35, 38, 19, 18);
--
-- 2) Pastikan soal sudah pindah ke survivor, dan loser kosong:
-- SELECT subtopik_id, COUNT(*) AS total FROM soal WHERE subtopik_id IN (8, 17, 35, 38) GROUP BY subtopik_id;
--
-- 3) Lihat hasil akhir topik Aljabar & Fungsi — expect 9 row total
--    dengan topik_id=4: 6 aktif (8,19,23,24,34,35) + 3 unpublished
--    sisa merge/lama (17,18,38). id=5,20,21,22,29 HARUS SUDAH TIDAK
--    ADA di sini (sudah pindah topik_id lewat file migration lain):
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE topik_id = 4 ORDER BY id;
--
-- 4) Sanity check tidak ada duplikat slug dalam topik_id=4:
-- SELECT slug, COUNT(*) FROM subtopik WHERE topik_id = 4 GROUP BY slug HAVING COUNT(*) > 1;
-- =====================================================================
