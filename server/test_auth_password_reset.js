const assert = require('assert');
const crypto = require('crypto');
const path = require('path');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-with-enough-length-for-password-reset-tests';
process.env.PASSWORD_RESET_EXPOSE_TOKEN = 'true';
process.env.SITE_URL = 'https://conferencepoint.test';

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    queries: [],
    handlers: [],
    async query(sql, params) {
        this.queries.push({ sql, params });
        const handler = this.handlers.shift();
        if (typeof handler === 'function') {
            return handler(sql, params);
        }
        return handler || { rows: [] };
    }
};

require.cache[dbPath] = { exports: fakeDb };
const authController = require('./controllers/authController');

function createRes() {
    return {
        statusCode: undefined,
        data: undefined,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.data = data; return this; }
    };
}

function assertMethod(name) {
    assert.strictEqual(typeof authController[name], 'function', `${name} should exist`);
}

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function testChangePasswordRejectsWrongCurrentPassword() {
    assertMethod('changePassword');
    fakeDb.queries = [];
    fakeDb.handlers = [
        { rows: [{ user_id: 5, password_hash: await bcrypt.hash('CurrentPassword123', 4) }] }
    ];

    const req = {
        user: { user_id: 5 },
        body: { current_password: 'WrongPassword123', new_password: 'NewPassword123' }
    };
    const res = createRes();

    await authController.changePassword(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(fakeDb.queries.length, 1);
}

async function testChangePasswordUpdatesHash() {
    assertMethod('changePassword');
    fakeDb.queries = [];
    fakeDb.handlers = [
        { rows: [{ user_id: 5, password_hash: await bcrypt.hash('CurrentPassword123', 4) }] },
        { rows: [{ user_id: 5 }] }
    ];

    const req = {
        user: { user_id: 5 },
        body: { current_password: 'CurrentPassword123', new_password: 'NewPassword123' }
    };
    const res = createRes();

    await authController.changePassword(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.match(fakeDb.queries[1].sql, /UPDATE users SET password_hash/i);
    assert.strictEqual(await bcrypt.compare('NewPassword123', fakeDb.queries[1].params[0]), true);
}

async function testPasswordResetRequestDoesNotRevealUnknownEmail() {
    assertMethod('requestPasswordReset');
    fakeDb.queries = [];
    fakeDb.handlers = [{ rows: [] }];

    const req = { body: { email: 'missing@example.com' } };
    const res = createRes();

    await authController.requestPasswordReset(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.strictEqual(fakeDb.queries.length, 1);
    assert.strictEqual(res.data.reset_token, undefined);
}

async function testPasswordResetRequestCreatesHashedToken() {
    assertMethod('requestPasswordReset');
    fakeDb.queries = [];
    fakeDb.handlers = [
        { rows: [{ user_id: 7, email: 'user@example.com' }] },
        { rows: [{ reset_id: 12 }] }
    ];

    const req = { body: { email: ' User@Example.com ' } };
    const res = createRes();

    await authController.requestPasswordReset(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.match(fakeDb.queries[1].sql, /INSERT INTO password_reset_tokens/i);
    assert.strictEqual(fakeDb.queries[1].params[0], 7);
    assert.strictEqual(fakeDb.queries[1].params[1], hashResetToken(res.data.reset_token));
    assert.match(res.data.reset_url, /^https:\/\/conferencepoint\.test\/reset-password\?token=/);
}

async function testResetPasswordRejectsInvalidToken() {
    assertMethod('resetPassword');
    fakeDb.queries = [];
    fakeDb.handlers = [{ rows: [] }];

    const req = { body: { token: 'bad-token', password: 'NewPassword123' } };
    const res = createRes();

    await authController.resetPassword(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(fakeDb.queries[0].params[0], hashResetToken('bad-token'));
}

async function testResetPasswordUpdatesPasswordAndMarksTokenUsed() {
    assertMethod('resetPassword');
    fakeDb.queries = [];
    fakeDb.handlers = [
        { rows: [{ reset_id: 10, user_id: 7 }] },
        { rows: [{ user_id: 7 }] },
        { rows: [{ reset_id: 10 }] }
    ];

    const req = { body: { token: 'valid-token', password: 'NewPassword123' } };
    const res = createRes();

    await authController.resetPassword(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.strictEqual(fakeDb.queries[0].params[0], hashResetToken('valid-token'));
    assert.match(fakeDb.queries[1].sql, /UPDATE users SET password_hash/i);
    assert.strictEqual(await bcrypt.compare('NewPassword123', fakeDb.queries[1].params[0]), true);
    assert.match(fakeDb.queries[2].sql, /UPDATE password_reset_tokens SET used_at/i);
}

(async () => {
    await testChangePasswordRejectsWrongCurrentPassword();
    await testChangePasswordUpdatesHash();
    await testPasswordResetRequestDoesNotRevealUnknownEmail();
    await testPasswordResetRequestCreatesHashedToken();
    await testResetPasswordRejectsInvalidToken();
    await testResetPasswordUpdatesPasswordAndMarksTokenUsed();
    console.log('auth password reset tests passed');
})();
