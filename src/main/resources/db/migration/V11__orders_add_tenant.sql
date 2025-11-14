ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tenant_id varchar(64) NOT NULL DEFAULT 'public';

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id, id);
