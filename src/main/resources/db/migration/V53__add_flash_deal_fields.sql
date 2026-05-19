-- V48: Flash Deal Fields
-- Supabase'de önceden manuel olarak çalıştırıldı, IF NOT EXISTS ile güvenli

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_flash_deal BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_deal_ends_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_products_flash_deal ON products(is_flash_deal);
