import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    buildBreadcrumbJsonLd,
    buildOrganizationJsonLd,
    buildRobotsTxt,
    buildSeoData,
    buildStaticSitemap,
    buildWebsiteJsonLd,
    getPublicRouteSeo,
    localizePath,
    PUBLIC_ROUTES
} from '../src/utils/seo.js';
import { LANGUAGES } from '../src/i18n/languageDetection.js';
import { createTranslator } from '../src/i18n/translations.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDistDir = path.resolve(currentDir, '../dist');

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeJsonForHtml = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const buildRouteJsonLd = (route) => {
    if (route.basePath === '/') {
        return [buildOrganizationJsonLd(), buildWebsiteJsonLd(route.locale)];
    }

    const homePath = route.language ? localizePath('/', route.language) : '/';
    return buildBreadcrumbJsonLd([
        { name: 'Головна', path: homePath },
        { name: route.title, path: route.path }
    ]);
};

export function buildSeoHead(options = {}) {
    const seo = buildSeoData(options);
    const alternateTags = seo.alternates.map(item => (
        `<link rel="alternate" hreflang="${escapeHtml(item.hreflang)}" href="${escapeHtml(item.href)}" />`
    ));
    const ogLocaleAlternateTags = seo.alternates
        .filter(item => item.ogLocale && item.ogLocale !== seo.ogLocale)
        .map(item => `<meta property="og:locale:alternate" content="${escapeHtml(item.ogLocale)}" />`);
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
        `<meta property="og:locale" content="${escapeHtml(seo.ogLocale)}" />`,
        ...ogLocaleAlternateTags,
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
        `<meta name="twitter:image" content="${escapeHtml(seo.imageUrl)}" />`,
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
        ...alternateTags,
        ...jsonLdTags
    ].join('\n    ');
}

export function buildNoscriptFallback(options = {}) {
    const seo = buildSeoData(options);
    const routeLanguage = seo.path.split('/').filter(Boolean)[0];
    const language = LANGUAGES.some(item => item.code === routeLanguage) ? routeLanguage : null;
    const t = createTranslator(language || 'uk');
    const navPath = (pathToLocalize) => language ? localizePath(pathToLocalize, language) : pathToLocalize;

    return [
        '<noscript>',
        '<main>',
        `<h1>${escapeHtml(seo.title)}</h1>`,
        `<p>${escapeHtml(seo.description)}</p>`,
        '<nav>',
        `<a href="${navPath('/')}">${escapeHtml(t('nav.home'))}</a>`,
        `<a href="${navPath('/newconferences')}">${escapeHtml(t('nav.newConferences'))}</a>`,
        `<a href="${navPath('/pastconferences')}">${escapeHtml(t('nav.archive'))}</a>`,
        `<a href="${navPath('/requirements')}">${escapeHtml(t('seo.requirementsTitle'))}</a>`,
        `<a href="${navPath('/fees')}">${escapeHtml(t('seo.feesTitle'))}</a>`,
        '</nav>',
        '</main>',
        '</noscript>'
    ].join('');
}

const stripManagedHead = (head) => head
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|theme-color|twitter:[^"]+|og:[^"]+)"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="alternate"[^>]*>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json"[^>]*data-seo-json-ld="true"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

export function renderRouteHtml(template, options = {}) {
    const seo = buildSeoData(options);
    const withLang = template.replace(/<html([^>]*)lang="[^"]*"([^>]*)>/i, `<html$1lang="${escapeHtml(seo.locale)}"$2>`);
    const withHead = template.replace(/<head>([\s\S]*?)<\/head>/i, (match, headContent) => (
        `<head>${stripManagedHead(headContent).trim()}\n    ${buildSeoHead(options)}\n  </head>`
    ));

    return withHead.replace(/^<!doctype html><html[^>]*>/i, withLang.match(/^<!doctype html><html[^>]*>/i)?.[0] || '<!doctype html><html>').replace(
        /<div id="root"><\/div>/i,
        `<div id="root">${buildNoscriptFallback(options)}</div>`
    );
}

const outputPathForRoute = (distDir, routePath) => {
    if (routePath === '/') return path.join(distDir, 'index.html');
    return path.join(distDir, routePath.replace(/^\//, ''), 'index.html');
};

export async function prerenderSeo({ distDir = defaultDistDir } = {}) {
    const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
    const prerenderRoutes = [
        ...PUBLIC_ROUTES.map(route => route.path),
        ...PUBLIC_ROUTES.flatMap(route => LANGUAGES.map(language => localizePath(route.path, language.code)))
    ];

    await Promise.all(prerenderRoutes.map(async (routePath) => {
        const routeSeo = getPublicRouteSeo(routePath);
        const html = renderRouteHtml(template, {
            ...routeSeo,
            jsonLd: buildRouteJsonLd(routeSeo)
        });
        const outputPath = outputPathForRoute(distDir, routeSeo.path);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, html, 'utf8');
    }));

    await writeFile(path.join(distDir, 'robots.txt'), buildRobotsTxt(), 'utf8');
    await writeFile(path.join(distDir, 'sitemap.xml'), buildStaticSitemap(), 'utf8');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await prerenderSeo();
}
