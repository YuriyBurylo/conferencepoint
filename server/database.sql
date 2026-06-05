
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255),
    scientific_degree VARCHAR(128),
    academic_title VARCHAR(128),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
    reset_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE new_conferences (
    conference_id SERIAL PRIMARY KEY,
    conference_status VARCHAR(128),
    title TEXT,
    venue VARCHAR(128),
    country VARCHAR(128),
    timing DATE,
    leaflet BYTEA
);

CREATE TABLE archive_conferences (
    conference_id SERIAL PRIMARY KEY,
    conference_status VARCHAR(128),
    title TEXT,
    venue VARCHAR(128),
    country VARCHAR(128),
    timing DATE,
    participants TEXT[],
    textpdf BYTEA,
    is_published BOOLEAN DEFAULT true
);

CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    conference_id INTEGER REFERENCES new_conferences(conference_id) ON DELETE SET NULL,
    new_conference_id INTEGER REFERENCES new_conferences(conference_id) ON DELETE SET NULL,
    archive_conference_id INTEGER REFERENCES archive_conferences(conference_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    section VARCHAR(255),
    udk_index VARCHAR(128),
    abstract TEXT,
    keywords TEXT[],
    file_data BYTEA NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    admin_comment TEXT,
    payment_receipt BYTEA,
    receipt_name VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (new_conference_id IS NULL OR archive_conference_id IS NULL),
    CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'revision_needed'))
);

CREATE TABLE admin_audit_log (
    audit_id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_new_conference_id ON articles(new_conference_id);
CREATE INDEX idx_articles_archive_conference_id ON articles(archive_conference_id);
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
