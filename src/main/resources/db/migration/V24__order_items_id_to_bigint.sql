-- V24: convert order_items.id to BIGINT

ALTER SEQUENCE IF EXISTS order_items_id_seq AS BIGINT;

ALTER TABLE order_items
    ALTER COLUMN id TYPE BIGINT;

REINDEX TABLE order_items;

