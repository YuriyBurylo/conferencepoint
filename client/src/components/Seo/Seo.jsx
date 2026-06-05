import { useEffect } from 'react';
import {
    buildSeoData,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    resolveLocalizedSeoPath
} from '../../utils/seo';
import { useLanguage } from '../../context/useLanguage';

const setMeta = (attribute, key, content) => {
    if (!content) return;

    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setLink = (rel, href) => {
    let element = document.head.querySelector(`link[rel="${rel}"]`);
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
};

const setAlternateLinks = (alternates = []) => {
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(element => element.remove());

    alternates.forEach(({ hreflang, href }) => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'alternate');
        element.setAttribute('hreflang', hreflang);
        element.setAttribute('href', href);
        document.head.appendChild(element);
    });
};

const setOgLocaleAlternates = (alternates = [], currentOgLocale) => {
    document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach(element => element.remove());

    alternates
        .filter(item => item.ogLocale && item.ogLocale !== currentOgLocale)
        .forEach(item => {
            const element = document.createElement('meta');
            element.setAttribute('property', 'og:locale:alternate');
            element.setAttribute('content', item.ogLocale);
            document.head.appendChild(element);
        });
};

const setJsonLd = (items) => {
    document.head.querySelectorAll('script[data-seo-json-ld]').forEach(element => element.remove());

    items.filter(Boolean).forEach(item => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoJsonLd = 'true';
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
    });
};

function Seo({
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image = DEFAULT_IMAGE,
    type = 'website',
    noindex = false,
    jsonLd = []
}) {
    const { ogLocale } = useLanguage();

    useEffect(() => {
        const seo = buildSeoData({
            title,
            description,
            path: resolveLocalizedSeoPath({
                explicitPath: path,
                currentPath: window.location.pathname
            }),
            image,
            type,
            noindex,
            jsonLd
        });

        document.title = seo.title;

        setMeta('name', 'description', seo.description);
        setMeta('name', 'robots', seo.robots);
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', seo.title);
        setMeta('name', 'twitter:description', seo.description);
        setMeta('name', 'twitter:image', seo.imageUrl);

        setMeta('property', 'og:site_name', 'Conference Point');
        setMeta('property', 'og:type', seo.type);
        setMeta('property', 'og:title', seo.title);
        setMeta('property', 'og:description', seo.description);
        setMeta('property', 'og:url', seo.canonicalUrl);
        setMeta('property', 'og:image', seo.imageUrl);
        setMeta('property', 'og:image:width', '1200');
        setMeta('property', 'og:image:height', '630');
        setMeta('property', 'og:locale', seo.ogLocale || ogLocale);

        setLink('canonical', seo.canonicalUrl);
        setAlternateLinks(seo.alternates);
        setOgLocaleAlternates(seo.alternates, seo.ogLocale || ogLocale);
        setJsonLd(seo.jsonLd);
    }, [description, image, jsonLd, noindex, ogLocale, path, title, type]);

    return null;
}

export default Seo;
