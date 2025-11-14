-- V13_1: Ensure order_items has timestamp columns and proper trigger

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE order_items
SET updated_at = created_at
WHERE updated_at IS NULL OR updated_at <> created_at;

DROP TRIGGER IF EXISTS trg_set_order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;

DROP FUNCTION IF EXISTS set_order_items_updated_at();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

