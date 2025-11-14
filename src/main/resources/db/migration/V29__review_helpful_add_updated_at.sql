-- V29: review_helpful tablosuna updated_at ekle

ALTER TABLE review_helpful 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: mevcut kayıtlar için created_at'i kopyala
UPDATE review_helpful 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Trigger ekle (V22'deki ortak fonksiyonu kullan)
CREATE TRIGGER update_review_helpful_updated_at
    BEFORE UPDATE ON review_helpful
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

