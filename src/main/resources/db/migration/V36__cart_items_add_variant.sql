-- V36: Add product_variant_id to cart_items table
-- Sepete eklenen ürünlerin variant bilgisini tutmak için

-- Variant ID kolonu ekle
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS product_variant_id BIGINT;

-- Foreign key ekle
ALTER TABLE cart_items 
ADD CONSTRAINT fk_cart_items_variant 
FOREIGN KEY (product_variant_id) 
REFERENCES product_variants(id) 
ON DELETE SET NULL;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_cart_item_variant_id ON cart_items(product_variant_id);

-- Unique constraint güncelle (aynı ürün + aynı variant sepette bir kez olabilir)
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_cart_product_variant_unique 
UNIQUE(cart_id, product_id, product_variant_id);

