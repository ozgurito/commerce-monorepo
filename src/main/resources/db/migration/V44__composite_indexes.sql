-- V44: Performans için composite indexler

-- Ürünler: kategori + aktif + oluşturulma tarihi (liste sorguları)
CREATE INDEX IF NOT EXISTS idx_products_category_active_created
    ON products (category_id, is_active, created_at DESC);

-- Ürünler: öne çıkan + aktif (featured liste)
CREATE INDEX IF NOT EXISTS idx_products_featured_active
    ON products (is_featured, is_active);

-- Ürün varyantları: ürün + aktif (stok sorguları)
CREATE INDEX IF NOT EXISTS idx_variants_product_active
    ON product_variants (product_id, is_active);

-- Siparişler: kullanıcı + durum + tarih (sipariş geçmişi)
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created
    ON orders (user_id, status, created_at DESC);

-- Sipariş kalemleri: sipariş başına arama
CREATE INDEX IF NOT EXISTS idx_order_items_order
    ON order_items (order_id);

-- Yorumlar: ürün + onay durumu + tarih
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved_created
    ON reviews (product_id, created_at DESC);

-- Sepet: kullanıcı + ürün (tekrar ekleme kontrolü)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_variant
    ON cart_items (cart_id, product_variant_id);

-- Wishlist: kullanıcı + ürün (tekrar ekleme kontrolü)
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product
    ON wishlist_items (user_id, product_id);

-- Kupon: kod + aktif (kupon doğrulama)
CREATE INDEX IF NOT EXISTS idx_coupons_code_active
    ON coupons (code, is_active);
