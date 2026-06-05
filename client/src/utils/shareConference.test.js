import assert from 'node:assert';
import {
    buildConferenceShareUrl,
    buildCurrentPageShareData,
    buildEmailShareUrl,
    buildFacebookShareUrl,
    buildGmailShareUrl,
    buildLinkedInShareUrl,
    buildShareText,
    buildShareTargets,
    buildTelegramShareUrl,
    buildViberShareUrl,
    buildWhatsAppShareUrl,
    buildXShareUrl,
    shareConference
} from './shareConference.js';

assert.strictEqual(
    buildConferenceShareUrl('new', 12, 'https://conference.test/current'),
    'https://conference.test/newconferences/12'
);

assert.strictEqual(
    buildConferenceShareUrl('new', 12, 'https://conference.test/ja/newconferences'),
    'https://conference.test/ja/newconferences/12'
);

assert.strictEqual(
    buildConferenceShareUrl('archive', 8, 'https://conference.test/current'),
    'https://conference.test/pastconferences/8'
);

assert.deepStrictEqual(
    buildCurrentPageShareData({
        title: 'Conference Point',
        href: 'https://conference.test/newconferences/12?x=1'
    }),
    {
        title: 'Conference Point',
        url: 'https://conference.test/newconferences/12?x=1'
    }
);

assert.strictEqual(
    buildTelegramShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'https://t.me/share/url?url=https%3A%2F%2Fconference.test%2Fnewconferences%2F12&text=Conference%20title'
);

assert.strictEqual(
    buildViberShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'viber://forward?text=Conference%20title%0Ahttps%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildWhatsAppShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'https://api.whatsapp.com/send?text=Conference%20title%0Ahttps%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildXShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'https://twitter.com/intent/tweet?text=Conference%20title&url=https%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildFacebookShareUrl({ url: 'https://conference.test/newconferences/12' }),
    'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildLinkedInShareUrl({ url: 'https://conference.test/newconferences/12' }),
    'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildEmailShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'mailto:?subject=Conference%20title&body=Conference%20title%0Ahttps%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildGmailShareUrl({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'https://mail.google.com/mail/?view=cm&fs=1&su=Conference%20title&body=Conference%20title%0Ahttps%3A%2F%2Fconference.test%2Fnewconferences%2F12'
);

assert.strictEqual(
    buildShareText({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }),
    'Conference title\nhttps://conference.test/newconferences/12'
);

assert.deepStrictEqual(
    buildShareTargets({
        title: 'Conference title',
        url: 'https://conference.test/newconferences/12'
    }).map(item => item.label),
    ['Telegram', 'Viber', 'WhatsApp', 'Facebook', 'LinkedIn', 'X', 'Gmail', 'Email']
);

const nativeShares = [];
await shareConference({
    title: 'Conference title',
    url: 'https://conference.test/newconferences/12',
    navigatorRef: {
        share: async (payload) => nativeShares.push(payload)
    }
});

assert.deepStrictEqual(nativeShares, [{
    title: 'Conference title',
    text: 'Conference title\nhttps://conference.test/newconferences/12',
    url: 'https://conference.test/newconferences/12'
}]);

const copied = [];
await shareConference({
    title: 'Conference title',
    url: 'https://conference.test/newconferences/12',
    navigatorRef: {
        clipboard: {
            writeText: async (value) => copied.push(value)
        }
    }
});

assert.deepStrictEqual(copied, ['Conference title\nhttps://conference.test/newconferences/12']);

console.log('share conference tests passed');
