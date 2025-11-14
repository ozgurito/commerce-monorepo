-- V27: product_images add updated_at column and trigger

ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE product_images
SET updated_at = COALESCE(updated_at, created_at);

DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;

CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

