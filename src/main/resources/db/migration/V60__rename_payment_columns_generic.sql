-- iyzico'ya özel kolon isimlerini genel (sağlayıcı bağımsız) isimlere çevirir.
-- Veri kaybı yok — sadece yeniden adlandırma (RENAME COLUMN), mevcut değerler korunur.
-- Amaç: ödeme sağlayıcısı değişse (iyzico -> PayTR) şema/domain modelinin tekrar
-- değişmesine gerek kalmaması.
ALTER TABLE orders RENAME COLUMN iyzico_token TO payment_token;
ALTER TABLE orders RENAME COLUMN iyzico_payment_id TO payment_id;
ALTER TABLE orders RENAME COLUMN iyzico_conversation_id TO payment_reference;

ALTER INDEX idx_orders_iyzico_token RENAME TO idx_orders_payment_token;
ALTER INDEX idx_orders_iyzico_conversation RENAME TO idx_orders_payment_reference;
