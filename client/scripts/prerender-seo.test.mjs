import assert from 'node:assert';
import { renderRouteHtml } from './prerender-seo.mjs';

const html = renderRouteHtml(
    '<!doctype html><html lang="uk"><head><title>Old</title><meta name="description" content="Old" /></head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>',
    {
        title: 'Умови участі в конференціях',
        description: 'Правила участі у конференціях',
        path: '/ja/requirements?utm_source=test',
        locale: 'ja-JP',
        ogLocale: 'ja_JP',
        jsonLd: { '@type': 'WebPage' }
    }
);

assert.match(html, /<title>Умови участі в конференціях \| Conference Point<\/title>/);
assert.match(html, /<html lang="ja-JP">/);
assert.match(html, /<link rel="canonical" href="https:\/\/conferencepoint\.online\/ja\/requirements" \/>/);
assert.match(html, /<link rel="alternate" hreflang="hi-IN" href="https:\/\/conferencepoint\.online\/hi\/requirements" \/>/);
assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/conferencepoint\.online\/requirements" \/>/);
assert.match(html, /<meta property="og:locale" content="ja_JP" \/>/);
assert.match(html, /<meta property="og:image" content="https:\/\/conferencepoint\.online\/og-image\.png" \/>/);
assert.match(html, /<div id="root"><noscript>/);
assert.match(html, /<a href="\/ja\/requirements">参加要件<\/a>/);
assert.match(html, /application\/ld\+json/);
assert.doesNotMatch(html, /content="Old"/);

console.log('prerender seo tests passed');
