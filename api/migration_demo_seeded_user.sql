-- api/migration_demo_seeded_user.sql
-- Flag untuk menandai akun yang statistiknya (xp/streak/sessions/xp_history)
-- di-seed manual oleh admin untuk kebutuhan screenshot demo, BUKAN aktivitas organik.
-- NOT NULL DEFAULT 0 (bukan nullable) karena dipakai di WHERE is_demo_seeded = 0 di
-- banyak query agregat — kalau nullable dan ada NULL, NULL = 0 di MySQL bernilai NULL
-- (bukan TRUE), row itu malah ikut ter-exclude dari agregat yang harusnya dihitung.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_demo_seeded TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demo_seeded_at TIMESTAMP NULL DEFAULT NULL;
