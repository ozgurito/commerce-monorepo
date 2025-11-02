-- V18: Custom Design System + Credit System
-- "Kendin Tasarla" özelliği

CREATE TABLE custom_designs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    design_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    base_product_id BIGINT REFERENCES products(id),
    design_data JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    preview_images TEXT[],
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    admin_notes TEXT,
    rejection_reason TEXT,
    production_started_at TIMESTAMP,
    production_completed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    tracking_number VARCHAR(100),
    credits_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE design_credits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_balance INT DEFAULT 0 CHECK (current_balance >= 0),
    total_earned INT DEFAULT 0,
    total_used INT DEFAULT 0,
    total_expired INT DEFAULT 0,
    membership_tier VARCHAR(50) DEFAULT 'free',
    tier_discount_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    design_id BIGINT REFERENCES custom_designs(id),
    order_id BIGINT REFERENCES orders(id),
    description TEXT,
    balance_after INT NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE design_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    template_data JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    preview_images TEXT[],
    compatible_products TEXT[],
    is_free BOOLEAN DEFAULT true,
    credit_cost INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    use_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_designs_user ON custom_designs(user_id);
CREATE INDEX idx_custom_designs_status ON custom_designs(status);
CREATE INDEX idx_design_credits_user ON design_credits(user_id);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_design_templates_active ON design_templates(is_active);

