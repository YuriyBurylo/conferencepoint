const SITE_URL = (process.env.SITE_URL || 'https://conferencepoint.online').replace(/\/+$/, '');
const SITE_NAME = 'Conference Point';
const DEFAULT_TITLE = 'Conference Point — Наукові інтернет-конференції';
const DEFAULT_DESCRIPTION = 'Conference Point — платформа для участі у наукових інтернет-конференціях, подання тез та перегляду архіву матеріалів конференцій.';
const DEFAULT_IMAGE = '/og-image.png';

const publicRoutes = [
    {
        path: '/',
        title: 'Наукові інтернет-конференції',
        description: 'Conference Point допомагає науковцям, викладачам, аспірантам і студентам брати участь у наукових інтернет-конференціях та публікувати тези.',
        priority: '1.0',
        changefreq: 'weekly'
    },
    {
        path: '/newconferences',
        title: 'Актуальні наукові конференції',
        description: 'Перелік актуальних наукових інтернет-конференцій Conference Point з датами проведення, темами та інформаційними матеріалами.',
        priority: '0.9',
        changefreq: 'daily'
    },
    {
        path: '/pastconferences',
        title: 'Архів наукових конференцій',
        description: 'Архів проведених наукових інтернет-конференцій Conference Point з матеріалами, датами та темами конференцій.',
        priority: '0.8',
        changefreq: 'weekly'
    },
    {
        path: '/requirements',
        title: 'Умови участі в конференціях',
        description: 'Умови участі у наукових інтернет-конференціях Conference Point: напрями роботи, вимоги до тез, порядок подання матеріалів та оформлення.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    {
        path: '/fees',
        title: 'Оплата за участь у конференції',
        description: 'Інформація про організаційний внесок за участь у конференціях Conference Point та реквізити для оплати.',
        priority: '0.6',
        changefreq: 'monthly'
    }
];

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeXml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const escapeJsonForHtml = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const normalizeCanonicalPath = (path = '/') => {
    const cleanPath = String(path || '/').split('#')[0].split('?')[0] || '/';
    let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
    if (normalizedPath.length > 1) {
        normalizedPath = normalizedPath.replace(/\/+$/, '');
    }
    return normalizedPath || '/';
};

const absoluteUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}${normalizedPath}`;
};

const buildPageTitle = (title) => {
    if (!title) return DEFAULT_TITLE;
    return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
};

const formatConferenceDate = (timing) => {
    if (!timing) return '';
    const value = timing instanceof Date ? timing.toISOString() : String(timing);
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    return `${match[3]}.${match[2]}.${match[1]}`;
};

const buildConferenceDescription = (conference = {}) => {
    const parts = [];
    if (conference.title) parts.push(conference.title);
    const date = formatConferenceDate(conference.timing);
    if (date) parts.push(`Дата проведення: ${date}`);
    const place = [conference.venue, conference.country].filter(Boolean).join(', ');
    if (place) parts.push(`Місце проведення: ${place}`);
    return `${parts.join('. ')}.`;
};

const buildOrganizationJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'admin@conferencepoint.online'
});

const buildWebsiteJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'uk-UA'
});

const buildBreadcrumbJsonLd = (items = []) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path)
    }))
});

const buildConferenceEventJsonLd = ({ conference = {}, path = '/', eventStatus = 'https://schema.org/EventScheduled' } = {}) => {
    const url = absoluteUrl(path);

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: conference.title,
        description: buildConferenceDescription(conference),
        startDate: conference.timing,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus,
        url,
        location: {
            '@type': 'VirtualLocation',
            url
        },
        organizer: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL
        }
    };
};

const buildConferenceItemListJsonLd = ({ conferences = [], pathPrefix = '/newconferences' } = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: conferences.map((conference, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: conference.title,
        url: absoluteUrl(`${pathPrefix}/${conference.conference_id}`)
    }))
});

const buildConferencePageSeo = ({
    conference = {},
    path = '/',
    sectionName = 'Актуальні конференції',
    sectionPath = '/newconferences',
    eventStatus = 'https://schema.org/EventScheduled'
} = {}) => ({
    title: conference.title,
    description: buildConferenceDescription(conference),
    path,
    type: 'article',
    jsonLd: [
        buildBreadcrumbJsonLd([
            { name: 'Головна', path: '/' },
            { name: sectionName, path: sectionPath },
            { name: conference.title, path }
        ]),
        buildConferenceEventJsonLd({ conference, path, eventStatus })
    ]
});

const getPublicRouteSeo = (path = '/') => {
    const canonicalPath = normalizeCanonicalPath(path);
    const route = publicRoutes.find(item => item.path === canonicalPath);
    return route ? { ...route, path: canonicalPath } : null;
};

const buildSeoData = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
    noindex = false,
    jsonLd = []
} = {}) => {
    const canonicalPath = normalizeCanonicalPath(path);
    return {
        title: buildPageTitle(title),
        description,
        path: canonicalPath,
        canonicalUrl: absoluteUrl(canonicalPath),
        imageUrl: absoluteUrl(image),
        type,
        robots: noindex ? 'noindex, nofollow' : 'index, follow',
        jsonLd: (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    };
};

const buildSeoHead = (options = {}) => {
    const seo = buildSeoData(options);
    const jsonLdTags = seo.jsonLd.map(item => (
        `<script type="application/ld+json" data-seo-json-ld="true">${escapeJsonForHtml(item)}</script>`
    ));

    return [
        `<title>${escapeHtml(seo.title)}</title>`,
        `<meta name="description" content="${escapeHtml(seo.description)}" />`,
        `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
        '<meta name="theme-color" content="#0f8b7f" />',
        '<meta property="og:site_name" content="Conference Point" />',
        `<meta property="og:type" content="${escapeHtml(seo.type)}" />`,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
        `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`,
        `<meta property="og:image" content="${escapeHtml(seo.imageUrl)}" />`,
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:locale" content="uk_UA" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
        `<meta name="twitter:image" content="${escapeHtml(seo.imageUrl)}" />`,
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
        ...jsonLdTags
    ].join('\n    ');
};

const buildNoscriptFallback = (options = {}) => {
    const seo = buildSeoData(options);
    return [
        '<noscript>',
        '<main>',
        `<h1>${escapeHtml(seo.title)}</h1>`,
        `<p>${escapeHtml(seo.description)}</p>`,
        '<nav>',
        '<a href="/">Головна</a>',
        '<a href="/newconferences">Актуальні конференції</a>',
        '<a href="/pastconferences">Архів конференцій</a>',
        '<a href="/requirements">Умови участі</a>',
        '<a href="/fees">Оплата</a>',
        '</nav>',
        '</main>',
        '</noscript>'
    ].join('');
};

const stripManagedHead = (head) => head
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|theme-color|twitter:[^"]+|og:[^"]+)"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json"[^>]*data-seo-json-ld="true"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

const injectSeoIntoHtml = (html, options = {}) => {
    const withHead = html.replace(/<head>([\s\S]*?)<\/head>/i, (match, headContent) => (
        `<head>${stripManagedHead(headContent).trim()}\n    ${buildSeoHead(options)}\n  </head>`
    ));

    return withHead.replace(
        /<div id="root"><\/div>/i,
        `<div id="root">${buildNoscriptFallback(options)}</div>`
    );
};

const buildRobotsTxt = () => [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /profile',
    'Disallow: /my-articles',
    'Disallow: /submit-article',
    'Disallow: /login',
    'Disallow: /register',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    ''
].join('\n');

const buildSitemapXml = (conferenceRoutes = []) => {
    const routes = [...publicRoutes, ...conferenceRoutes];
    const urls = routes.map(route => [
        '  <url>',
        `    <loc>${escapeXml(absoluteUrl(normalizeCanonicalPath(route.path)))}</loc>`,
        route.lastmod ? `    <lastmod>${escapeXml(route.lastmod)}</lastmod>` : '',
        `    <changefreq>${escapeXml(route.changefreq || 'weekly')}</changefreq>`,
        `    <priority>${escapeXml(route.priority || '0.5')}</priority>`,
        '  </url>'
    ].filter(Boolean).join('\n'));

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        ''
    ].join('\n');
};

module.exports = {
    SITE_NAME,
    SITE_URL,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    DEFAULT_TITLE,
    publicRoutes,
    absoluteUrl,
    buildBreadcrumbJsonLd,
    buildConferenceDescription,
    buildConferenceEventJsonLd,
    buildConferenceItemListJsonLd,
    buildConferencePageSeo,
    buildNoscriptFallback,
    buildOrganizationJsonLd,
    buildPageTitle,
    buildRobotsTxt,
    buildSeoData,
    buildSeoHead,
    buildSitemapXml,
    buildWebsiteJsonLd,
    formatConferenceDate,
    getPublicRouteSeo,
    injectSeoIntoHtml,
    normalizeCanonicalPath
};
