-- Görsel ↔ Varyant ilişkisi: product_images tablosuna nullable variant_id FK ekle
-- Mevcut kayıtlar NULL kalır (breaking change yok, uygulama çalışmaya devam eder)
ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS variant_id BIGINT
    REFERENCES product_variants(id) ON DELETE SET NULL;

-- Performans için index
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON product_images(variant_id);
