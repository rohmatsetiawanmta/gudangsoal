-- feature_roadmap.status: tambah 'discovery' dan 'hold' (dipakai AdminRoadmap.jsx & admin.php).
-- Disamakan dengan DB live (dicek via phpMyAdmin, 27 Sep 2026).
-- Jalankan SETELAH migration_roadmap.sql. Aman diulang.

ALTER TABLE `feature_roadmap`
  MODIFY COLUMN `status` ENUM('discovery','idea','planned','in_progress','done','cancelled','hold') NOT NULL DEFAULT 'idea';
