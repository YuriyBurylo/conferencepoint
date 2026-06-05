const assert = require('assert');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    queries: [],
    async query(sql, params) {
        this.queries.push({ sql, params });
        if (sql.includes('INSERT INTO articles')) {
            return {
                rows: [{
                    article_id: 1,
                    user_id: params[0],
                    conference_id: params[1],
                    new_conference_id: params[1],
                    archive_conference_id: null,
                    title: params[2],
                    file_name: params[8],
                    status: 'pending'
                }]
            };
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
                            title: 'Conference',
                            venue: 'Boston',
                            country: 'USA',
                            timing: '2026-05-29'
                        }]
                    };
                }
                if (sql.includes('INSERT INTO archive_conferences')) {
                    return { rows: [{ conference_id: 44 }] };
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
const articlesController = require('./controllers/articlesController');
const newConferencesController = require('./controllers/newConferencesController');

function createRes() {
    return {
        statusCode: undefined,
        data: undefined,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.data = data; return this; }
    };
}

async function testSubmittedArticleStoresNewConferenceReference() {
    fakeDb.queries = [];
    const req = {
        user: { user_id: 3 },
        body: {
            conference_id: '12',
            title: 'Paper',
            keywords: 'science, test'
        },
        files: {
            article: {
                name: 'paper.docx',
                size: 16,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                data: Buffer.from('PK\u0003\u0004document')
            },
            receipt: {
                name: 'receipt.pdf',
                size: 16,
                mimetype: 'application/pdf',
                data: Buffer.from('%PDF-1.7')
            }
        }
    };
    const res = createRes();

    await articlesController.submitArticle(req, res);

    const insert = fakeDb.queries.find(query => query.sql.includes('INSERT INTO articles'));
    assert.match(insert.sql, /new_conference_id/);
    assert.match(insert.sql, /archive_conference_id/);
    assert.strictEqual(insert.params[1], 12);
}

async function testArchiveMoveTransfersArticleReferenceWithoutAmbiguousId() {
    const req = { params: { id: 12 } };
    const res = createRes();

    await newConferencesController.moveToArchive(req, res);

    const update = fakeDb.client.queries.find(query => query.sql.includes('UPDATE articles'));
    assert.match(update.sql, /new_conference_id = NULL/);
    assert.match(update.sql, /archive_conference_id = \$1/);
    assert.match(update.sql, /conference_id = NULL/);
    assert.deepStrictEqual(update.params, [44, 12]);
}

(async () => {
    await testSubmittedArticleStoresNewConferenceReference();
    await testArchiveMoveTransfersArticleReferenceWithoutAmbiguousId();
    console.log('article conference schema tests passed');
})();
