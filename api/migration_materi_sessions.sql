-- migration_materi_sessions.sql
-- Track jawaban user untuk mini quiz di materi
CREATE TABLE IF NOT EXISTS materi_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  materi_id     INT NOT NULL,
  question_index INT NOT NULL,
  is_correct    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_materi_question (user_id, materi_id, question_index)
);
