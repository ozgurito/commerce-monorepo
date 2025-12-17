-- V15: Category System
-- Ürün kategorileri

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Örnek kategoriler
INSERT INTO categories (name, slug, description, display_order, created_at, updated_at) VALUES
('T-Shirt', 'tshirt', 'Classic t-shirts', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hoodie', 'hoodie', 'Comfortable hoodies', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sweatshirt', 'sweatshirt', 'Cozy sweatshirts', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tank Top', 'tank-top', 'Summer tank tops', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

