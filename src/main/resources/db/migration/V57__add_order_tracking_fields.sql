ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number  VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50)  NULL;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
