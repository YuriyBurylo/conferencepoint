require('dotenv').config();
const Pool = require('pg').Pool;

const pool = new Pool(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000
} : {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'conferencepoint'
});

if (process.env.VERCEL === '1') {
    require('@vercel/functions').attachDatabasePool(pool);
}

module.exports = pool;
