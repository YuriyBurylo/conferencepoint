const assert = require('assert');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    queries: [],
    async query(sql, params) {
        this.queries.push({ sql, params });
        if (sql.includes('SELECT is_published FROM archive_conferences')) {
            return { rows: [{ is_published: false }] };
        }
        if (sql.includes('UPDATE archive_conferences')) {
            return { rows: [{ conference_id: params[0], is_published: false }] };
        }
        return { rows: [] };
    },
    async connect() {
        const client = {
            queries: [],
            async query(sql, params) {
                this.queries.push({ sql, params });
                if (sql.includes('SELECT * FROM new_conferences')) {
                    return {
                        rows: [{
                            conference_id: 12,
                            conference_status: 'International conference',
                            title: 'Draft conference',
                            venue: 'Kyiv',
                            country: 'Ukraine',
                            timing: '2026-07-04',
                            leaflet: Buffer.from('leaflet')
                        }]
                    };
                }
                if (sql.includes('INSERT INTO archive_conferences')) {
                    return { rows: [{ conference_id: 44 }] };
                }
                if (sql.includes('SELECT is_published FROM archive_conferences')) {
                    return { rows: [{ is_published: false }] };
                }
                return { rows: [] };
            },
            release() {}
        };
        fakeDb.client = client;
        return client;
    }
};

require.cache[dbPath] = { exports: fakeDb };

const archiveController = require('./controllers/archiveConferencesController');
const newController = require('./controllers/newConferencesController');

async function testPublicArchiveOnlyReturnsPublishedConferences() {
    const res = {
        json(data) { this.data = data; },
        status(code) { this.statusCode = code; return this; }
    };

    await archiveController.getConferences({}, res);

    assert.match(fakeDb.queries[0].sql, /is_published = true/);
}

async function testMoveToArchiveCreatesUnpublishedDraftWithoutMaterials() {
    const req = { params: { id: 12 } };
    const res = {
        json(data) { this.data = data; },
        status(code) { this.statusCode = code; return this; }
    };

    await newController.moveToArchive(req, res);

    const insert = fakeDb.client.queries.find(query => query.sql.includes('INSERT INTO archive_conferences'));
    assert.match(insert.sql, /is_published/);
    assert.strictEqual(insert.params[6], null);
    assert.strictEqual(insert.params[7], false);
}

async function testAdminArchiveShowsDraftsFirst() {
    fakeDb.queries = [];
    const res = {
        json(data) { this.data = data; },
        status(code) { this.statusCode = code; return this; }
    };

    await archiveController.getAdminConferences({}, res);

    assert.match(fakeDb.queries[0].sql, /ORDER BY is_published ASC, conference_id DESC, timing DESC/);
}

async function testUnpublishedDraftCanSaveWithoutPublishing() {
    const req = {
        body: {
            conference_id: 44,
            conference_status: 'International conference',
            title: 'Edited draft',
            venue: 'Kyiv',
            country: 'Ukraine',
            timing: '2026-07-04'
        }
    };
    const res = {
        json(data) { this.data = data; },
        status(code) { this.statusCode = code; return this; }
    };

    const updateConference = archiveController.updateConference;
    await updateConference(req, res);

    assert.strictEqual(res.statusCode, undefined);
    const update = fakeDb.queries.find(query => query.sql.includes('UPDATE archive_conferences'));
    assert.doesNotMatch(update.sql, /is_published = true/);
}

(async () => {
    await testPublicArchiveOnlyReturnsPublishedConferences();
    await testMoveToArchiveCreatesUnpublishedDraftWithoutMaterials();
    await testAdminArchiveShowsDraftsFirst();
    await testUnpublishedDraftCanSaveWithoutPublishing();
    console.log('archive visibility tests passed');
})();
