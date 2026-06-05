import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const httpIndex = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
const authContext = fs.readFileSync(path.join(__dirname, '../src/context/AuthContext.jsx'), 'utf8');

assert.doesNotMatch(httpIndex, /localStorage/);
assert.doesNotMatch(authContext, /localStorage/);
assert.match(httpIndex, /withCredentials:\s*true/);

console.log('client auth transport security tests passed');
