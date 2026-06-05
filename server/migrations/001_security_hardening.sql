BEGIN;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS new_conference_id INTEGER,
    ADD COLUMN IF NOT EXISTS archive_conference_id INTEGER;

UPDATE articles
SET new_conference_id = a.conference_id
FROM articles a
WHERE articles.article_id = a.article_id
  AND articles.new_conference_id IS NULL
  AND articles.archive_conference_id IS NULL
  AND EXISTS (
      SELECT 1 FROM new_conferences c WHERE c.conference_id = a.conference_id
  );

UPDATE articles
SET archive_conference_id = a.conference_id
FROM articles a
WHERE articles.article_id = a.article_id
  AND articles.new_conference_id IS NULL
  AND articles.archive_conference_id IS NULL
  AND EXISTS (
      SELECT 1 FROM archive_conferences ac WHERE ac.conference_id = a.conference_id
  );

UPDATE articles
SET conference_id = new_conference_id;

ALTER TABLE articles
    DROP CONSTRAINT IF EXISTS articles_conference_id_fkey,
    DROP CONSTRAINT IF EXISTS articles_new_conference_id_fkey,
    DROP CONSTRAINT IF EXISTS articles_archive_conference_id_fkey,
    DROP CONSTRAINT IF EXISTS articles_one_conference_reference,
    DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE articles
    ADD CONSTRAINT articles_conference_id_fkey
        FOREIGN KEY (conference_id) REFERENCES new_conferences(conference_id) ON DELETE SET NULL,
    ADD CONSTRAINT articles_new_conference_id_fkey
        FOREIGN KEY (new_conference_id) REFERENCES new_conferences(conference_id) ON DELETE SET NULL,
    ADD CONSTRAINT articles_archive_conference_id_fkey
        FOREIGN KEY (archive_conference_id) REFERENCES archive_conferences(conference_id) ON DELETE SET NULL,
    ADD CONSTRAINT articles_one_conference_reference
        CHECK (new_conference_id IS NULL OR archive_conference_id IS NULL),
    ADD CONSTRAINT articles_status_check
        CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'revision_needed'));

CREATE TABLE IF NOT EXISTS admin_audit_log (
    audit_id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_new_conference_id ON articles(new_conference_id);
CREATE INDEX IF NOT EXISTS idx_articles_archive_conference_id ON articles(archive_conference_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);

COMMIT;
