-- Add payment tracking fields for iyzico integration
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    ADD COLUMN IF NOT EXISTS iyzico_token VARCHAR(200),
    ADD COLUMN IF NOT EXISTS iyzico_payment_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS iyzico_conversation_id VARCHAR(100);

-- Index for faster lookup by token/conversation (optional but helpful for callbacks)
CREATE INDEX IF NOT EXISTS idx_orders_iyzico_token ON orders(iyzico_token);
CREATE INDEX IF NOT EXISTS idx_orders_iyzico_conversation ON orders(iyzico_conversation_id);

