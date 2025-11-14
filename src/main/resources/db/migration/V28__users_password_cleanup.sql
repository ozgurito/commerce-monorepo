-- V28: normalize users password column and migrate legacy data

ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET password = crypt(password_hash, gen_salt('bf'))
WHERE password IS NULL
  AND password_hash IS NOT NULL;

ALTER TABLE users
    DROP COLUMN IF EXISTS password_hash;

ALTER TABLE users
    ALTER COLUMN password SET NOT NULL;

