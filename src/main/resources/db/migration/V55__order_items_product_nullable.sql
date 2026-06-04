-- order_items.product_id nullable yapılır
-- Ürün silinince sipariş geçmişi korunur, sadece ürün referansı null olur
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
