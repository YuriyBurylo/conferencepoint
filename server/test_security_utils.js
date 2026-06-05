const assert = require('assert');

const {
    sanitizeFileName,
    validateUploadedFile,
    buildAllowedOrigins,
    getJwtSecret
} = require('./utils/security');

function testFileNameSanitizationRemovesPathsAndControls() {
    assert.strictEqual(sanitizeFileName('../private\\invoice.pdf'), 'invoice.pdf');
    assert.strictEqual(sanitizeFileName(' bad\u0000name?.pdf '), 'bad_name_.pdf');
    assert.strictEqual(sanitizeFileName(''), 'file');
}

function testUploadValidationRejectsWrongTypeAndOversize() {
    assert.throws(
        () => validateUploadedFile(
            { name: 'payload.exe', size: 16, mimetype: 'application/x-msdownload', data: Buffer.from('MZ') },
            { allowedExtensions: ['.pdf'], allowedMimeTypes: ['application/pdf'], maxSize: 1024, requirePdfSignature: true }
        ),
        /Недозволений тип файлу/
    );

    assert.throws(
        () => validateUploadedFile(
            { name: 'receipt.pdf', size: 2048, mimetype: 'application/pdf', data: Buffer.from('%PDF-') },
            { allowedExtensions: ['.pdf'], allowedMimeTypes: ['application/pdf'], maxSize: 1024, requirePdfSignature: true }
        ),
        /перевищує/
    );
}

function testAllowedOriginsAreExplicit() {
    const origins = buildAllowedOrigins('https://conferencepoint.online, http://localhost:5173');
    assert.deepStrictEqual(
        origins,
        new Set(['https://conferencepoint.online', 'http://localhost:5173'])
    );
}

function testDefaultJwtSecretIsRejected() {
    const previous = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'conferencepoint_secret_key_change_in_production';

    assert.throws(() => getJwtSecret(), /strong/);

    process.env.JWT_SECRET = previous;
}

testFileNameSanitizationRemovesPathsAndControls();
testUploadValidationRejectsWrongTypeAndOversize();
testAllowedOriginsAreExplicit();
testDefaultJwtSecretIsRejected();

console.log('security utils tests passed');
