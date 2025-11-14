-- V8__add_updated_at_to_users.sql
-- Bu dosyayı src/main/resources/db/migration/ klasörüne koy

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Mevcut kayıtlar için created_at ile aynı değeri ver
UPDATE users
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Trigger: Her update'te otomatik güncelleme (opsiyonel - JPA @PreUpdate de yapıyor)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı users tablosuna bağla
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();