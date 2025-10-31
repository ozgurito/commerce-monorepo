ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id varchar(64) NOT NULL DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id varchar(64) NOT NULL DEFAULT 'public';
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id, id);
