const fs = require('fs');
const path = require('path');
const db = require('../db');

const migrationsDir = path.resolve(__dirname, '../migrations');

async function run() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT NOW()
        )
    `);

    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const applied = await db.query('SELECT name FROM schema_migrations WHERE name = $1', [file]);
        if (applied.rows.length > 0) continue;

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await db.query(sql);
        await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        console.log(`Applied migration: ${file}`);
    }

    await db.end();
}

run().catch(async (error) => {
    console.error('Migration failed:', error.message);
    await db.end();
    process.exit(1);
});
