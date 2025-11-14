-- V2: fix products.id to bigint
ALTER TABLE products
  ALTER COLUMN id TYPE BIGINT USING id::bigint;
