import assert from 'node:assert';
import {
    buildAbsoluteUrl,
    buildBreadcrumbJsonLd,
    buildConferenceDescription,
    buildConferenceEventJsonLd,
    buildLanguageAlternates,
    buildSeoData,
    getPublicRouteSeo,
    normalizeCanonicalPath,
    resolveLocalizedSeoPath,
    buildPageTitle,
    buildRobotsTxt,
    buildStaticSitemap,
    DEFAULT_IMAGE,
    SITE_URL
} from './seo.js';

assert.strictEqual(SITE_URL, 'https://conferencepoint.online');
assert.strictEqual(buildAbsoluteUrl('/requirements'), 'https://conferencepoint.online/requirements');
assert.strictEqual(buildAbsoluteUrl('fees'), 'https://conferencepoint.online/fees');
assert.strictEqual(buildPageTitle('Актуальні конференції'), 'Актуальні конференції | Conference Point');
assert.strictEqual(DEFAULT_IMAGE, '/og-image.png');
assert.strictEqual(normalizeCanonicalPath('/requirements?utm_source=test#top'), '/requirements');
assert.strictEqual(normalizeCanonicalPath('fees/'), '/fees');
assert.strictEqual(resolveLocalizedSeoPath({ explicitPath: '/requirements', currentPath: '/ja/requirements' }), '/ja/requirements');
assert.strictEqual(resolveLocalizedSeoPath({ explicitPath: '/fees', currentPath: '/hi/fees' }), '/hi/fees');
assert.strictEqual(resolveLocalizedSeoPath({ explicitPath: '/fees', currentPath: '/profile' }), '/fees');

const requirementsSeo = getPublicRouteSeo('/requirements?utm_source=test');
assert.strictEqual(requirementsSeo.path, '/requirements');
assert.strictEqual(requirementsSeo.title, 'Умови участі в конференціях');

const japaneseRequirementsSeo = getPublicRouteSeo('/ja/requirements');
assert.strictEqual(japaneseRequirementsSeo.language, 'ja');
assert.strictEqual(japaneseRequirementsSeo.basePath, '/requirements');
assert.strictEqual(japaneseRequirementsSeo.path, '/ja/requirements');
assert.strictEqual(japaneseRequirementsSeo.title, '参加要件');
assert.strictEqual(japaneseRequirementsSeo.locale, 'ja-JP');

const alternates = buildLanguageAlternates('/requirements');
assert.ok(alternates.some(item => item.hreflang === 'ja-JP' && item.href === 'https://conferencepoint.online/ja/requirements'));
assert.ok(alternates.some(item => item.hreflang === 'hi-IN' && item.href === 'https://conferencepoint.online/hi/requirements'));
assert.ok(alternates.some(item => item.hreflang === 'x-default' && item.href === 'https://conferencepoint.online/requirements'));

const detailAlternates = buildLanguageAlternates('/newconferences/12');
assert.ok(detailAlternates.some(item => item.hreflang === 'ja-JP' && item.href === 'https://conferencepoint.online/ja/newconferences/12'));
assert.ok(detailAlternates.some(item => item.hreflang === 'x-default' && item.href === 'https://conferencepoint.online/newconferences/12'));

const seoData = buildSeoData({
    title: '参加要件',
    description: '参加ルール',
    path: '/ja/requirements?utm_source=test',
    jsonLd: { '@type': 'WebPage' }
});

assert.strictEqual(seoData.title, '参加要件 | Conference Point');
assert.strictEqual(seoData.canonicalUrl, 'https://conferencepoint.online/ja/requirements');
assert.strictEqual(seoData.imageUrl, 'https://conferencepoint.online/og-image.png');
assert.strictEqual(seoData.locale, 'ja-JP');
assert.ok(seoData.alternates.some(item => item.hreflang === 'hi-IN'));
assert.deepStrictEqual(seoData.jsonLd, [{ '@type': 'WebPage' }]);

assert.strictEqual(
    buildConferenceDescription({
        title: 'Наукові горизонти',
        country: 'Україна',
        venue: 'Online',
        timing: '2026-05-01T00:00:00.000Z'
    }),
    'Наукові горизонти. Дата проведення: 01.05.2026. Місце проведення: Online, Україна.'
);

const eventJsonLd = buildConferenceEventJsonLd({
    conference: {
        title: 'Наукові горизонти',
        country: 'Україна',
        venue: 'Online',
        timing: '2026-05-01T00:00:00.000Z'
    },
    path: '/newconferences/12'
});

assert.strictEqual(eventJsonLd['@type'], 'Event');
assert.strictEqual(eventJsonLd.name, 'Наукові горизонти');
assert.strictEqual(eventJsonLd.url, 'https://conferencepoint.online/newconferences/12');
assert.strictEqual(eventJsonLd.organizer.name, 'Conference Point');

const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Головна', path: '/' },
    { name: 'Актуальні конференції', path: '/newconferences' }
]);

assert.strictEqual(breadcrumbs.itemListElement[1].item, 'https://conferencepoint.online/newconferences');

assert.match(buildRobotsTxt(), /Disallow: \/admin/);
assert.match(buildRobotsTxt(), /Sitemap: https:\/\/conferencepoint\.online\/sitemap\.xml/);
assert.match(buildStaticSitemap(), /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
assert.match(buildStaticSitemap(), /<loc>https:\/\/conferencepoint\.online\/ja\/requirements<\/loc>/);
assert.match(buildStaticSitemap(), /hreflang="hi-IN" href="https:\/\/conferencepoint\.online\/hi\/requirements"/);
assert.doesNotMatch(buildStaticSitemap(), /\/login/);

console.log('seo tests passed');
