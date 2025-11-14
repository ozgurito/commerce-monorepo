-- V26: align order_items foreign key columns to BIGINT

ALTER TABLE order_items
    ALTER COLUMN order_id TYPE BIGINT USING order_id::BIGINT,
    ALTER COLUMN product_id TYPE BIGINT USING product_id::BIGINT;

ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS fk_order_items_order,
    DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
    ADD CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS fk_order_items_product,
    DROP CONSTRAINT IF EXISTS order_items_product_id_fkey,
    ADD CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

