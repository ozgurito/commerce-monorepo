-- V30: orders tablosuna address kolonları ve eksik alanlar ekle

-- Billing Address Columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS billing_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS billing_address_line TEXT,
ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_district VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100);

-- Shipping Address Columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_address_line TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100);

-- Other missing columns from Order entity
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Generate order_number for existing records if null
UPDATE orders 
SET order_number = 'ORD-' || LPAD(id::TEXT, 8, '0')
WHERE order_number IS NULL;

-- Add UNIQUE constraint and make NOT NULL after backfilling
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_order_number_key'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
    END IF;
    
    -- Make order_number NOT NULL after backfilling
    ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
END $$;

-- Backfill: Mevcut kayıtlar için total_amount'u total'e kopyala (eğer total_amount varsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        UPDATE orders 
        SET total = COALESCE(total_amount, 0)
        WHERE total IS NULL OR total = 0;
    END IF;
END $$;

-- Index for order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

