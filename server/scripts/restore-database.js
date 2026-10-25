const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');

async function restore() {
    const source = process.argv[2];
    const psql = process.env.PSQL_PATH || 'psql';
    if (!source) throw new Error('Usage: node --env-file=<private-env-file> server/scripts/restore-database.js <backup.sql>');
    const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
    if (!connectionString) throw new Error('A destination DATABASE_URL_UNPOOLED is required');
    const client = new Client({ connectionString });
    await client.connect();
    try {
        const result = await client.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        if (result.rows[0].count !== 0) throw new Error('Destination is not empty. Restore into a new database or branch.');
    } finally {
        await client.end();
    }
    const sql = fs.readFileSync(source, 'utf8')
        .replace(/^ALTER (?:TABLE|SEQUENCE|SCHEMA) .* OWNER TO .*;\r?\n/gm, '')
        .replace(/^SET transaction_timeout = .*;\r?\n/gm, '');
    const output = path.resolve(__dirname, '../../.vercel/database-restore.sql');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const certificateFile = path.join(path.dirname(output), 'postgres-ca.pem');
    fs.writeFileSync(certificateFile, require('node:tls').getCACertificates('default').join('\n'));
    fs.writeFileSync(output, sql + `
-- Preserve an existing administrator's password when importing older backups.
INSERT INTO public.schema_migrations (name)
SELECT '002_restore_admin_user.sql'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'burylojunior@gmail.com' AND role = 'admin')
ON CONFLICT (name) DO NOTHING;
`);
    const uri = new URL(connectionString);
    const child = spawnSync(psql, ['--no-psqlrc', '--set=ON_ERROR_STOP=1', '--single-transaction', '--file', output], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PGHOST: uri.hostname,
            PGPORT: uri.port || '5432',
            PGDATABASE: decodeURIComponent(uri.pathname.slice(1)),
            PGUSER: decodeURIComponent(uri.username),
            PGPASSWORD: decodeURIComponent(uri.password),
            PGSSLMODE: 'verify-full',
            PGSSLROOTCERT: certificateFile
        }
    });
    if (child.error) throw child.error;
    if (child.status !== 0) throw new Error('PostgreSQL restore failed');
    console.log('Database restored; original backup preserved. Run migrations next.');
}

restore().catch(error => {
    console.error('Restore failed:', error.message);
    process.exitCode = 1;
});
