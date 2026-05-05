-- V45: Kullanıcı güvenlik alanları
-- is_active, email_verified, last_login_at, failed_login_attempts, locked_until

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS email_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_login_at       TIMESTAMP,
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT       NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until        TIMESTAMP;

-- Mevcut kullanıcılar aktif ve doğrulanmış kabul edilir
UPDATE users SET is_active = TRUE, email_verified = TRUE WHERE is_active IS NULL OR email_verified IS NULL;
