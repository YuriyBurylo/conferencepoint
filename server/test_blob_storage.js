const assert = require('node:assert/strict');
const path = require('node:path');
const { Writable } = require('node:stream');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'vercel-storage-test-secret-with-at-least-32-characters';
const data = Buffer.from('%PDF-1.7 test file');
let blobReads = 0;
let selectedUser = 7;
let queries = [];
require.cache[path.resolve(__dirname, 'db.js')] = { exports: {
    query: async (sql, params) => {
        queries.push({ sql, params });
        if (sql.includes('FROM users')) return { rows: [{ user_id: 7, email: 'test@example.com', role: 'user' }] };
        if (sql.includes('SELECT file_data')) return { rows: [{ user_id: selectedUser, file_name: 'paper.pdf', file_blob: 'stored/paper.pdf' }] };
        return { rows: [{ article_id: 1 }] };
    }
} };
require.cache[require.resolve('@vercel/blob')] = { exports: {
    issueSignedToken: async (options) => {
        assert.equal(options.maximumSizeInBytes, 20 * 1024 * 1024);
        assert.deepEqual(options.operations, ['put']);
        return { test: true };
    },
    get: async () => {
        blobReads++;
        return { statusCode: 200, stream: new ReadableStream({ start(controller) { controller.enqueue(data); controller.close(); } }) };
    }
} };
require.cache[require.resolve('@vercel/blob/client')] = { exports: {
    handleUploadPresigned: async ({ body, getSignedToken }) => {
        const options = await getSignedToken(body.payload.pathname);
        assert.equal(options.urlOptions.maximumSizeInBytes, 20 * 1024 * 1024);
        assert.equal(options.urlOptions.allowOverwrite, false);
        return { type: 'blob.generate-presigned-url', presignedUrlPayload: {} };
    }
} };

const { readUpload, sendFile } = require('./utils/files');
const { validatePdfFile } = require('./utils/security');
const articles = require('./controllers/articlesController');
const pathname = 'uploads/7/article/12345678-1234-1234-1234-123456789abc.pdf';
const request = (owner = 7) => ({
    user: { user_id: owner, role: 'user' },
    body: { conference_id: '1', title: 'Paper', uploads: { article: { pathname, name: 'paper.pdf', mimetype: 'application/pdf' } } }
});
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(value) { this.data = value; return this; } });

async function run() {
    await assert.rejects(readUpload(request(8), 'article', validatePdfFile), { statusCode: 403 });
    assert.equal(blobReads, 0, 'Reject another user before reading storage');
    const file = await readUpload(request(), 'article', validatePdfFile);
    assert.equal(file.blobPathname, pathname);
    assert.deepEqual(file.data, data);

    const res = response();
    await articles.submitArticle(request(), res);
    assert.equal(res.statusCode, 201);
    const insert = queries.find(query => query.sql.startsWith('INSERT INTO articles'));
    assert.equal(insert.params[7], null, 'Store a Blob reference instead of duplicating bytes');
    assert.equal(insert.params[11], pathname);

    selectedUser = 8;
    const readsBefore = blobReads;
    const denied = response();
    await articles.downloadArticle({ user: { user_id: 7, role: 'user' }, params: { id: '1' } }, denied);
    assert.equal(denied.statusCode, 403);
    assert.equal(blobReads, readsBefore, 'Authorize downloads before reading private storage');

    const chunks = [];
    const output = new Writable({ write(chunk, _encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); } });
    output.setHeader = () => {};
    await sendFile(output, null, pathname);
    assert.deepEqual(Buffer.concat(chunks), data);

    const app = require('./index');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const token = jwt.sign({ user_id: 7 }, process.env.JWT_SECRET);
    const post = (uploadPath, authenticated = true) => fetch(`${baseUrl}/api/uploads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type: 'blob.generate-presigned-url', payload: { pathname: uploadPath } })
    });
    try {
        assert.equal((await post(pathname, false)).status, 401);
        assert.equal((await post(pathname.replace('/7/', '/8/'))).status, 403);
        assert.equal((await post(pathname.replace('/article/', '/leaflet/'))).status, 403);
        assert.equal((await post(pathname)).status, 200);
        assert.equal((await fetch(`${baseUrl}/api/missing`)).status, 404);
        assert.equal((await fetch(`${baseUrl}/login`)).status, 200);
    } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
    console.log('Blob storage and Vercel route tests passed');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
