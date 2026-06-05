import { languagePathToCode, localizePath } from '../i18n/languageDetection.js';

export const buildConferenceShareUrl = (type, conferenceId, currentHref = window.location.href) => {
    const url = new URL(currentHref);
    const language = languagePathToCode(url.pathname);
    const path = type === 'archive'
        ? `/pastconferences/${conferenceId}`
        : `/newconferences/${conferenceId}`;
    url.pathname = language ? localizePath(path, language) : path;
    url.search = '';
    url.hash = '';
    return url.toString();
};

export const buildCurrentPageShareData = ({
    title = globalThis.document?.title || 'Conference Point',
    href = globalThis.location?.href || ''
} = {}) => ({
    title,
    url: href
});

export const buildTelegramShareUrl = ({ title, url }) => (
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
);

export const buildViberShareUrl = ({ title, url }) => (
    `viber://forward?text=${encodeURIComponent(`${title}\n${url}`)}`
);

export const buildWhatsAppShareUrl = ({ title, url }) => (
    `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`
);

export const buildXShareUrl = ({ title, url }) => (
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
);

export const buildFacebookShareUrl = ({ url }) => (
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
);

export const buildLinkedInShareUrl = ({ url }) => (
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
);

export const buildEmailShareUrl = ({ title, url }) => (
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${url}`)}`
);

export const buildGmailShareUrl = ({ title, url }) => (
    `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${url}`)}`
);

export const buildShareText = ({ title, url }) => `${title}\n${url}`;

export const buildShareTargets = ({ title, url }) => [
    { id: 'telegram', label: 'Telegram', href: buildTelegramShareUrl({ title, url }) },
    { id: 'viber', label: 'Viber', href: buildViberShareUrl({ title, url }) },
    { id: 'whatsapp', label: 'WhatsApp', href: buildWhatsAppShareUrl({ title, url }) },
    { id: 'facebook', label: 'Facebook', href: buildFacebookShareUrl({ url }) },
    { id: 'linkedin', label: 'LinkedIn', href: buildLinkedInShareUrl({ url }) },
    { id: 'x', label: 'X', href: buildXShareUrl({ title, url }) },
    { id: 'gmail', label: 'Gmail', href: buildGmailShareUrl({ title, url }) },
    { id: 'email', label: 'Email', href: buildEmailShareUrl({ title, url }) }
];

export const shareConference = async ({
    title,
    url,
    target,
    navigatorRef = globalThis.navigator,
    windowRef = globalThis.window
}) => {
    const text = buildShareText({ title, url });

    if (target === 'telegram') {
        windowRef?.open(buildTelegramShareUrl({ title, url }), '_blank', 'noopener,noreferrer');
        return 'telegram';
    }

    if (target === 'viber') {
        windowRef.location.href = buildViberShareUrl({ title, url });
        return 'viber';
    }

    if (navigatorRef?.share) {
        await navigatorRef.share({ title, text, url });
        return 'shared';
    }

    if (navigatorRef.clipboard?.writeText) {
        await navigatorRef.clipboard.writeText(text);
        return 'copied';
    }

    return 'unsupported';
};
