import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');

assert.match(
    source,
    /const\s+privateRoutes\s*=\s*\(\)\s*=>/,
    'Private routes should be grouped so they can be registered for normal and language-prefixed URLs.'
);

assert.match(
    source,
    /<Route\s+path=":lang"[^>]*>[\s\S]*?\{publicRoutes\(\)\}[\s\S]*?\{privateRoutes\(\)\}[\s\S]*?<\/Route>/,
    'Language-prefixed routes must include private/admin routes such as /uk/admin.'
);

assert.match(
    source,
    /path="forgot-password"/,
    'Forgot password route should be available.'
);

assert.match(
    source,
    /path="reset-password"/,
    'Reset password route should be available.'
);

console.log('app route tests passed');
