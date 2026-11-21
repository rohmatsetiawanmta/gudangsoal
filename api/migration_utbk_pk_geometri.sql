-- =====================================================================
-- Migration: Restrukturisasi subtopik UTBK Pengetahuan Kuantitatif (PK)
--            Topik: Geometri (topik_id = 9, mapel_id = 6)
-- =====================================================================
-- Strategi: RENAME + REPARENT row subtopik yang SUDAH ADA (bukan bikin
-- row baru). Tidak ada kasus MERGE di topik ini, jadi tidak ada reassign
-- soal.subtopik_id yang dibutuhkan.
--
-- Verifikasi yang sudah dilakukan (lihat juga catatan lengkap di
-- migration_utbk_pk_bilangan.sql):
--   - id=5 "Persamaan Garis Lurus" (2 soal) berasal dari topik_id=4
--     (Aljabar) dan di-REPARENT masuk ke topik_id=9 di file ini.
--     Dicek: topik_id=9 tidak punya row dengan slug
--     'persamaan-garis-lurus' sebelumnya -> tidak ada collision dengan
--     UNIQUE KEY (topik_id, slug).
--   - slug id=5 SENGAJA TIDAK DIUBAH (nama juga tidak berubah untuk
--     kasus ini).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- RENAME ONLY: id=11 "Sudut" (2 soal) -> "Sudut & Garis". Tidak ada
-- subtopik "Garis" terpisah yang digabung, jadi ini bukan merge.
-- ---------------------------------------------------------------------
UPDATE subtopik SET nama = 'Sudut & Garis' WHERE id = 11;

-- ---------------------------------------------------------------------
-- BUG FIX: id=13 "Bangun Datar" (1 soal) saat ini is_published=0 di
-- level subtopik, sehingga soal-nya tidak tampil ke siswa meski soal
-- itu sendiri published. PUBLISH subtopik-nya, nama tetap.
-- ---------------------------------------------------------------------
UPDATE subtopik SET is_published = 1 WHERE id = 13;

-- id=14 "Bangun Ruang" (0 soal, is_published=0) SENGAJA TIDAK DISENTUH
-- — tidak ada soal untuk ditampilkan, tidak perlu dipaksa publish.

-- ---------------------------------------------------------------------
-- REPARENT: pindahkan id=5 "Persamaan Garis Lurus" dari topik_id=4
-- (Aljabar) ke topik_id=9 (Geometri). Nama tetap.
-- ---------------------------------------------------------------------
UPDATE subtopik SET topik_id = 9 WHERE id = 5;

COMMIT;

-- =====================================================================
-- VERIFIKASI MANUAL (jalankan setelah migration, bukan bagian migration)
-- =====================================================================
-- 1) Cek state 4 subtopik yang disentuh:
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE id IN (5, 11, 13, 14);
--
-- 2) Pastikan soal id=13 "Bangun Datar" sekarang tampil (subtopik published):
-- SELECT COUNT(*) FROM soal WHERE subtopik_id = 13 AND is_published = 1; -- expect >= 1
--
-- 3) Lihat hasil akhir topik Geometri — expect 4 row (5,11,13,14):
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE topik_id = 9 ORDER BY id;
--
-- 4) Sanity check tidak ada duplikat slug dalam topik_id=9:
-- SELECT slug, COUNT(*) FROM subtopik WHERE topik_id = 9 GROUP BY slug HAVING COUNT(*) > 1;
-- =====================================================================
