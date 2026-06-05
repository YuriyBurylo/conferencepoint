import { LANGUAGES, getLanguageMeta, isSupportedLanguage } from '../i18n/languageDetection.js';
import { createTranslator } from '../i18n/translations.js';

const env = import.meta.env || {};

export const SITE_URL = normalizeSiteUrl(env.VITE_SITE_URL || 'https://conferencepoint.online');
export const SITE_NAME = 'Conference Point';
export const DEFAULT_TITLE = 'Conference Point — Наукові інтернет-конференції';
export const DEFAULT_DESCRIPTION = 'Conference Point — платформа для участі у наукових інтернет-конференціях, подання тез та перегляду архіву матеріалів конференцій.';
export const DEFAULT_IMAGE = '/og-image.png';

export const PUBLIC_ROUTES = [
    {
        path: '/',
        titleKey: 'seo.homeTitle',
        descriptionKey: 'seo.homeDescription',
        title: 'Наукові інтернет-конференції',
        description: 'Conference Point допомагає науковцям, викладачам, аспірантам і студентам брати участь у наукових інтернет-конференціях та публікувати тези.',
        priority: '1.0',
        changefreq: 'weekly'
    },
    {
        path: '/newconferences',
        titleKey: 'seo.newTitle',
        descriptionKey: 'seo.newDescription',
        title: 'Актуальні наукові конференції',
        description: 'Перелік актуальних наукових інтернет-конференцій Conference Point з датами проведення, темами та інформаційними матеріалами.',
        priority: '0.9',
        changefreq: 'daily'
    },
    {
        path: '/pastconferences',
        titleKey: 'seo.archiveTitle',
        descriptionKey: 'seo.archiveDescription',
        title: 'Архів наукових конференцій',
        description: 'Архів проведених наукових інтернет-конференцій Conference Point з матеріалами, датами та темами конференцій.',
        priority: '0.8',
        changefreq: 'weekly'
    },
    {
        path: '/requirements',
        titleKey: 'seo.requirementsTitle',
        descriptionKey: 'seo.requirementsDescription',
        title: 'Умови участі в конференціях',
        description: 'Умови участі у наукових інтернет-конференціях Conference Point: напрями роботи, вимоги до тез, порядок подання матеріалів та оформлення.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    {
        path: '/fees',
        titleKey: 'seo.feesTitle',
        descriptionKey: 'seo.feesDescription',
        title: 'Оплата за участь у конференції',
        description: 'Інформація про організаційний внесок за участь у конференціях Conference Point та реквізити для оплати.',
        priority: '0.6',
        changefreq: 'monthly'
    }
];

export function normalizeSiteUrl(url) {
    return String(url || '').replace(/\/+$/, '') || 'https://conferencepoint.online';
}

export function normalizeCanonicalPath(path = '/') {
    const cleanPath = String(path || '/').split('#')[0].split('?')[0] || '/';
    let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
    if (normalizedPath.length > 1) {
        normalizedPath = normalizedPath.replace(/\/+$/, '');
    }
    return normalizedPath || '/';
}

export function splitLocalizedPath(path = '/') {
    const normalizedPath = normalizeCanonicalPath(path);
    const [, maybeLanguage, ...rest] = normalizedPath.split('/');

    if (!isSupportedLanguage(maybeLanguage)) {
        return {
            language: null,
            basePath: normalizedPath,
            localizedPath: normalizedPath
        };
    }

    const basePath = rest.length ? `/${rest.join('/')}` : '/';
    return {
        language: maybeLanguage,
        basePath,
        localizedPath: normalizedPath
    };
}

export function localizePath(path = '/', language = 'uk') {
    const { basePath } = splitLocalizedPath(path);
    if (!isSupportedLanguage(language)) return basePath;
    return basePath === '/' ? `/${language}` : `/${language}${basePath}`;
}

export function isPublicRoutePath(path = '/') {
    const { basePath } = splitLocalizedPath(path);
    return PUBLIC_ROUTES.some(route => route.path === basePath)
        || /^\/newconferences\/[^/]+$/.test(basePath)
        || /^\/pastconferences\/[^/]+$/.test(basePath);
}

export function resolveLocalizedSeoPath({ explicitPath, currentPath } = {}) {
    const requestedPath = normalizeCanonicalPath(explicitPath || currentPath || '/');
    const current = splitLocalizedPath(currentPath || requestedPath);
    const explicit = splitLocalizedPath(requestedPath);

    if (current.language && current.basePath === explicit.basePath) {
        return current.localizedPath;
    }

    return requestedPath;
}

export function buildAbsoluteUrl(path = '/', baseUrl = SITE_URL) {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizeSiteUrl(baseUrl)}${normalizedPath}`;
}

export function buildPageTitle(title) {
    if (!title) return DEFAULT_TITLE;
    return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function getPublicRouteSeo(path = '/') {
    const { language: pathLanguage, basePath } = splitLocalizedPath(path);
    const route = PUBLIC_ROUTES.find(item => item.path === basePath);
    if (!route) return null;

    const language = pathLanguage || 'uk';
    const meta = getLanguageMeta(language);
    const t = createTranslator(language);

    return {
        ...route,
        basePath,
        path: pathLanguage ? localizePath(basePath, language) : basePath,
        language,
        locale: meta.locale,
        ogLocale: meta.ogLocale,
        title: t(route.titleKey),
        description: t(route.descriptionKey),
        alternates: buildLanguageAlternates(basePath)
    };
}

export function buildLanguageAlternates(path = '/') {
    const { basePath } = splitLocalizedPath(path);
    if (!isPublicRoutePath(basePath)) return [];

    return [
        ...LANGUAGES.map(language => ({
            hreflang: language.locale,
            href: buildAbsoluteUrl(localizePath(basePath, language.code)),
            ogLocale: language.ogLocale
        })),
        {
            hreflang: 'x-default',
            href: buildAbsoluteUrl(basePath)
        }
    ];
}

export function buildSeoData({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
    noindex = false,
    jsonLd = []
} = {}) {
    const canonicalPath = normalizeCanonicalPath(path);
    const { language, basePath } = splitLocalizedPath(canonicalPath);
    const meta = getLanguageMeta(language || 'uk');
    const normalizedJsonLd = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : [jsonLd].filter(Boolean);

    return {
        title: buildPageTitle(title),
        description,
        path: canonicalPath,
        basePath,
        canonicalUrl: buildAbsoluteUrl(canonicalPath),
        imageUrl: buildAbsoluteUrl(image),
        type,
        locale: meta.locale,
        ogLocale: meta.ogLocale,
        alternates: buildLanguageAlternates(basePath),
        robots: noindex ? 'noindex, nofollow' : 'index, follow',
        jsonLd: normalizedJsonLd
    };
}

export function formatConferenceDate(timing) {
    const match = String(timing || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    return `${match[3]}.${match[2]}.${match[1]}`;
}

export function buildConferenceDescription(conference = {}, t = null) {
    const parts = [];
    if (conference.title) parts.push(conference.title);
    const date = formatConferenceDate(conference.timing);
    if (date) parts.push(`${t ? t('seo.conferenceDate') : 'Дата проведення'}: ${date}`);
    const place = [conference.venue, conference.country].filter(Boolean).join(', ');
    if (place) parts.push(`${t ? t('seo.conferencePlace') : 'Місце проведення'}: ${place}`);
    return `${parts.join('. ')}.`;
}

export function buildOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        email: 'admin@conferencepoint.online'
    };
}

export function buildWebsiteJsonLd(locale = 'uk-UA') {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: locale
    };
}

export function buildBreadcrumbJsonLd(items = []) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: buildAbsoluteUrl(item.path)
        }))
    };
}

export function buildConferenceEventJsonLd({ conference = {}, path = '/', t = null } = {}) {
    const url = buildAbsoluteUrl(path);

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: conference.title,
        description: buildConferenceDescription(conference, t),
        startDate: conference.timing,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
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
}

export function buildConferenceItemListJsonLd({ conferences = [], pathPrefix = '/newconferences' } = {}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: conferences.map((conference, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: conference.title,
            url: buildAbsoluteUrl(`${pathPrefix}/${conference.conference_id}`)
        }))
    };
}

export function buildRobotsTxt() {
    return [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /profile',
        'Disallow: /my-articles',
        'Disallow: /submit-article',
        'Disallow: /login',
        'Disallow: /register',
        '',
        `Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}`,
        ''
    ].join('\n');
}

export function buildStaticSitemap(routes = PUBLIC_ROUTES) {
    const sitemapRoutes = routes.flatMap(route => [
        { ...route, sitemapPath: route.path },
        ...LANGUAGES.map(language => ({
            ...route,
            sitemapPath: localizePath(route.path, language.code)
        }))
    ]);

    const urls = sitemapRoutes.map(route => [
        '  <url>',
        `    <loc>${buildAbsoluteUrl(route.sitemapPath)}</loc>`,
        ...buildLanguageAlternates(route.path).map(alternate => (
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`
        )),
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>'
    ].join('\n'));

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...urls,
        '</urlset>',
        ''
    ].join('\n');
}
