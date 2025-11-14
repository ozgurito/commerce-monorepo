-- V4_1: Align seed product rows to use explicit updated_at values

UPDATE products
SET updated_at = created_at
WHERE name IN ('Defter', 'Kalem', 'Kupa');

