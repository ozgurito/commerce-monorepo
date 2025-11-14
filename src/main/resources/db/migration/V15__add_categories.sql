-- V15: Category System
-- Ürün kategorileri

CREATE TABLE categories (
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

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Örnek kategoriler
INSERT INTO categories (name, slug, description, display_order) VALUES
('T-Shirt', 'tshirt', 'Classic t-shirts', 1),
('Hoodie', 'hoodie', 'Comfortable hoodies', 2),
('Sweatshirt', 'sweatshirt', 'Cozy sweatshirts', 3),
('Tank Top', 'tank-top', 'Summer tank tops', 4);

