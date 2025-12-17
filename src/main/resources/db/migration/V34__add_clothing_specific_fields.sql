-- V34__add_clothing_specific_fields.sql

ALTER TABLE products ADD COLUMN IF NOT EXISTS fit_type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_composition VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_info VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS season VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS age_group VARCHAR(50);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_products_fit_type ON products(fit_type);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_season ON products(season);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);

-- Açıklamalar
COMMENT ON COLUMN products.fit_type IS 'Kalıp: SLIM_FIT, REGULAR_FIT, OVERSIZE';
COMMENT ON COLUMN products.fabric_composition IS 'Kumaş: 80% Pamuk, 20% Polyester';
COMMENT ON COLUMN products.care_instructions IS 'Bakım talimatları';
COMMENT ON COLUMN products.model_info IS 'Model: Boy 1.85m, Kilo 75kg, Beden L';
COMMENT ON COLUMN products.size_guide IS 'Beden rehberi JSON';
COMMENT ON COLUMN products.material IS 'Malzeme: COTTON, POLYESTER, WOOL';
COMMENT ON COLUMN products.season IS 'Sezon: SUMMER, WINTER, ALL_SEASON';
COMMENT ON COLUMN products.origin_country IS 'Üretim ülkesi';
COMMENT ON COLUMN products.gender IS 'Cinsiyet: MALE, FEMALE, UNISEX';
COMMENT ON COLUMN products.age_group IS 'Yaş: ADULT, TEEN, KIDS';

