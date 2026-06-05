const assert = require('assert');
const path = require('path');
const { Writable } = require('stream');

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    async query(sql, params) {
        assert.match(sql, /LIMIT \$1/);
        assert.deepStrictEqual(params, [500]);
        return {
            rows: [
                {
                    article_id: 7,
                    file_name: 'paper.docx',
                    file_data: Buffer.from('PK\u0003\u0004article')
                }
            ]
        };
    }
};

require.cache[dbPath] = { exports: fakeDb };
const articlesController = require('./controllers/articlesController');

function createRes() {
    const chunks = [];
    const res = new Writable({
        write(chunk, encoding, callback) {
            chunks.push(Buffer.from(chunk));
            this.headersSent = true;
            callback();
        }
    });

    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (name, value) => {
        res.headers[name.toLowerCase()] = value;
    };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (body) => {
        res.jsonBody = body;
        res.end(JSON.stringify(body));
        return res;
    };
    res.body = () => Buffer.concat(chunks);

    return res;
}

async function testDownloadAllCreatesZip() {
    const req = { query: {} };
    const res = createRes();
    const finished = new Promise(resolve => res.on('finish', resolve));

    await articlesController.downloadAllArticles(req, res);
    await finished;

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], 'application/zip');
    assert.match(res.headers['content-disposition'], /articles\.zip/);
    assert.strictEqual(res.body().slice(0, 4).toString('binary'), 'PK\u0003\u0004');
    assert.strictEqual(res.jsonBody, undefined);
}

(async () => {
    await testDownloadAllCreatesZip();
    console.log('download all article tests passed');
})();
