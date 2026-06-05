const assert = require('assert');
const {
    absoluteUrl,
    buildConferenceDescription,
    buildConferencePageSeo,
    buildRobotsTxt,
    buildSeoHead,
    buildSitemapXml,
    injectSeoIntoHtml,
    normalizeCanonicalPath
} = require('./utils/seo');

assert.strictEqual(absoluteUrl('/requirements'), 'https://conferencepoint.online/requirements');
assert.strictEqual(normalizeCanonicalPath('/newconferences/12?utm_source=test#share'), '/newconferences/12');
assert.strictEqual(
    buildConferenceDescription({
        title: 'Наукові горизонти',
        venue: 'Online',
        country: 'Україна',
        timing: '2026-05-01T00:00:00.000Z'
    }),
    'Наукові горизонти. Дата проведення: 01.05.2026. Місце проведення: Online, Україна.'
);
assert.match(buildRobotsTxt(), /Disallow: \/admin/);
assert.match(buildRobotsTxt(), /Sitemap: https:\/\/conferencepoint\.online\/sitemap\.xml/);

const sitemap = buildSitemapXml([
    { path: '/newconferences/12', priority: '0.8', changefreq: 'weekly', lastmod: '2026-05-01' }
]);

assert.match(sitemap, /<loc>https:\/\/conferencepoint\.online\/newconferences\/12<\/loc>/);
assert.match(sitemap, /<lastmod>2026-05-01<\/lastmod>/);
assert.doesNotMatch(sitemap, /\/login/);

const conferenceSeo = buildConferencePageSeo({
    conference: {
        conference_id: 12,
        title: 'Наукові горизонти',
        venue: 'Online',
        country: 'Україна',
        timing: '2026-05-01T00:00:00.000Z'
    },
    path: '/newconferences/12',
    sectionName: 'Актуальні конференції',
    sectionPath: '/newconferences'
});

assert.strictEqual(conferenceSeo.title, 'Наукові горизонти');
assert.strictEqual(conferenceSeo.type, 'article');
assert.strictEqual(conferenceSeo.jsonLd[1].url, 'https://conferencepoint.online/newconferences/12');

const seoHead = buildSeoHead({
    title: 'Актуальні конференції',
    description: 'Перелік конференцій',
    path: '/newconferences?utm_source=test',
    jsonLd: { '@type': 'CollectionPage' }
});

assert.match(seoHead, /<title>Актуальні конференції \| Conference Point<\/title>/);
assert.match(seoHead, /<link rel="canonical" href="https:\/\/conferencepoint\.online\/newconferences" \/>/);
assert.match(seoHead, /<meta property="og:image" content="https:\/\/conferencepoint\.online\/og-image\.png" \/>/);
assert.match(seoHead, /application\/ld\+json/);

const injectedHtml = injectSeoIntoHtml(
    '<!doctype html><html lang="uk"><head><meta name="description" content="Old" /><title>Old</title></head><body><div id="root"></div></body></html>',
    {
        title: 'Оплата',
        description: 'Реквізити для оплати',
        path: '/fees'
    }
);

assert.match(injectedHtml, /<title>Оплата \| Conference Point<\/title>/);
assert.doesNotMatch(injectedHtml, /content="Old"/);
assert.match(injectedHtml, /<div id="root"><noscript>/);

console.log('server seo tests passed');
