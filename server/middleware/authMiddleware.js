const jwt = require('jsonwebtoken');
const db = require('../db');
const { AUTH_COOKIE_NAME, getJwtSecret } = require('../utils/security');

const parseCookies = (cookieHeader = '') => {
    return cookieHeader.split(';').reduce((cookies, part) => {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (!rawName) return cookies;
        cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
        return cookies;
    }, {});
};

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice('Bearer '.length);
    }
    const cookies = parseCookies(req.headers.cookie);
    return cookies[AUTH_COOKIE_NAME];
};

const loadUser = async (decoded) => {
    const result = await db.query(
        'SELECT user_id, email, role FROM users WHERE user_id = $1',
        [decoded.user_id]
    );
    return result.rows[0];
};

const authMiddleware = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'Необхідна авторизація' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        const user = await loadUser(decoded);
        if (!user) {
            return res.status(401).json({ message: 'Невірний або прострочений токен' });
        }

        req.user = { ...decoded, email: user.email, role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Невірний або прострочений токен' });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'Необхідна авторизація' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        const user = await loadUser(decoded);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ заборонено. Необхідні права адміністратора' });
        }

        req.user = { ...decoded, email: user.email, role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Невірний або прострочений токен' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
