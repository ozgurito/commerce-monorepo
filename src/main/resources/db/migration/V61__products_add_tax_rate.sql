-- Ürün bazlı KDV oranı. Varsayılan 20.00, InvoiceService'teki mevcut sabit
-- KDV_RATE (%20) ile aynı — mevcut faturalama davranışını bozmaz.
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00;
