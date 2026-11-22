-- =====================================================================
-- Migration: Restrukturisasi UTBK Penalaran Matematika (PM)
-- =====================================================================
-- Masalah: mapel "Penalaran Matematika" (id=4, 4 topik / 7 subtopik /
-- 9 soal) saat ini nempel di bawah subjenjang "Tes Literasi" (id=14,
-- jenjang UTBK id=4). Ini salah struktur -- di SNBT/UTBK, Penalaran
-- Matematika adalah komponen tes TERSENDIRI, bukan bagian dari Tes
-- Literasi (yang isinya literasi Bahasa Indonesia & Inggris) maupun
-- Tes Potensi Skolastik.
--
-- Fix: bikin subjenjang baru "Penalaran Matematika" (sibling dari
-- "Tes Potensi Skolastik" & "Tes Literasi"), lalu REPARENT mapel id=4
-- ke situ (row yang sama di-UPDATE, bukan row baru -- topik/subtopik/
-- soal yang nempel otomatis ikut, tidak ada data yang di-reassign/
-- hilang). Mapel di-rename dari "Penalaran Matematika" jadi
-- "Matematika" supaya tidak duplikat nama dengan subjenjang barunya
-- di breadcrumb (pola yang sama dipakai subjenjang lain: nama mapel
-- generik, nama subjenjang yang spesifik).
--
-- "Tes Literasi" (id=14) jadi kosong (0 mapel) setelah mapel-nya
-- pindah. Ditandai is_coming_soon=1 supaya tidak jadi halaman kosong
-- buat user, sampai konten literasi (B.Indo/B.Inggris) beneran dibuat.
--
-- Verifikasi yang sudah dilakukan sebelum menulis migration ini:
--   - UNIQUE KEY (jenjang_id, slug) di subjenjang: slug baru
--     'penalaran-matematika' dicek belum dipakai subjenjang lain di
--     jenjang_id=4 (UTBK) -- cuma ada 'tes-potensi-skolastik' &
--     'tes-literasi'.
--   - UNIQUE KEY (subjenjang_id, slug) di mapel: subjenjang baru pasti
--     belum punya mapel apapun (baru dibuat), jadi slug 'matematika'
--     di situ otomatis tidak collision.
--   - Tidak ada kode frontend/backend yang hardcode slug
--     'tes-literasi' atau 'penalaran-matematika' (sudah di-grep) --
--     aman full dari sisi data saja, tidak perlu ubah kode.
--   - Soal, topik, subtopik di bawah mapel id=4 TIDAK disentuh sama
--     sekali (cuma mapel.subjenjang_id/nama/slug yang berubah).
-- =====================================================================

START TRANSACTION;

-- 1) Subjenjang baru, urutan=3 (setelah Tes Potensi Skolastik=1,
--    Tes Literasi=2), sesuai urutan komponen tes SNBT yang sebenarnya.
INSERT INTO subjenjang (jenjang_id, nama, slug, urutan, is_published, is_coming_soon)
VALUES (4, 'Penalaran Matematika', 'penalaran-matematika', 3, 1, 0);

-- 2) Reparent + rename mapel id=4 ke subjenjang baru di atas.
UPDATE mapel
   SET subjenjang_id = LAST_INSERT_ID(),
       nama = 'Matematika',
       slug = 'matematika'
 WHERE id = 4;

-- 3) Tandai "Tes Literasi" sebagai coming soon (sekarang kosong).
UPDATE subjenjang SET is_coming_soon = 1 WHERE id = 14;

COMMIT;

-- =====================================================================
-- VERIFIKASI MANUAL (jalankan setelah migration, bukan bagian migration)
-- =====================================================================
-- 1) Subjenjang baru sudah ada & urutannya benar:
-- SELECT id, nama, slug, urutan, is_published FROM subjenjang WHERE jenjang_id = 4 ORDER BY urutan;
--
-- 2) Mapel id=4 sudah pindah & ganti nama:
-- SELECT id, subjenjang_id, nama, slug FROM mapel WHERE id = 4;
--
-- 3) Topik/subtopik/soal di bawah mapel id=4 tidak berubah jumlahnya
--    (expect: 4 topik, 7 subtopik, 9 soal -- sama kayak sebelum migrasi):
-- SELECT COUNT(*) FROM topik WHERE mapel_id = 4;
-- SELECT COUNT(*) FROM subtopik st JOIN topik t ON st.topik_id = t.id WHERE t.mapel_id = 4;
-- SELECT COUNT(*) FROM soal s JOIN subtopik st ON s.subtopik_id = st.id JOIN topik t ON st.topik_id = t.id WHERE t.mapel_id = 4;
--
-- 4) "Tes Literasi" sekarang coming_soon & tidak punya mapel:
-- SELECT * FROM subjenjang WHERE id = 14;
-- SELECT COUNT(*) FROM mapel WHERE subjenjang_id = 14; -- expect 0
-- =====================================================================
