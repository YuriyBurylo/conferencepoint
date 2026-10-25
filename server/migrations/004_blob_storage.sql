ALTER TABLE new_conferences ADD COLUMN IF NOT EXISTS leaflet_blob TEXT;
ALTER TABLE archive_conferences ADD COLUMN IF NOT EXISTS textpdf_blob TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS file_blob TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS receipt_blob TEXT;
ALTER TABLE articles ALTER COLUMN file_data DROP NOT NULL;

-- Keep legacy BYTEA files readable until the explicit Blob migration completes.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_file_present') THEN
        ALTER TABLE articles ADD CONSTRAINT articles_file_present CHECK (file_data IS NOT NULL OR file_blob IS NOT NULL);
    END IF;
END $$;
