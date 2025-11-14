DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refresh_tokens'
          AND column_name = 'parent_token'
    ) THEN
ALTER TABLE refresh_tokens DROP COLUMN parent_token;
END IF;
END $$;
