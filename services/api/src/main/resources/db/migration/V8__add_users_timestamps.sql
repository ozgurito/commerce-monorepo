-- users.updated_at eksikse ekle
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- created_at alanın da entity’de varsa onu da garantiye al
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
