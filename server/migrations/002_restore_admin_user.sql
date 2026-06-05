BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS academic_title VARCHAR(128);

INSERT INTO users (
    email,
    password_hash,
    full_name,
    affiliation,
    scientific_degree,
    academic_title,
    role
) VALUES (
    'burylojunior@gmail.com',
    '$2b$10$fMKIHmZiSN998/5ul5.27.Kv9RXNTnSZMu7iWJmZH65yuWAmmVdiq',
    'Бурило Юрій Павлович',
    'НДІ приватного права та підприємництва імені Ф.Г. Бурчака НАПрН України',
    'д.ю.н.',
    'професор',
    'admin'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    affiliation = EXCLUDED.affiliation,
    scientific_degree = EXCLUDED.scientific_degree,
    academic_title = EXCLUDED.academic_title,
    role = 'admin',
    updated_at = NOW();

COMMIT;
