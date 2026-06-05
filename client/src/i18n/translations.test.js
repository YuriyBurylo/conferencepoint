import assert from 'node:assert/strict';
import { adminUiTranslations, createTranslator, sourceTranslations, translations } from './translations.js';

const en = createTranslator('en');
const fr = createTranslator('fr');
const ja = createTranslator('ja');
const hi = createTranslator('hi');
const unknown = createTranslator('xx');

assert.equal(en('nav.home'), 'Home');
assert.equal(fr('nav.home'), 'Accueil');
assert.equal(ja('nav.home'), 'ホーム');
assert.equal(ja('auth.loginButton'), 'ログイン');
assert.notEqual(ja('seo.requirementsDescription'), en('seo.requirementsDescription'));
assert.equal(hi('nav.home'), 'मुख्य पृष्ठ');
assert.equal(hi('auth.loginButton'), 'लॉग इन');
assert.notEqual(hi('seo.requirementsDescription'), en('seo.requirementsDescription'));
assert.equal(en('submit.stepCounter', { step: 2, total: 4 }), 'Step 2 of 4');
assert.equal(unknown('nav.home'), 'Home');
assert.equal(en('missing.key'), 'missing.key');

const adminPanelKeys = [
    ...Object.keys(translations.en).filter(key => key.startsWith('admin.')),
    'common.loading',
    'common.download',
    'common.save',
    'common.cancel',
    'common.delete',
    'common.edit',
    'common.create',
    'common.review',
    'common.actions',
    'common.status',
    'common.title',
    'common.city',
    'common.country',
    'common.date',
    'common.found',
    'common.total',
    'profile.administrator',
    'profile.user',
    'status.pending',
    'status.under_review',
    'status.accepted',
    'status.rejected',
    'status.revision_needed',
    'status.all'
];

const representativeAdminKeys = [
    'admin.dashboardTitle',
    'admin.manageUsers',
    'admin.manageArticles',
    'admin.manageConferences',
    'admin.downloadAll',
    'admin.noArticlesToDownload',
    'admin.moveConfirm',
    'common.download',
    'profile.user',
    'status.pending'
];

const requirementsPaymentKeys = Object.keys(translations.en).filter(key => (
    key.startsWith('requirements.') || key.startsWith('fees.')
));

const representativePublicContentKeys = [
    'requirements.invite',
    'requirements.fieldsTitle',
    'requirements.sections',
    'requirements.format',
    'requirements.howTo',
    'requirements.paper',
    'fees.amount',
    'fees.bank',
    'fees.paymentPurposeValue'
];

for (const language of ['uk', 'ru', 'de', 'fr', 'es', 'pt', 'zh', 'ja', 'hi']) {
    const t = createTranslator(language);
    const explicitTranslations = language === 'uk'
        ? sourceTranslations.uk
        : { ...sourceTranslations[language], ...adminUiTranslations[language] };

    const missingAdminKeys = adminPanelKeys.filter(key => !(key in explicitTranslations));
    assert.deepEqual(missingAdminKeys, [], `${language} is missing explicit admin translations`);

    for (const key of adminPanelKeys) {
        assert.notEqual(t(key, { count: 2, title: 'Article', name: 'User', email: 'user@example.com' }), key, `${language} shows raw key for ${key}`);
    }

    for (const key of representativeAdminKeys) {
        assert.notEqual(t(key, { count: 2, title: 'Article', name: 'User', email: 'user@example.com' }), en(key, { count: 2, title: 'Article', name: 'User', email: 'user@example.com' }), `${language} falls back to English for ${key}`);
    }

    const missingPublicContentKeys = requirementsPaymentKeys.filter(key => !(key in sourceTranslations[language]));
    assert.deepEqual(missingPublicContentKeys, [], `${language} is missing explicit requirements/payment translations`);

    for (const key of representativePublicContentKeys) {
        assert.notDeepEqual(t(key), en(key), `${language} falls back to English for ${key}`);
    }
}

console.log('translation tests passed');
