ALTER TABLE whiteboard_sessions
  ADD COLUMN background ENUM('plain','dots','grid') NOT NULL DEFAULT 'plain' AFTER content;
