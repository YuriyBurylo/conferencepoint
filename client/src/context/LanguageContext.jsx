import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
    getInitialLanguage,
    getLanguageMeta,
    isSupportedLanguage,
    LANGUAGES,
    STORAGE_KEY
} from '../i18n/languageDetection';
import { createTranslator } from '../i18n/translations';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => getInitialLanguage());

    const setLanguage = (nextLanguage) => {
        if (!isSupportedLanguage(nextLanguage)) return;
        setLanguageState(nextLanguage);
        try {
            window.localStorage?.setItem(STORAGE_KEY, nextLanguage);
        } catch {
            // Ignore storage failures; language still changes for the current session.
        }
    };

    const meta = getLanguageMeta(language);
    const t = useMemo(() => createTranslator(language), [language]);

    useEffect(() => {
        document.documentElement.lang = meta.locale;
    }, [meta.locale]);

    const value = useMemo(() => ({
        language,
        locale: meta.locale,
        ogLocale: meta.ogLocale,
        languages: LANGUAGES,
        setLanguage,
        t,
        formatDate(valueToFormat) {
            if (!valueToFormat) return '';
            return new Date(valueToFormat).toLocaleDateString(meta.locale);
        }
    }), [language, meta.locale, meta.ogLocale, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
