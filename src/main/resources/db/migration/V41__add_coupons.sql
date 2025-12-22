-- =============================================
-- COUPON (KUPON) TABLOSU
-- =============================================
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    
    -- Kupon bilgileri
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    
    -- İndirim tipi ve değeri
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
    discount_value DECIMAL(10, 2) NOT NULL,
    
    -- Kullanım koşulları
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2), -- Yüzdelik indirimlerde max limit
    
    -- Kullanım limitleri
    usage_limit INTEGER, -- Toplam kullanım limiti (null = sınırsız)
    usage_limit_per_user INTEGER DEFAULT 1, -- Kullanıcı başına limit
    used_count INTEGER DEFAULT 0,
    
    -- Geçerlilik
    starts_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Kısıtlamalar
    applicable_category_ids BIGINT[], -- Belirli kategorilere özel (null = tümü)
    applicable_product_ids BIGINT[], -- Belirli ürünlere özel (null = tümü)
    excluded_product_ids BIGINT[], -- Hariç tutulan ürünler
    first_order_only BOOLEAN DEFAULT false, -- Sadece ilk sipariş
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tenant
    tenant_id VARCHAR(50) DEFAULT 'default'
);

-- =============================================
-- COUPON USAGE (KUPON KULLANIMI) TABLOSU
-- =============================================
CREATE TABLE coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Uygulanan indirim
    discount_amount DECIMAL(10, 2) NOT NULL,
    
    -- Timestamps
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tenant
    tenant_id VARCHAR(50) DEFAULT 'default'
);

-- =============================================
-- ORDERS TABLOSUNA KUPON ALANLARI EKLE
-- =============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_id BIGINT REFERENCES coupons(id),
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- =============================================
-- INDEX'LER
-- =============================================
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_dates ON coupons(starts_at, expires_at);
CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);
CREATE INDEX idx_coupon_usages_order ON coupon_usages(order_id);

-- =============================================
-- ÖRNEK KUPONLAR
-- =============================================
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, expires_at) VALUES
('HOSGELDIN10', 'Yeni üyelere %10 indirim', 'PERCENTAGE', 10.00, 100.00, NULL, '2025-12-31 23:59:59'),
('YAZ2025', 'Yaz kampanyası ₺50 indirim', 'FIXED_AMOUNT', 50.00, 200.00, 1000, '2025-08-31 23:59:59'),
('KARGOBEDAVA', 'Ücretsiz kargo', 'FREE_SHIPPING', 0.00, 150.00, 500, '2025-06-30 23:59:59'),
('ILKSIPARIS20', 'İlk siparişe %20 indirim', 'PERCENTAGE', 20.00, 150.00, NULL, NULL);

-- İlk sipariş kuponunu işaretle
UPDATE coupons SET first_order_only = true WHERE code = 'ILKSIPARIS20';

