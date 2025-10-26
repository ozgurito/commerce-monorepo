-- users tablosuna password kolonu ekle
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password VARCHAR(255);
