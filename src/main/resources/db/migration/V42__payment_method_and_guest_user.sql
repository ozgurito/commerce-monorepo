-- V42: Yeni ödeme yöntemi ve misafir/kimlik alanları
-- Tarih: 2026-04-27

-- orders tablosuna ödeme yöntemi kolonu
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'CREDIT_CARD';

-- users tablosuna T.C. kimlik no, misafir flag ve guest email
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS identity_number VARCHAR(11),
    ADD COLUMN IF NOT EXISTS is_guest       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guest_email    VARCHAR(255);

-- Misafir kullanıcılar için email unique constraint'i esnet
-- (guest_email farklı sütunda tutulduğu için email NULL olabilmeli)
ALTER TABLE users
    ALTER COLUMN email DROP NOT NULL;

-- Misafirlerde email NULL iken unique'lik devam etsin (sadece non-null'lar)
-- PostgreSQL partial index trick
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_non_null
    ON users (email)
    WHERE email IS NOT NULL;
