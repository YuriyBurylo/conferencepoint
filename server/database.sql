
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255),
    scientific_degree VARCHAR(128),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    textpdf BYTEA
);

CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    conference_id INTEGER REFERENCES new_conferences(conference_id),
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
    updated_at TIMESTAMP DEFAULT NOW()
);