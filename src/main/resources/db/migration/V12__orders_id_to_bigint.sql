-- This migration must work whether `orders.id` was created as SERIAL/BIGSERIAL (default nextval)
-- or as an IDENTITY column (Hibernate can create identity columns).
DO $$
DECLARE
  seq_name TEXT;
  is_ident BOOLEAN;
  data_t TEXT;
BEGIN
  -- Detect identity column
  SELECT (is_identity = 'YES')::boolean, data_type
  INTO is_ident, data_t
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'id';

  -- If identity, drop identity property first (otherwise DROP DEFAULT errors)
  IF COALESCE(is_ident, FALSE) THEN
    EXECUTE 'ALTER TABLE orders ALTER COLUMN id DROP IDENTITY';
  END IF;

  -- Drop default if any (serial/bigserial)
  BEGIN
    EXECUTE 'ALTER TABLE orders ALTER COLUMN id DROP DEFAULT';
  EXCEPTION
    WHEN others THEN
      -- ignore (no default / already handled)
      NULL;
  END;

  -- Convert to BIGINT only if needed
  IF COALESCE(data_t, '') <> 'bigint' THEN
    EXECUTE 'ALTER TABLE orders ALTER COLUMN id TYPE BIGINT USING id::bigint';
  END IF;

  -- Ensure there's a sequence and re-attach default
  SELECT pg_get_serial_sequence('orders', 'id') INTO seq_name;
  IF seq_name IS NULL THEN
    seq_name := 'public.orders_id_seq';
    EXECUTE 'CREATE SEQUENCE IF NOT EXISTS ' || seq_name;
  END IF;

  EXECUTE 'ALTER SEQUENCE ' || seq_name || ' OWNED BY orders.id';
  EXECUTE 'ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval(''' || seq_name || ''')';

  -- Keep sequence in sync with existing max(id)
  PERFORM setval(seq_name, GREATEST((SELECT COALESCE(MAX(id), 0) FROM orders) + 1, 1), false);
END $$;
