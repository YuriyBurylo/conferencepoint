import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsx = fs.readFileSync(path.join(__dirname, 'NewConferences.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'NewConferences.module.css'), 'utf8');

assert.match(jsx, /className=\{styles\.location\}/);
assert.match(css, /\.conference\s*\{[^}]*display:\s*grid/s);
assert.match(css, /grid-template-columns:\s*92px\s+130px\s+minmax\(180px,\s*1fr\)\s+minmax\(110px,\s*140px\)\s+minmax\(220px,\s*250px\)/s);
assert.match(css, /\.location\s*\{[^}]*display:\s*flex/s);

console.log('new conference layout tests passed');
