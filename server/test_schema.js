const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:root@localhost:5432/conferencepoint' });
client.connect().then(async () => {
    try {
        await client.query('BEGIN');
        const newConfResult = await client.query('SELECT * FROM new_conferences LIMIT 1');
        const conf = newConfResult.rows[0];
        console.log('Selected conf:', conf.conference_id);
        if (conf) {
            const insertResult = await client.query(
                'INSERT INTO archive_conferences (conference_status, title, venue, country, timing, participants, textpdf) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING conference_id',
                [conf.conference_status, conf.title, conf.venue, conf.country, conf.timing, null, conf.leaflet]
            );
            const newArchiveId = insertResult.rows[0].conference_id;
            console.log('Inserted new archive id:', newArchiveId);

            await client.query('UPDATE articles SET conference_id = $1 WHERE conference_id = $2', [newArchiveId, conf.conference_id]);
            console.log('Updated articles');

            await client.query('DELETE FROM new_conferences WHERE conference_id = $1', [conf.conference_id]);
            console.log('Deleted from new_conferences');
            await client.query('ROLLBACK');
            console.log('Rollback success');
        }
    } catch (e) {
        console.error('ERROR:', e.message);
        await client.query('ROLLBACK');
    } finally {
        client.end();
    }
});
