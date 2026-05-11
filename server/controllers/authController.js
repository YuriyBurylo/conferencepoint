const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

class AuthController {
    async register(req, res) {
        try {
            const { email, password, full_name, affiliation, scientific_degree, academic_title } = req.body;

            if (!email || !password || !full_name) {
                return res.status(400).json({ message: 'Email, пароль та повне ім\'я обов\'язкові' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Пароль має бути мінімум 6 символів' });
            }

            const existingUser = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ message: 'Користувач з таким email вже існує' });
            }

            const password_hash = await bcrypt.hash(password, 10);
            const result = await db.query(
                'INSERT INTO users (email, password_hash, full_name, affiliation, scientific_degree, academic_title) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, full_name, affiliation, scientific_degree, academic_title, role, created_at',
                [email, password_hash, full_name, affiliation || null, scientific_degree || null, academic_title || null]
            );

            const user = result.rows[0];
            const token = generateToken(user);

            res.status(201).json({ token, user });
        } catch (error) {
            console.error('Registration error:', error.message);
            res.status(500).json({ message: 'Помилка при реєстрації' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email та пароль обов\'язкові' });
            }

            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const token = generateToken(user);

            res.json({
                token,
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
            console.error('Login error:', error.message);
            res.status(500).json({ message: 'Помилка при вході' });
        }
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
            console.error('Get profile error:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні профілю' });
        }
    }

    async updateProfile(req, res) {
        try {
            const { full_name, affiliation, scientific_degree, academic_title } = req.body;
            const result = await db.query(
                'UPDATE users SET full_name = COALESCE($1, full_name), affiliation = COALESCE($2, affiliation), scientific_degree = COALESCE($3, scientific_degree), academic_title = COALESCE($4, academic_title), updated_at = NOW() WHERE user_id = $5 RETURNING user_id, email, full_name, affiliation, scientific_degree, academic_title, role',
                [full_name, affiliation, scientific_degree, academic_title, req.user.user_id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update profile error:', error.message);
            res.status(500).json({ message: 'Помилка при оновленні профілю' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const result = await db.query(
                'SELECT user_id, email, full_name, affiliation, scientific_degree, academic_title, role, created_at FROM users ORDER BY created_at DESC'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Get all users error:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні користувачів' });
        }
    }

    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Невірна роль' });
            }

            const result = await db.query(
                'UPDATE users SET role = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, email, full_name, role',
                [role, id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update role error:', error.message);
            res.status(500).json({ message: 'Помилка при оновленні ролі' });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            res.json({ message: 'Користувача видалено' });
        } catch (error) {
            console.error('Delete user error:', error.message);
            res.status(500).json({ message: 'Помилка при видаленні користувача' });
        }
    }
}

module.exports = new AuthController();
