import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(currentDir, 'Header.module.css'), 'utf8');
const mobileBreakpoint = Number(css.match(/@media\s+screen\s+and\s+\(max-width:\s*(\d+)px\)/)?.[1] || 0);

const blockFor = (selector) => css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{(?<body>[^}]+)\\}`))?.groups?.body || '';

const hoverRule = css.match(/\.menu\s+\.registerLink:hover[^{]*\{(?<body>[^}]+)\}/)?.groups?.body || '';
const authLinksRule = blockFor('.authLinks');
const headerContainerRule = blockFor('.headerContainer');
const logoLinkRule = blockFor('.logoLink');
const menuLinkRule = blockFor('.menu a');
const loginLinkRule = blockFor('.loginLink');
const logoutBtnRule = blockFor('.logoutBtn');
const registerLinkRule = blockFor('.registerLink');
const mobileAuthLinksRule = blockFor('.menu_items_vertical .authLinks');
const mobileAuthLinkRule = blockFor('.menu_items_vertical .authLinks a');

assert.match(
    headerContainerRule,
    /max-width\s*:\s*(?:1[6-9]\d{2}|[2-9]\d{3})px/,
    'Header must provide enough desktop width for translated navigation labels.'
);

assert.ok(
    mobileBreakpoint > 0 && mobileBreakpoint <= 1280,
    'Header must not switch to the mobile menu on laptop-width screens.'
);

assert.match(
    logoLinkRule,
    /flex\s*:\s*0\s+0\s+auto/,
    'Logo must not shrink into the navigation text.'
);

assert.match(
    logoLinkRule,
    /min-width\s*:\s*max-content/,
    'Logo must reserve its intrinsic width so it cannot overpaint menu items.'
);

const menuFontClamp = menuLinkRule.match(/font-size\s*:\s*clamp\(\s*(?<min>\d+(?:\.\d+)?)rem\s*,\s*(?<preferred>\d+(?:\.\d+)?)vw\s*,\s*(?<max>\d+(?:\.\d+)?)rem\s*\)/)?.groups;
assert.ok(menuFontClamp, 'Desktop menu links must use a responsive font-size clamp.');
assert.ok(
    Number(menuFontClamp.min) >= 0.95 && Number(menuFontClamp.max) >= 1.05,
    'Desktop menu item text should be slightly larger while staying responsive.'
);

assert.match(
    hoverRule,
    /background\s*:/,
    'Register link hover must be scoped under .menu and define its own background so the generic menu hover does not wash it out.'
);

assert.match(
    hoverRule,
    /color\s*:\s*#fff\s*!important/i,
    'Register link hover must keep white text on its visible button background.'
);

assert.match(
    authLinksRule,
    /flex-wrap\s*:\s*nowrap/,
    'Header auth links must not wrap when the navigation gets tight.'
);

assert.match(
    loginLinkRule,
    /white-space\s*:\s*nowrap/,
    'Login link text must stay horizontal.'
);

assert.match(
    loginLinkRule,
    /word-break\s*:\s*keep-all/,
    'Login link text must not split into letters.'
);

assert.match(
    loginLinkRule,
    /writing-mode\s*:\s*horizontal-tb/,
    'Login link must use horizontal writing mode.'
);

assert.match(
    registerLinkRule,
    /white-space\s*:\s*nowrap/,
    'Register link text must stay horizontal.'
);

assert.match(
    logoutBtnRule,
    /white-space\s*:\s*nowrap/,
    'Logout button text must stay horizontal.'
);

assert.match(
    logoutBtnRule,
    /word-break\s*:\s*keep-all/,
    'Logout button text must not split into letters.'
);

assert.match(
    mobileAuthLinksRule,
    /flex-direction\s*:\s*row/,
    'Mobile auth links must stay horizontal, not stacked vertically.'
);

assert.match(
    mobileAuthLinkRule,
    /white-space\s*:\s*nowrap/,
    'Mobile auth links must not wrap into vertical-looking text.'
);

console.log('header css tests passed');
