-- V43: ProductVariant için optimistic locking (version kolonu)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;
