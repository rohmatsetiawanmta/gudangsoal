-- Add is_coming_soon state to all level tables
ALTER TABLE jenjang    ADD COLUMN IF NOT EXISTS is_coming_soon TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;
ALTER TABLE subjenjang ADD COLUMN IF NOT EXISTS is_coming_soon TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;
ALTER TABLE mapel      ADD COLUMN IF NOT EXISTS is_coming_soon TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;
ALTER TABLE topik      ADD COLUMN IF NOT EXISTS is_coming_soon TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;
ALTER TABLE subtopik   ADD COLUMN IF NOT EXISTS is_coming_soon TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;
