const assert = require('assert');
const path = require('path');

process.env.JWT_SECRET = 'test-secret-with-enough-length-for-security-tests';

const dbPath = path.resolve(__dirname, 'db.js');
const fakeDb = {
    queries: [],
    async query(sql, params) {
        this.queries.push({ sql, params });
        return { rows: [] };
    }
};

require.cache[dbPath] = { exports: fakeDb };
const authController = require('./controllers/authController');

function createRes() {
    return {
        statusCode: undefined,
        data: undefined,
        cookies: [],
        clearedCookies: [],
        status(code) { this.statusCode = code; return this; },
        json(data) { this.data = data; return this; },
        cookie(name, value, options) { this.cookies.push({ name, value, options }); return this; },
        clearCookie(name, options) { this.clearedCookies.push({ name, options }); return this; }
    };
}

async function testRegisterRejectsWeakPasswordsBeforeDatabase() {
    fakeDb.queries = [];
    const req = {
        body: {
            email: 'user@example.com',
            password: 'abcdef',
            full_name: 'Test User'
        }
    };
    const res = createRes();

    await authController.register(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.message, /10/);
    assert.strictEqual(fakeDb.queries.length, 0);
}

async function testAdminCannotDemoteOwnAccount() {
    fakeDb.queries = [];
    const req = {
        user: { user_id: 7, role: 'admin' },
        params: { id: '7' },
        body: { role: 'user' }
    };
    const res = createRes();

    await authController.updateUserRole(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.message, /власну роль/);
    assert.strictEqual(fakeDb.queries.length, 0);
}

async function testAdminCannotDeleteOwnAccount() {
    fakeDb.queries = [];
    const req = {
        user: { user_id: 7, role: 'admin' },
        params: { id: '7' }
    };
    const res = createRes();

    await authController.deleteUser(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.message, /власний акаунт/);
    assert.strictEqual(fakeDb.queries.length, 0);
}

(async () => {
    await testRegisterRejectsWeakPasswordsBeforeDatabase();
    await testAdminCannotDemoteOwnAccount();
    await testAdminCannotDeleteOwnAccount();
    console.log('auth security tests passed');
})();
