import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(currentDir, '..');

const readCss = (relativePath) => readFileSync(join(srcDir, relativePath), 'utf8');

const blockFor = (css, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`${escaped}\\s*\\{(?<body>[^}]+)\\}`))?.groups?.body || '';
};

const indexCss = readCss('index.css');
assert.match(
    indexCss,
    /button,\s*input,\s*select,\s*textarea\s*\{[^}]*max-width:\s*100%/s,
    'Form controls must be globally constrained so they cannot overflow small screens.'
);
assert.match(
    indexCss,
    /p,\s*h1,\s*h2,\s*h3,\s*h4,\s*a,\s*button,\s*label,\s*td,\s*th\s*\{[^}]*overflow-wrap:\s*break-word/s,
    'Common text nodes must wrap long words instead of forcing horizontal scroll.'
);

const headerCss = readCss('components/Header/Header.module.css');
assert.match(blockFor(headerCss, '.headerContainer'), /min-width:\s*0/);
assert.match(blockFor(headerCss, '.logoText'), /clamp\(/);
assert.match(blockFor(headerCss, '.menu_items'), /clamp\(/);

const newConferencesCss = readCss('components/NewConferences/NewConferences.module.css');
assert.match(blockFor(newConferencesCss, '.conference'), /min-width:\s*0/);
assert.match(blockFor(newConferencesCss, '.title'), /overflow-wrap:\s*break-word/);
assert.match(blockFor(newConferencesCss, '.actions'), /min-width:\s*0/);

const archiveConferencesCss = readCss('components/ArchiveConferences/ArchiveConferences.module.css');
assert.match(blockFor(archiveConferencesCss, '.conference'), /min-width:\s*0/);
assert.match(blockFor(archiveConferencesCss, '.title'), /overflow-wrap:\s*break-word/);
assert.match(blockFor(archiveConferencesCss, '.actions'), /min-width:\s*0/);

const adminCss = readCss('components/Admin/Admin.module.css');
assert.match(blockFor(adminCss, '.tableContainer'), /max-width:\s*100%/);
assert.match(blockFor(adminCss, '.modal'), /calc\(100dvh - 2rem\)/);

const submitCss = readCss('components/SubmitArticle/SubmitArticle.module.css');
assert.match(blockFor(submitCss, '.reviewItem'), /min-width:\s*0/);

const floatingShareCss = readCss('components/FloatingShare/FloatingShare.module.css');
assert.match(blockFor(floatingShareCss, '.floatingShare'), /max-width:\s*calc\(100vw - 28px\)/);

console.log('responsive css tests passed');
