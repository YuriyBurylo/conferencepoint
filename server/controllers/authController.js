const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auditAdminAction } = require('../utils/audit');
const {
    AUTH_COOKIE_NAME,
    JWT_EXPIRES_IN,
    getCookieOptions,
    getJwtSecret,
    normalizeEmail,
    validateEmail,
    validatePassword,
    validateText
} = require('../utils/security');

const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const setSessionCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

const clearSessionCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, { ...getCookieOptions(), maxAge: undefined });
};

const handleError = (res, error, fallbackMessage) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(fallbackMessage, error.message);
    return res.status(500).json({ message: fallbackMessage });
};

const PASSWORD_RESET_MESSAGE = 'If the email exists, password reset instructions have been created.';
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 60);

const hashResetToken = (token) => {
    return crypto.createHash('sha256').update(String(token || '')).digest('hex');
};

const buildResetUrl = (token) => {
    const siteUrl = (process.env.SITE_URL || process.env.CLIENT_ORIGINS?.split(',')[0] || '').trim().replace(/\/+$/, '');
    const path = `/reset-password?token=${encodeURIComponent(token)}`;
    return siteUrl ? `${siteUrl}${path}` : path;
};

class AuthController {
    async register(req, res) {
        try {
            const { email, password, full_name, affiliation, scientific_degree, academic_title } = req.body;

            const normalizedEmail = validateEmail(email);
            validatePassword(password);
            const fullName = validateText(full_name, 'Повне ім\'я', { required: true, max: 255 });
            const normalizedAffiliation = validateText(affiliation, 'Установа', { max: 255 });
            const normalizedScientificDegree = validateText(scientific_degree, 'Науковий ступінь', { max: 128 });
            const normalizedAcademicTitle = validateText(academic_title, 'Вчене звання', { max: 128 });

            const existingUser = await db.query('SELECT user_id FROM users WHERE email = $1', [normalizedEmail]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ message: 'Користувач з таким email вже існує' });
            }

            const password_hash = await bcrypt.hash(password, 12);
            const result = await db.query(
                'INSERT INTO users (email, password_hash, full_name, affiliation, scientific_degree, academic_title) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, full_name, affiliation, scientific_degree, academic_title, role, created_at',
                [normalizedEmail, password_hash, fullName, normalizedAffiliation, normalizedScientificDegree, normalizedAcademicTitle]
            );

            const user = result.rows[0];
            const token = generateToken(user);
            setSessionCookie(res, token);

            res.status(201).json({ user });
        } catch (error) {
            return handleError(res, error, 'Помилка при реєстрації');
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email та пароль обов\'язкові' });
            }

            const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizeEmail(email)]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const token = generateToken(user);
            setSessionCookie(res, token);

            res.json({
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    full_name: user.full_name,
                    affiliation: user.affiliation,
                    scientific_degree: user.scientific_degree,
                    academic_title: user.academic_title,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            return handleError(res, error, 'Помилка при вході');
        }
    }

    async logout(req, res) {
        clearSessionCookie(res);
        res.json({ message: 'Вихід виконано' });
    }

    async getProfile(req, res) {
        try {
            const result = await db.query(
                'SELECT user_id, email, full_name, affiliation, scientific_degree, academic_title, role, created_at FROM users WHERE user_id = $1',
                [req.user.user_id]
            );
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            res.json(user);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні профілю');
        }
    }

    async updateProfile(req, res) {
        try {
            const { full_name, affiliation, scientific_degree, academic_title } = req.body;
            const fullName = validateText(full_name, 'Повне ім\'я', { max: 255 });
            const normalizedAffiliation = validateText(affiliation, 'Установа', { max: 255 });
            const normalizedScientificDegree = validateText(scientific_degree, 'Науковий ступінь', { max: 128 });
            const normalizedAcademicTitle = validateText(academic_title, 'Вчене звання', { max: 128 });
            const result = await db.query(
                'UPDATE users SET full_name = COALESCE($1, full_name), affiliation = COALESCE($2, affiliation), scientific_degree = COALESCE($3, scientific_degree), academic_title = COALESCE($4, academic_title), updated_at = NOW() WHERE user_id = $5 RETURNING user_id, email, full_name, affiliation, scientific_degree, academic_title, role',
                [fullName, normalizedAffiliation, normalizedScientificDegree, normalizedAcademicTitle, req.user.user_id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при оновленні профілю');
        }
    }

    async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;
            if (!current_password || !new_password) {
                return res.status(400).json({ message: 'Current password and new password are required' });
            }

            validatePassword(new_password);

            const result = await db.query(
                'SELECT user_id, password_hash FROM users WHERE user_id = $1',
                [req.user.user_id]
            );
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            const password_hash = await bcrypt.hash(new_password, 12);
            await db.query(
                'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id',
                [password_hash, req.user.user_id]
            );
            await db.query(
                'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
                [req.user.user_id]
            );

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            return handleError(res, error, 'Error changing password');
        }
    }

    async requestPasswordReset(req, res) {
        try {
            const normalizedEmail = validateEmail(req.body.email);
            const result = await db.query(
                'SELECT user_id, email FROM users WHERE email = $1',
                [normalizedEmail]
            );
            const response = { message: PASSWORD_RESET_MESSAGE };
            const user = result.rows[0];

            if (user) {
                const token = crypto.randomBytes(32).toString('hex');
                const tokenHash = hashResetToken(token);

                await db.query(
                    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + ($3::int * INTERVAL \'1 minute\')) RETURNING reset_id',
                    [user.user_id, tokenHash, PASSWORD_RESET_TTL_MINUTES]
                );

                const resetUrl = buildResetUrl(token);
                console.info(`Password reset requested for ${user.email}: ${resetUrl}`);

                if (process.env.PASSWORD_RESET_EXPOSE_TOKEN === 'true') {
                    response.reset_token = token;
                    response.reset_url = resetUrl;
                }
            }

            res.json(response);
        } catch (error) {
            return handleError(res, error, 'Error requesting password reset');
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ message: 'Reset token and password are required' });
            }

            validatePassword(password);

            const tokenHash = hashResetToken(token);
            const tokenResult = await db.query(
                'SELECT reset_id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                [tokenHash]
            );
            const resetToken = tokenResult.rows[0];

            if (!resetToken) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const password_hash = await bcrypt.hash(password, 12);
            await db.query(
                'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id',
                [password_hash, resetToken.user_id]
            );
            await db.query(
                'UPDATE password_reset_tokens SET used_at = NOW() WHERE reset_id = $1 RETURNING reset_id',
                [resetToken.reset_id]
            );

            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            return handleError(res, error, 'Error resetting password');
        }
    }

    async getAllUsers(req, res) {
        try {
            const result = await db.query(
                'SELECT user_id, email, full_name, affiliation, scientific_degree, academic_title, role, created_at FROM users ORDER BY created_at DESC'
            );
            res.json(result.rows);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні користувачів');
        }
    }

    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const userId = Number(id);

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Невірна роль' });
            }
            if (userId === req.user.user_id && role !== 'admin') {
                return res.status(400).json({ message: 'Не можна змінити власну роль адміністратора' });
            }

            const result = await db.query(
                'UPDATE users SET role = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, email, full_name, role',
                [role, userId]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            await auditAdminAction(db, {
                adminUserId: req.user.user_id,
                action: 'update_user_role',
                targetUserId: userId,
                details: { role }
            });

            res.json(result.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при оновленні ролі');
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userId = Number(id);
            if (userId === req.user.user_id) {
                return res.status(400).json({ message: 'Не можна видалити власний акаунт адміністратора' });
            }

            const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            await auditAdminAction(db, {
                adminUserId: req.user.user_id,
                action: 'delete_user',
                targetUserId: userId
            });

            res.json({ message: 'Користувача видалено' });
        } catch (error) {
            return handleError(res, error, 'Помилка при видаленні користувача');
        }
    }
}

module.exports = new AuthController();
