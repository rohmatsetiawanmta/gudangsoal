-- =====================================================================
-- Migration: Revert restrukturisasi UTBK Penalaran Matematika (PM)
-- =====================================================================
-- migration_utbk_pm_restructure.sql (sebelumnya) mengasumsikan Penalaran
-- Matematika adalah komponen tes TERPISAH dari Tes Literasi. Ternyata
-- keliru -- struktur resmi SNPMB mengelompokkan "Penalaran Matematika"
-- sebagai salah satu dari 3 sub-materi di bawah "Tes Literasi", sejajar
-- dengan "Literasi dalam Bahasa Indonesia" dan "Literasi dalam Bahasa
-- Inggris" (lihat "Materi Tes" resmi SNPMB: 1. Tes Potensi Skolastik
-- (4 sub), 2. Tes Literasi (3 sub: B.Indo, B.Inggris, Penalaran
-- Matematika)).
--
-- Revert: kembalikan mapel id=4 ke subjenjang "Tes Literasi" (id=14)
-- dengan nama aslinya, hapus subjenjang "Penalaran Matematika" (id=21)
-- yang sudah tidak dipakai, dan lepas status coming_soon dari Tes
-- Literasi karena sudah ada isinya lagi.
-- =====================================================================

START TRANSACTION;

UPDATE mapel
   SET subjenjang_id = 14,
       nama = 'Penalaran Matematika',
       slug = 'penalaran-matematika'
 WHERE id = 4;

UPDATE subjenjang SET is_coming_soon = 0 WHERE id = 14;

DELETE FROM subjenjang WHERE id = 21;

COMMIT;

-- =====================================================================
-- VERIFIKASI MANUAL
-- =====================================================================
-- SELECT id, nama, slug, urutan, is_published, is_coming_soon FROM subjenjang WHERE jenjang_id = 4 ORDER BY urutan;
-- SELECT id, subjenjang_id, nama, slug FROM mapel WHERE id = 4;
-- =====================================================================
