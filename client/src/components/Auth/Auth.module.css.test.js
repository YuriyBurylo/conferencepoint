import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(currentDir, 'Auth.module.css'), 'utf8');
const submitBtnRule = css.match(/\.submitBtn\s*\{(?<body>[^}]+)\}/)?.groups?.body || '';

assert.match(
    submitBtnRule,
    /white-space\s*:\s*nowrap/,
    'Auth submit button text must stay horizontal.'
);

assert.match(
    submitBtnRule,
    /word-break\s*:\s*keep-all/,
    'Auth submit button text must not split into letters.'
);

assert.match(
    submitBtnRule,
    /writing-mode\s*:\s*horizontal-tb/,
    'Auth submit button must use horizontal writing mode.'
);

assert.match(
    submitBtnRule,
    /display\s*:\s*flex/,
    'Auth submit button should center text without collapsing it.'
);

console.log('auth css tests passed');
