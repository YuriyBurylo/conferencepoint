const assert = require('assert');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    queries: [],
    async query(sql, params) {
        this.queries.push({ sql, params });
        if (sql.includes('UPDATE new_conferences')) {
            return { rows: [{ conference_id: params[5] || params[6] }] };
        }
        return { rows: [] };
    }
};

require.cache[dbPath] = { exports: fakeDb };

const newController = require('./controllers/newConferencesController');

async function testNewConferenceUpdateCanReplaceLeaflet() {
    const req = {
        body: {
            conference_id: 7,
            conference_status: 'International conference',
            title: 'Edited conference',
            venue: 'Kyiv',
            country: 'Ukraine',
            timing: '2026-08-12'
        },
        files: {
            leaflet: { name: 'leaflet.pdf', size: 12, mimetype: 'application/pdf', data: Buffer.from('%PDF-1.7') }
        }
    };
    const res = {
        json(data) { this.data = data; },
        status(code) { this.statusCode = code; return this; }
    };

    const updateConference = newController.updateConference;
    await updateConference(req, res);

    assert.strictEqual(res.statusCode, undefined);
    const update = fakeDb.queries.find(query => query.sql.includes('UPDATE new_conferences'));
    assert.match(update.sql, /leaflet =/);
    assert.strictEqual(update.params[5], req.files.leaflet.data);
}

(async () => {
    await testNewConferenceUpdateCanReplaceLeaflet();
    console.log('new conference update tests passed');
})();
