const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const schema = read('database.sql');
assert.match(schema, /academic_title\s+VARCHAR\(128\)/i, 'users schema must include academic_title used by auth');

const migrationsDir = path.join(root, 'migrations');
const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => read(path.join('migrations', file)))
    .join('\n');

assert.match(migrations, /ALTER TABLE users[\s\S]*academic_title/i, 'migration must add academic_title to existing DBs');
assert.match(migrations, /burylojunior@gmail\.com/i, 'migration must restore the known admin account');
assert.match(migrations, /ON CONFLICT \(email\) DO UPDATE/i, 'migration must reset existing admin credentials by email');

console.log('auth schema seed tests passed');
