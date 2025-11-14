-- V23: Add updated_at support for credit_transactions

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE credit_transactions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE credit_transactions
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP);

DROP TRIGGER IF EXISTS update_credit_transactions_updated_at ON credit_transactions;

CREATE TRIGGER update_credit_transactions_updated_at
    BEFORE UPDATE ON credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

