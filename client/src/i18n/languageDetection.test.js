import assert from 'node:assert/strict';
import {
    LANGUAGES,
    countryToLanguage,
    detectLanguage,
    languagePathToCode,
    languageTagToCode,
    localizePath,
    stripLanguageFromPath,
    timeZoneToLanguage
} from './languageDetection.js';

assert.ok(LANGUAGES.some(language => language.code === 'ja'));
assert.ok(LANGUAGES.some(language => language.code === 'hi'));

assert.equal(countryToLanguage('UA'), 'uk');
assert.equal(countryToLanguage('FR'), 'fr');
assert.equal(countryToLanguage('DE'), 'de');
assert.equal(countryToLanguage('ES'), 'es');
assert.equal(countryToLanguage('BR'), 'pt');
assert.equal(countryToLanguage('CN'), 'zh');
assert.equal(countryToLanguage('JP'), 'ja');
assert.equal(countryToLanguage('IN'), 'hi');
assert.equal(countryToLanguage('KZ'), 'ru');
assert.equal(countryToLanguage('US'), 'en');

assert.equal(languageTagToCode('fr-FR'), 'fr');
assert.equal(languageTagToCode('pt-BR'), 'pt');
assert.equal(languageTagToCode('zh-Hans-CN'), 'zh');
assert.equal(languageTagToCode('ja-JP'), 'ja');
assert.equal(languageTagToCode('hi-IN'), 'hi');
assert.equal(languageTagToCode('it-IT'), null);

assert.equal(timeZoneToLanguage('Europe/Kyiv'), 'uk');
assert.equal(timeZoneToLanguage('Europe/Paris'), 'fr');
assert.equal(timeZoneToLanguage('Asia/Tokyo'), 'ja');
assert.equal(timeZoneToLanguage('Asia/Kolkata'), 'hi');
assert.equal(timeZoneToLanguage('Asia/Almaty'), 'ru');
assert.equal(timeZoneToLanguage('America/New_York'), null);

assert.equal(languagePathToCode('/ja/requirements'), 'ja');
assert.equal(languagePathToCode('/hi'), 'hi');
assert.equal(languagePathToCode('/requirements'), null);
assert.equal(stripLanguageFromPath('/ja/requirements'), '/requirements');
assert.equal(stripLanguageFromPath('/hi'), '/');
assert.equal(localizePath('/requirements', 'ja'), '/ja/requirements');
assert.equal(localizePath('/hi/requirements', 'en'), '/en/requirements');

assert.equal(detectLanguage({ savedLanguage: 'de', countryCode: 'FR' }), 'de');
assert.equal(detectLanguage({ pathLanguage: 'ja', savedLanguage: 'de', countryCode: 'FR' }), 'ja');
assert.equal(detectLanguage({ countryCode: 'FR', navigatorLanguages: ['en-US'] }), 'fr');
assert.equal(detectLanguage({ countryCode: 'JP', navigatorLanguages: ['en-US'] }), 'ja');
assert.equal(detectLanguage({ countryCode: 'IN', navigatorLanguages: ['en-US'] }), 'hi');
assert.equal(detectLanguage({ timeZone: 'Europe/Paris', navigatorLanguages: ['en-US'] }), 'fr');
assert.equal(detectLanguage({ navigatorLanguages: ['es-MX', 'en-US'] }), 'es');
assert.equal(detectLanguage({ navigatorLanguages: ['ja-JP', 'en-US'] }), 'ja');
assert.equal(detectLanguage({ navigatorLanguages: ['hi-IN', 'en-US'] }), 'hi');
assert.equal(detectLanguage({ navigatorLanguages: ['it-IT'] }), 'en');

console.log('language detection tests passed');
