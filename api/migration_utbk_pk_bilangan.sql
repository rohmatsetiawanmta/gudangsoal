-- =====================================================================
-- Migration: Restrukturisasi subtopik UTBK Pengetahuan Kuantitatif (PK)
--            Topik: Bilangan (topik_id = 6, mapel_id = 6)
-- =====================================================================
-- Strategi: RENAME + REPARENT row subtopik yang SUDAH ADA (bukan bikin
-- row baru). Reassign soal.subtopik_id untuk kasus MERGE dilakukan DULU,
-- baru subtopik lama di-UNPUBLISH (is_published = 0, TIDAK DI-DELETE).
--
-- Kenapa tidak boleh DELETE row subtopik lama:
--   - materi.subtopik_id punya FK `materi_ibfk_1` dengan ON DELETE CASCADE
--     ke subtopik(id). Kalau row subtopik di-DELETE, materi yang nempel
--     akan ikut terhapus otomatis. UNPUBLISH aman karena tidak men-trigger
--     CASCADE apapun.
--   - soal.subtopik_id punya FK `soal_ibfk_1` (tanpa CASCADE) ke
--     subtopik(id) — row subtopik lama masih harus ada selama masih
--     dirujuk, dan setelah reassign soal pun lebih aman dibiarkan exist
--     (menghindari asumsi keliru soal tabel lain yang belum tentu
--     ter-cover, misal bookmarks/reports/soal_requests/quiz_set_soal —
--     sudah dicek, tabel-tabel itu HANYA reference soal_id/soal_kode,
--     TIDAK ADA kolom subtopik_id, jadi tidak ada risiko FK dari sana).
--
-- Verifikasi yang sudah dilakukan sebelum menulis migration ini:
--   - subtopik punya UNIQUE KEY (topik_id, slug). Target reparent/rename
--     di bawah sudah dicek manual: TIDAK ADA collision slug dengan baris
--     lain yang akan berakhir di topik_id = 6 (baik yang sudah ada
--     maupun yang baru masuk).
--   - slug KOLOM SENGAJA TIDAK DIUBAH meski nama berubah. SQL langsung
--     tidak men-trigger logic auto-slug di application layer, dan tidak
--     ada keharusan mengubah slug (tidak ada collision yang memaksa).
--     Mengubah slug akan mengubah URL publik/bookmark yang sudah ada —
--     keputusan itu sengaja TIDAK diambil di sini. Kalau nanti memang
--     mau slug disinkronkan dengan nama baru, itu perlu keputusan
--     terpisah (idealnya lewat admin UI edit, bukan raw SQL silent).
--   - topik_id 4 (Aljabar), 6 (Bilangan), 7 (Statistika dan Peluang),
--     9 (Geometri) semua berada di bawah mapel_id = 6 (UTBK PK) — tidak
--     ada risiko pindah subtopik ke mapel yang salah.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- MERGE: id=6 "Keterbagian" (2 soal) dan id=9 "FPB dan KPK" (1 soal)
--        digabung ke survivor id=32 "Operasi Hitung Bilangan".
-- Urutan WAJIB: reassign soal DULU, baru unpublish subtopik lama.
-- ---------------------------------------------------------------------
UPDATE soal SET subtopik_id = 32 WHERE subtopik_id = 6;
UPDATE soal SET subtopik_id = 32 WHERE subtopik_id = 9;

UPDATE subtopik SET is_published = 0 WHERE id IN (6, 9);

UPDATE subtopik SET nama = 'Operasi Hitung & Sifat Bilangan' WHERE id = 32;

-- ---------------------------------------------------------------------
-- REPARENT + RENAME: pindahkan 4 subtopik dari topik_id=4 (Aljabar)
-- ke topik_id=6 (Bilangan). Row yang SAMA diupdate in-place — row
-- id=20 punya 12 materi nempel, materi otomatis "ikut" karena row-nya
-- tidak diganti, cuma di-UPDATE.
-- ---------------------------------------------------------------------
UPDATE subtopik
   SET topik_id = 6, nama = 'Eksponen & Bentuk Akar'
 WHERE id = 21;

UPDATE subtopik
   SET topik_id = 6, nama = 'Rasio & Perbandingan'
 WHERE id = 29;

UPDATE subtopik
   SET topik_id = 6
 WHERE id = 22; -- "Aritmetika Sosial" — nama tetap, cuma pindah topik

UPDATE subtopik
   SET topik_id = 6, nama = 'Barisan & Deret'
 WHERE id = 20; -- PUNYA 12 MATERI nempel — row SAMA, bukan row baru

COMMIT;

-- =====================================================================
-- VERIFIKASI MANUAL (jalankan setelah migration, bukan bagian migration)
-- =====================================================================
-- 1) Pastikan row lama (merge losers) sudah unpublished, bukan hilang:
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE id IN (6, 9, 32);
--
-- 2) Pastikan soal sudah pindah semua ke survivor id=32, dan id=6/9 kosong:
-- SELECT subtopik_id, COUNT(*) AS total FROM soal WHERE subtopik_id IN (6, 9, 32) GROUP BY subtopik_id;
--
-- 3) Pastikan 12 materi id=20 tidak berubah jumlah/relasinya:
-- SELECT COUNT(*) AS total_materi FROM materi WHERE subtopik_id = 20; -- expect 12
--
-- 4) Lihat hasil akhir topik Bilangan (expect 5 subtopik aktif: 20,21,22,29,32
--    plus 2 unpublished sisa merge: 6,9 -> total 7 row dengan topik_id=6):
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE topik_id = 6 ORDER BY id;
--
-- 5) Pastikan tidak ada subtopik lain di topik_id=6 dengan slug yang
--    sama (sanity check unique key, harusnya 0 baris):
-- SELECT slug, COUNT(*) FROM subtopik WHERE topik_id = 6 GROUP BY slug HAVING COUNT(*) > 1;
-- =====================================================================
