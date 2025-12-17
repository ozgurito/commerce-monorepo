-- V33__add_product_variant_id_to_order_items.sql

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_variant_id BIGINT;

ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_product_variant 
FOREIGN KEY (product_variant_id) 
REFERENCES product_variants(id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id 
ON order_items(product_variant_id);

COMMENT ON COLUMN order_items.product_variant_id IS 'Siparişteki ürün varyant ID (stok geri koyma için)';

