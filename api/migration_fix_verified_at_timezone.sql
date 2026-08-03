-- Fix verified_at timezone mismatch
-- Existing DATETIME values were stored as UTC (migration ran without SET time_zone).
-- Set session to UTC so MySQL interprets those stored UTC values correctly
-- when converting DATETIME -> TIMESTAMP (which stores UTC internally).
SET SESSION time_zone = '+00:00';
ALTER TABLE users MODIFY COLUMN verified_at TIMESTAMP NULL;
-- Session resets automatically after connection closes.
