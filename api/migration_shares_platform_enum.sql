-- Add telegram, facebook, email to platform ENUM on soal_shares and materi_shares

ALTER TABLE soal_shares
  MODIFY COLUMN platform ENUM('whatsapp','telegram','facebook','twitter','threads','email','copy') NOT NULL;

ALTER TABLE materi_shares
  MODIFY COLUMN platform ENUM('whatsapp','telegram','facebook','twitter','threads','email','copy') NOT NULL;
