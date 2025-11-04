CREATE TABLE IF NOT EXISTS orders(
  id bigserial primary key,
  tenant_id varchar(64) not null,
  status varchar(32) not null,
  total numeric(12,2) not null default 0,
  created_at timestamp,
  updated_at timestamp
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id,id);
