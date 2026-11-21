-- =====================================================================
-- Migration: Restrukturisasi subtopik UTBK Pengetahuan Kuantitatif (PK)
--            Topik: Statistika dan Peluang (topik_id = 7, mapel_id = 6)
-- =====================================================================
-- Strategi: RENAME saja (tidak ada reparent, tidak ada merge) pada row
-- subtopik yang sudah ada.
--
-- Verifikasi yang sudah dilakukan:
--   - UNIQUE KEY (topik_id, slug) tidak terpengaruh karena topik_id
--     tidak berubah untuk ketiga row ini.
--   - 'Kaidah Pencacahan' dicek tidak bertabrakan dengan nama subtopik
--     lain manapun (SMA/OSN) di sistem ini.
--   - slug SENGAJA TIDAK DIUBAH meski nama berubah (alasan sama seperti
--     file migration lain — tidak ada collision yang memaksa perubahan
--     slug, dan mengubahnya akan mengubah URL publik yang sudah ada).
-- =====================================================================

START TRANSACTION;

-- id=7 "Statistika Deskriptif" — TIDAK ADA perubahan, nama & topik_id tetap.

UPDATE subtopik SET nama = 'Kaidah Pencacahan' WHERE id = 31;

UPDATE subtopik SET nama = 'Peluang' WHERE id = 12;

COMMIT;

-- =====================================================================
-- VERIFIKASI MANUAL (jalankan setelah migration, bukan bagian migration)
-- =====================================================================
-- 1) Cek state 3 subtopik topik ini:
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE id IN (7, 12, 31);
--
-- 2) Lihat hasil akhir topik Statistika dan Peluang — expect 3 row:
-- SELECT id, nama, slug, topik_id, is_published FROM subtopik WHERE topik_id = 7 ORDER BY id;
--
-- 3) Sanity check tidak ada duplikat slug dalam topik_id=7:
-- SELECT slug, COUNT(*) FROM subtopik WHERE topik_id = 7 GROUP BY slug HAVING COUNT(*) > 1;
-- =====================================================================
