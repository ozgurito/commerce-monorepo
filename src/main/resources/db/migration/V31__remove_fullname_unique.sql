ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_key;

CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

