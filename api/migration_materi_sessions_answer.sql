-- Tambah kolom user_answer ke materi_sessions
ALTER TABLE materi_sessions ADD COLUMN user_answer TEXT NULL AFTER is_correct;
