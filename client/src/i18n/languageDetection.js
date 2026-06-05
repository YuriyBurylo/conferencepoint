export const STORAGE_KEY = 'conferencepoint-language';

export const LANGUAGES = [
    { code: 'uk', label: 'Українська', shortLabel: 'UA', locale: 'uk-UA', ogLocale: 'uk_UA' },
    { code: 'ru', label: 'Русский', shortLabel: 'RU', locale: 'ru-RU', ogLocale: 'ru_RU' },
    { code: 'en', label: 'English', shortLabel: 'EN', locale: 'en-US', ogLocale: 'en_US' },
    { code: 'de', label: 'Deutsch', shortLabel: 'DE', locale: 'de-DE', ogLocale: 'de_DE' },
    { code: 'fr', label: 'Français', shortLabel: 'FR', locale: 'fr-FR', ogLocale: 'fr_FR' },
    { code: 'es', label: 'Español', shortLabel: 'ES', locale: 'es-ES', ogLocale: 'es_ES' },
    { code: 'pt', label: 'Português', shortLabel: 'PT', locale: 'pt-PT', ogLocale: 'pt_PT' },
    { code: 'zh', label: '中文', shortLabel: '中文', locale: 'zh-CN', ogLocale: 'zh_CN' },
    { code: 'ja', label: '日本語', shortLabel: 'JA', locale: 'ja-JP', ogLocale: 'ja_JP' },
    { code: 'hi', label: 'हिन्दी', shortLabel: 'HI', locale: 'hi-IN', ogLocale: 'hi_IN' }
];

const supportedCodes = new Set(LANGUAGES.map(language => language.code));
const cyrillicFallbackCountries = new Set(['RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'AM', 'AZ', 'MD', 'TM']);
const chineseRegions = new Set(['CN', 'HK', 'MO', 'TW', 'SG']);

const countryLanguageMap = new Map([
    ['UA', 'uk'],
    ['DE', 'de'],
    ['AT', 'de'],
    ['CH', 'de'],
    ['FR', 'fr'],
    ['BE', 'fr'],
    ['MC', 'fr'],
    ['ES', 'es'],
    ['MX', 'es'],
    ['AR', 'es'],
    ['CL', 'es'],
    ['CO', 'es'],
    ['PE', 'es'],
    ['PT', 'pt'],
    ['BR', 'pt'],
    ['AO', 'pt'],
    ['MZ', 'pt'],
    ['JP', 'ja'],
    ['IN', 'hi'],
    ['GB', 'en'],
    ['IE', 'en'],
    ['US', 'en'],
    ['CA', 'en'],
    ['AU', 'en'],
    ['NZ', 'en']
]);

const timezoneLanguageMap = new Map([
    ['Europe/Kyiv', 'uk'],
    ['Europe/Kiev', 'uk'],
    ['Europe/Paris', 'fr'],
    ['Europe/Berlin', 'de'],
    ['Europe/Vienna', 'de'],
    ['Europe/Zurich', 'de'],
    ['Europe/Madrid', 'es'],
    ['Atlantic/Canary', 'es'],
    ['Europe/Lisbon', 'pt'],
    ['America/Sao_Paulo', 'pt'],
    ['Asia/Shanghai', 'zh'],
    ['Asia/Hong_Kong', 'zh'],
    ['Asia/Macau', 'zh'],
    ['Asia/Taipei', 'zh'],
    ['Asia/Tokyo', 'ja'],
    ['Asia/Kolkata', 'hi'],
    ['Asia/Calcutta', 'hi'],
    ['Europe/Moscow', 'ru'],
    ['Europe/Minsk', 'ru'],
    ['Europe/Chisinau', 'ru'],
    ['Asia/Almaty', 'ru'],
    ['Asia/Aqtau', 'ru'],
    ['Asia/Aqtobe', 'ru'],
    ['Asia/Ashgabat', 'ru'],
    ['Asia/Baku', 'ru'],
    ['Asia/Bishkek', 'ru'],
    ['Asia/Dushanbe', 'ru'],
    ['Asia/Samarkand', 'ru'],
    ['Asia/Tashkent', 'ru'],
    ['Asia/Yerevan', 'ru']
]);

export function isSupportedLanguage(code) {
    return supportedCodes.has(code);
}

export function getLanguageMeta(code) {
    return LANGUAGES.find(language => language.code === code) || LANGUAGES.find(language => language.code === 'en');
}

export function countryToLanguage(countryCode) {
    const country = String(countryCode || '').trim().toUpperCase();
    if (!country) return null;
    if (chineseRegions.has(country)) return 'zh';
    if (cyrillicFallbackCountries.has(country)) return 'ru';
    return countryLanguageMap.get(country) || 'en';
}

export function languageTagToCode(languageTag) {
    const tag = String(languageTag || '').trim().toLowerCase();
    if (!tag) return null;
    const primary = tag.split('-')[0];
    return supportedCodes.has(primary) ? primary : null;
}

export function languagePathToCode(pathname) {
    const firstSegment = String(pathname || '')
        .split('#')[0]
        .split('?')[0]
        .split('/')
        .filter(Boolean)[0];
    return supportedCodes.has(firstSegment) ? firstSegment : null;
}

export function stripLanguageFromPath(pathname) {
    const cleanPath = String(pathname || '/').split('#')[0].split('?')[0] || '/';
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    const parts = normalizedPath.split('/').filter(Boolean);

    if (!supportedCodes.has(parts[0])) {
        return normalizedPath.replace(/\/+$/, '') || '/';
    }

    const stripped = parts.slice(1).join('/');
    return stripped ? `/${stripped}` : '/';
}

export function localizePath(pathname, language) {
    const basePath = stripLanguageFromPath(pathname);
    if (!isSupportedLanguage(language)) return basePath;
    return basePath === '/' ? `/${language}` : `/${language}${basePath}`;
}

export function timeZoneToLanguage(timeZone) {
    return timezoneLanguageMap.get(String(timeZone || '').trim()) || null;
}

export function detectLanguage({
    pathLanguage,
    savedLanguage,
    countryCode,
    timeZone,
    navigatorLanguages = []
} = {}) {
    if (isSupportedLanguage(pathLanguage)) return pathLanguage;
    if (isSupportedLanguage(savedLanguage)) return savedLanguage;

    const countryLanguage = countryToLanguage(countryCode);
    if (countryLanguage) return countryLanguage;

    const timezoneLanguage = timeZoneToLanguage(timeZone);
    if (timezoneLanguage) return timezoneLanguage;

    for (const tag of navigatorLanguages) {
        const language = languageTagToCode(tag);
        if (language) return language;
    }

    return 'en';
}

const readSavedLanguage = () => {
    try {
        return window.localStorage?.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const readCountryCode = () => {
    if (typeof window === 'undefined') return null;
    return window.__COUNTRY_CODE__
        || document.querySelector('meta[name="x-country-code"]')?.getAttribute('content')
        || import.meta.env?.VITE_COUNTRY_CODE
        || null;
};

const readTimeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return null;
    }
};

export function getInitialLanguage() {
    if (typeof window === 'undefined') return 'en';

    return detectLanguage({
        pathLanguage: languagePathToCode(window.location?.pathname),
        savedLanguage: readSavedLanguage(),
        countryCode: readCountryCode(),
        timeZone: readTimeZone(),
        navigatorLanguages: navigator.languages || [navigator.language]
    });
}
