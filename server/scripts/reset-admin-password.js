require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { validateEmail, validatePassword } = require('../utils/security');

const DEFAULT_ADMIN_EMAIL = 'burylojunior@gmail.com';

const getArgValue = (name) => {
    const index = process.argv.indexOf(name);
    if (index === -1) return undefined;
    return process.argv[index + 1];
};

async function run() {
    const email = validateEmail(
        getArgValue('--email') ||
        process.env.ADMIN_EMAIL ||
        DEFAULT_ADMIN_EMAIL
    );
    const password = process.env.ADMIN_PASSWORD || getArgValue('--password');

    if (!password) {
        throw new Error('Set ADMIN_PASSWORD or pass --password to reset the admin password.');
    }

    validatePassword(password);

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'admin')
         ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = 'admin',
             updated_at = NOW()
         RETURNING user_id, email, role`,
        [email, passwordHash, 'ConferencePoint Admin']
    );

    const admin = result.rows[0];
    console.log(`Admin password reset for ${admin.email} (user_id=${admin.user_id}, role=${admin.role})`);
}

run()
    .catch((error) => {
        console.error('Admin password reset failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => db.end());
