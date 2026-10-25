const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { RequestValidationError, sanitizeFileName } = require('./security');

const blobSdk = () => require('@vercel/blob');
const hasUpload = (req, field) => Boolean(req.files?.[field] || req.body?.uploads?.[field]);

async function readBlob(pathname, maxBytes = 20 * 1024 * 1024) {
    const result = await blobSdk().get(pathname, { access: 'private' });
    if (!result || result.statusCode !== 200) throw new RequestValidationError('File not found', 404);
    const chunks = [];
    let size = 0;
    for await (const chunk of result.stream) {
        size += chunk.length;
        if (size > maxBytes) throw new RequestValidationError('File is too large', 413);
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

async function readUpload(req, field, validate) {
    const reference = req.body?.uploads?.[field];
    if (!reference) return validate(req.files?.[field]);
    const prefix = `uploads/${req.user?.user_id}/${field}/`;
    if (typeof reference.pathname !== 'string' || !reference.pathname.startsWith(prefix) ||
        !/^uploads\/\d+\/(article|receipt|leaflet|textpdf)\/[a-f0-9-]+\.(pdf|docx?)$/.test(reference.pathname)) {
        throw new RequestValidationError('Invalid upload reference', 403);
    }
    const data = await readBlob(reference.pathname);
    const file = validate({ name: reference.name, mimetype: reference.mimetype, size: data.length, data });
    return { ...file, blobPathname: reference.pathname };
}

async function sendFile(res, data, pathname) {
    res.setHeader('Cache-Control', 'private, no-store');
    if (pathname) {
        const result = await blobSdk().get(pathname, { access: 'private' });
        if (!result || result.statusCode !== 200) return res.status(404).end();
        res.flushHeaders?.();
        return pipeline(Readable.fromWeb(result.stream), res);
    }
    if (process.env.VERCEL === '1') {
        res.flushHeaders?.();
        return pipeline(Readable.from([data]), res);
    }
    return res.send(data);
}

// ZIP exports also read legacy database files while the Blob migration is running.
async function archiveFile(row) {
    if (!row.file_blob) return row.file_data;
    const result = await blobSdk().get(row.file_blob, { access: 'private' });
    if (!result || result.statusCode !== 200) throw new Error('Article file not found');
    return Readable.fromWeb(result.stream);
}

module.exports = { archiveFile, hasUpload, readBlob, readUpload, sanitizeFileName, sendFile };
