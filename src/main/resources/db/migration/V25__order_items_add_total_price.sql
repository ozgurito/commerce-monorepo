-- V25: Ensure order_items has unit_price and total_price columns

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'order_items'
          AND column_name = 'price'
    ) THEN
        EXECUTE 'ALTER TABLE order_items RENAME COLUMN price TO unit_price';
    END IF;
END $$;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2);

UPDATE order_items
SET total_price = COALESCE(unit_price, 0) * quantity
WHERE total_price IS NULL;

ALTER TABLE order_items
    ALTER COLUMN total_price SET NOT NULL;

