const db = require('../db');
const { put, get } = require('@vercel/blob');
const crypto = require('node:crypto');

const fileColumns = [
    ['new_conferences', 'conference_id', 'leaflet', 'leaflet_blob', null],
    ['archive_conferences', 'conference_id', 'textpdf', 'textpdf_blob', null],
    ['articles', 'article_id', 'file_data', 'file_blob', 'file_name'],
    ['articles', 'article_id', 'payment_receipt', 'receipt_blob', 'receipt_name']
];

async function migrateFiles() {
    for (const [table, key, column, blobColumn, nameColumn] of fileColumns) {
        const ids = await db.query(`SELECT ${key} FROM ${table} WHERE ${column} IS NOT NULL AND ${blobColumn} IS NULL ORDER BY ${key}`);
        for (const row of ids.rows) {
            const result = await db.query(`SELECT ${column} AS data${nameColumn ? `, ${nameColumn} AS name` : ''} FROM ${table} WHERE ${key} = $1 AND ${blobColumn} IS NULL`, [row[key]]);
            if (!result.rows[0]) continue;
            const { data, name = `${column}.pdf` } = result.rows[0];
            const extension = name.match(/\.(pdf|docx?)$/i)?.[0]?.toLowerCase() || '.pdf';
            const pathname = `migrated/${table}/${row[key]}/${column}-${crypto.randomUUID()}${extension}`;
            const blob = await put(pathname, data, { access: 'private', addRandomSuffix: false });
            const check = await get(blob.pathname, { access: 'private' });
            if (!check || check.statusCode !== 200) throw new Error('Uploaded file verification failed');
            const hash = crypto.createHash('sha256');
            for await (const chunk of check.stream) hash.update(chunk);
            if (hash.digest('hex') !== crypto.createHash('sha256').update(data).digest('hex')) {
                throw new Error('Uploaded file checksum differs');
            }
            // Retain original bytes until the operator explicitly removes them after cutover.
            await db.query(`UPDATE ${table} SET ${blobColumn} = $1 WHERE ${key} = $2 AND ${blobColumn} IS NULL`, [blob.pathname, row[key]]);
            console.log(`Migrated ${table}.${column} #${row[key]}`);
        }
    }
}

if (require.main === module) {
    migrateFiles().catch(error => {
        console.error('File migration failed:', error.message);
        process.exitCode = 1;
    }).finally(() => db.end());
}

module.exports = { migrateFiles };
