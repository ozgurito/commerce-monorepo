-- V16: Products güncelleme + Images + Variants

-- Mevcut products tablosuna yeni kolonlar ekle
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE,
    ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
    ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS compare_price DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5,
    ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS width DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS height DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS length DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS allow_reviews BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS meta_title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS meta_description VARCHAR(500);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Ürün görselleri
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ürün varyantları (beden, renk)
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variant_type VARCHAR(50) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    color_hex VARCHAR(7),
    sku VARCHAR(100) UNIQUE,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Mevcut ürünlere slug ve sku ekle
UPDATE products SET 
    slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
    sku = 'PROD-' || id,
    is_active = true,
    is_featured = false,
    allow_reviews = true
WHERE slug IS NULL;

