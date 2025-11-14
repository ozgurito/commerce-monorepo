ALTER TABLE products ADD CONSTRAINT uq_products_name UNIQUE (name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
