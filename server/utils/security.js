const path = require('path');

const MB = 1024 * 1024;
const MAX_JSON_BODY = '256kb';
const MAX_UPLOAD_BYTES = 20 * MB;
const ARTICLE_MAX_BYTES = 20 * MB;
const PDF_MAX_BYTES = 10 * MB;
const AUTH_COOKIE_NAME = 'conferencepoint_session';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const JWT_COOKIE_MAX_AGE_MS = Number(process.env.JWT_COOKIE_MAX_AGE_MS || 2 * 60 * 60 * 1000);
const PASSWORD_MIN_LENGTH = 10;

class RequestValidationError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'RequestValidationError';
        this.statusCode = statusCode;
    }
}

const normalizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
};

const validateEmail = (email) => {
    const normalized = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 255) {
        throw new RequestValidationError('Некоректний email');
    }
    return normalized;
};

const validatePassword = (password) => {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        throw new RequestValidationError(`Пароль має бути мінімум ${PASSWORD_MIN_LENGTH} символів`);
    }
    if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(password) || !/\d/.test(password)) {
        throw new RequestValidationError('Пароль має містити літери та цифри');
    }
    return password;
};

const validateText = (value, fieldName, { required = false, max = 255 } = {}) => {
    if (value === undefined || value === null || value === '') {
        if (required) throw new RequestValidationError(`${fieldName} обов'язкове`);
        return null;
    }
    if (typeof value !== 'string') {
        throw new RequestValidationError(`${fieldName} має бути текстом`);
    }
    const trimmed = value.trim();
    if (required && !trimmed) {
        throw new RequestValidationError(`${fieldName} обов'язкове`);
    }
    if (trimmed.length > max) {
        throw new RequestValidationError(`${fieldName} занадто довге`);
    }
    return trimmed || null;
};

const parsePositiveInteger = (value, fieldName, { required = false } = {}) => {
    if (value === undefined || value === null || value === '') {
        if (required) throw new RequestValidationError(`${fieldName} обов'язкове`);
        return null;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new RequestValidationError(`${fieldName} має бути числом`);
    }
    return parsed;
};

const sanitizeFileName = (fileName, fallback = 'file') => {
    if (typeof fileName !== 'string') return fallback;
    const baseName = fileName.split(/[\\/]+/).filter(Boolean).pop() || fallback;
    const sanitized = baseName
        .replace(/[\x00-\x1f\x7f<>:"/\\|*?]+/g, '_')
        .replace(/\s+/g, ' ')
        .replace(/^\.+/, '')
        .trim()
        .slice(0, 160);
    return sanitized || fallback;
};

const getExtension = (fileName) => path.extname(fileName || '').toLowerCase();

const startsWith = (buffer, signature) => {
    if (!Buffer.isBuffer(buffer)) return false;
    return buffer.slice(0, signature.length).equals(Buffer.from(signature, 'binary'));
};

const isDocx = (buffer) => startsWith(buffer, 'PK\x03\x04');
const isDoc = (buffer) => startsWith(buffer, '\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1');
const isPdf = (buffer) => Buffer.isBuffer(buffer) && buffer.slice(0, 5).toString('latin1') === '%PDF-';

const validateUploadedFile = (file, rules) => {
    if (!file || Array.isArray(file)) {
        throw new RequestValidationError('Некоректний файл');
    }

    const name = sanitizeFileName(file.name);
    const extension = getExtension(name);
    const size = Number(file.size || file.data?.length || 0);
    const mimetype = String(file.mimetype || '').split(';')[0].toLowerCase();
    const data = file.data;

    if (!rules.allowedExtensions.includes(extension)) {
        throw new RequestValidationError('Недозволений тип файлу');
    }
    if (!size || size > rules.maxSize) {
        throw new RequestValidationError(`Файл перевищує дозволений розмір ${Math.floor(rules.maxSize / MB)} MB`);
    }
    if (rules.allowedMimeTypes?.length) {
        const allowedMime = rules.allowedMimeTypes.includes(mimetype);
        const allowedOctet = rules.allowOctetStream && mimetype === 'application/octet-stream';
        if (mimetype && !allowedMime && !allowedOctet) {
            throw new RequestValidationError('Недозволений тип файлу');
        }
    }
    if (extension === '.pdf' && rules.requirePdfSignature && !isPdf(data)) {
        throw new RequestValidationError('PDF файл пошкоджений або має некоректний формат');
    }
    if (extension === '.docx' && !isDocx(data)) {
        throw new RequestValidationError('DOCX файл має некоректний формат');
    }
    if (extension === '.doc' && !isDoc(data)) {
        throw new RequestValidationError('DOC файл має некоректний формат');
    }

    return { ...file, name };
};

const validateArticleFile = (file) => validateUploadedFile(file, {
    allowedExtensions: ['.doc', '.docx', '.pdf'],
    allowedMimeTypes: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ],
    allowOctetStream: true,
    maxSize: ARTICLE_MAX_BYTES,
    requirePdfSignature: true
});

const validatePdfFile = (file) => validateUploadedFile(file, {
    allowedExtensions: ['.pdf'],
    allowedMimeTypes: ['application/pdf'],
    allowOctetStream: true,
    maxSize: PDF_MAX_BYTES,
    requirePdfSignature: true
});

const buildAllowedOrigins = (value = '') => {
    const configured = value
        .split(',')
        .map(origin => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    return new Set(configured);
};

const createCorsOptions = () => {
    const origins = buildAllowedOrigins(
        process.env.CLIENT_ORIGINS ||
        process.env.CLIENT_ORIGIN ||
        'http://localhost:5173,https://conferencepoint.online'
    );

    return {
        credentials: true,
        origin(origin, callback) {
            if (!origin || origins.has(origin.replace(/\/+$/, ''))) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'));
        }
    };
};

const securityHeaders = (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
};

const createRateLimit = ({ windowMs, max, message }) => {
    const hits = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const bucket = hits.get(ip) || { count: 0, resetAt: now + windowMs };

        if (bucket.resetAt <= now) {
            bucket.count = 0;
            bucket.resetAt = now + windowMs;
        }

        bucket.count += 1;
        hits.set(ip, bucket);

        if (bucket.count > max) {
            return res.status(429).json({ message });
        }

        if (hits.size > 10000) {
            for (const [key, value] of hits.entries()) {
                if (value.resetAt <= now) hits.delete(key);
            }
        }

        return next();
    };
};

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge: JWT_COOKIE_MAX_AGE_MS,
    path: '/'
});

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be set to a strong value of at least 32 characters');
    }
    if (/change_in_production/i.test(secret) || secret === 'conferencepoint_secret_key_change_in_production') {
        throw new Error('JWT_SECRET must be set to a strong non-default value');
    }
    return secret;
};

module.exports = {
    ARTICLE_MAX_BYTES,
    AUTH_COOKIE_NAME,
    JWT_EXPIRES_IN,
    MAX_JSON_BODY,
    MAX_UPLOAD_BYTES,
    PDF_MAX_BYTES,
    PASSWORD_MIN_LENGTH,
    RequestValidationError,
    buildAllowedOrigins,
    createCorsOptions,
    createRateLimit,
    getCookieOptions,
    getJwtSecret,
    normalizeEmail,
    parsePositiveInteger,
    sanitizeFileName,
    securityHeaders,
    validateArticleFile,
    validateEmail,
    validatePassword,
    validatePdfFile,
    validateText,
    validateUploadedFile
};
