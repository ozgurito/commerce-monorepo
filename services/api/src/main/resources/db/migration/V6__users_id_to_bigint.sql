-- users.id -> BIGINT ve referansların uyarlanması

CREATE TEMP TABLE _user_fk AS
SELECT
  c.conname,
  c.conrelid::regclass AS child_table,
  a.attname            AS child_column
FROM pg_constraint c
JOIN pg_attribute a
  ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
JOIN pg_class pkcl ON pkcl.oid = c.confrelid
JOIN pg_attribute pka
  ON pka.attrelid = c.confrelid AND pka.attnum = ANY (c.confkey)
WHERE c.contype = 'f'
  AND pkcl.relname = 'users'
  AND pka.attname = 'id';

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _user_fk LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I;', r.child_table, r.conname);
    EXECUTE format(
      'ALTER TABLE %s ALTER COLUMN %I TYPE BIGINT USING %I::BIGINT;',
      r.child_table, r.child_column, r.child_column
    );
  END LOOP;
END $$;

ALTER TABLE users
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _user_fk LOOP
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES users(id);',
      r.child_table, r.conname, r.child_column
    );
  END LOOP;
END $$;

DROP TABLE _user_fk;
