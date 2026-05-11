const db = require('../db');
const archiver = require('archiver');

class ArticlesController {
    // User: submit a new article
    async submitArticle(req, res) {
        try {
            const { conference_id, title, section, udk_index, abstract, keywords } = req.body;
            const user_id = req.user.user_id;

            if (!req.files || !req.files.article) {
                return res.status(400).json({ message: 'Файл статті обов\'язковий' });
            }

            const { article } = req.files;
            const receipt = req.files.receipt || null;

            const keywordsArray = keywords ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : null;

            const result = await db.query(
                `INSERT INTO articles (user_id, conference_id, title, section, udk_index, abstract, keywords, file_data, file_name, payment_receipt, receipt_name)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING article_id, user_id, conference_id, title, section, udk_index, abstract, keywords, file_name, status, receipt_name, submitted_at`,
                [
                    user_id,
                    conference_id || null,
                    title,
                    section || null,
                    udk_index || null,
                    abstract || null,
                    keywordsArray,
                    article.data,
                    article.name,
                    receipt ? receipt.data : null,
                    receipt ? receipt.name : null
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error submitting article:', error.message);
            res.status(500).json({ message: 'Помилка при відправленні статті' });
        }
    }

    // User: get own articles
    async getMyArticles(req, res) {
        try {
            const result = await db.query(
                `SELECT a.article_id, a.title, a.section, a.status, a.admin_comment, a.file_name, a.receipt_name, a.submitted_at, a.updated_at,
                        COALESCE(c.title, ac.title) as conference_title
                 FROM articles a
                 LEFT JOIN new_conferences c ON a.conference_id = c.conference_id
                 LEFT JOIN archive_conferences ac ON a.conference_id = ac.conference_id
                 WHERE a.user_id = $1
                 ORDER BY a.submitted_at DESC`,
                [req.user.user_id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching user articles:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні статей' });
        }
    }

    // User: get single article
    async getArticleById(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query(
                `SELECT a.article_id, a.user_id, a.title, a.section, a.udk_index, a.abstract, a.keywords, a.file_name, a.status, a.admin_comment, a.receipt_name, a.submitted_at, a.updated_at,
                        COALESCE(c.title, ac.title) as conference_title, u.full_name as author_name, u.email as author_email
                 FROM articles a
                 LEFT JOIN new_conferences c ON a.conference_id = c.conference_id
                 LEFT JOIN archive_conferences ac ON a.conference_id = ac.conference_id
                 LEFT JOIN users u ON a.user_id = u.user_id
                 WHERE a.article_id = $1`,
                [id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Статтю не знайдено' });
            }

            // Users can only see their own articles; admins can see all
            if (req.user.role !== 'admin' && result.rows[0].user_id !== req.user.user_id) {
                return res.status(403).json({ message: 'Доступ заборонено' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching article:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні статті' });
        }
    }

    // User: download own article file
    async downloadArticle(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query(
                'SELECT file_data, file_name, user_id FROM articles WHERE article_id = $1',
                [id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Статтю не знайдено' });
            }

            if (req.user.role !== 'admin' && result.rows[0].user_id !== req.user.user_id) {
                return res.status(403).json({ message: 'Доступ заборонено' });
            }

            const article = result.rows[0];
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(article.file_name)}`);
            res.send(article.file_data);
        } catch (error) {
            console.error('Error downloading article:', error.message);
            res.status(500).json({ message: 'Помилка при завантаженні статті' });
        }
    }

    // Admin: download receipt file
    async downloadReceipt(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query(
                'SELECT payment_receipt, receipt_name FROM articles WHERE article_id = $1',
                [id]
            );

            if (!result.rows[0] || !result.rows[0].payment_receipt) {
                return res.status(404).json({ message: 'Квитанцію не знайдено' });
            }

            const article = result.rows[0];
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(article.receipt_name)}`);
            res.send(article.payment_receipt);
        } catch (error) {
            console.error('Error downloading receipt:', error.message);
            res.status(500).json({ message: 'Помилка при завантаженні квитанції' });
        }
    }

    // User: update/resubmit article
    async updateArticle(req, res) {
        try {
            const { id } = req.params;
            const { title, section, udk_index, abstract, keywords } = req.body;

            // Verify ownership
            const existing = await db.query('SELECT user_id, status FROM articles WHERE article_id = $1', [id]);
            if (!existing.rows[0]) {
                return res.status(404).json({ message: 'Статтю не знайдено' });
            }
            if (existing.rows[0].user_id !== req.user.user_id) {
                return res.status(403).json({ message: 'Доступ заборонено' });
            }

            const keywordsArray = keywords ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : null;

            let query, params;
            if (req.files && req.files.article) {
                const { article } = req.files;
                query = `UPDATE articles SET title = COALESCE($1, title), section = COALESCE($2, section), udk_index = COALESCE($3, udk_index),
                         abstract = COALESCE($4, abstract), keywords = COALESCE($5, keywords), file_data = $6, file_name = $7,
                         status = 'pending', updated_at = NOW() WHERE article_id = $8
                         RETURNING article_id, title, section, udk_index, abstract, keywords, file_name, status, submitted_at, updated_at`;
                params = [title, section, udk_index, abstract, keywordsArray, article.data, article.name, id];
            } else {
                query = `UPDATE articles SET title = COALESCE($1, title), section = COALESCE($2, section), udk_index = COALESCE($3, udk_index),
                         abstract = COALESCE($4, abstract), keywords = COALESCE($5, keywords),
                         status = 'pending', updated_at = NOW() WHERE article_id = $6
                         RETURNING article_id, title, section, udk_index, abstract, keywords, file_name, status, submitted_at, updated_at`;
                params = [title, section, udk_index, abstract, keywordsArray, id];
            }

            const result = await db.query(query, params);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating article:', error.message);
            res.status(500).json({ message: 'Помилка при оновленні статті' });
        }
    }

    // User: delete/withdraw article
    async deleteArticle(req, res) {
        try {
            const { id } = req.params;

            const existing = await db.query('SELECT user_id FROM articles WHERE article_id = $1', [id]);
            if (!existing.rows[0]) {
                return res.status(404).json({ message: 'Статтю не знайдено' });
            }
            if (existing.rows[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Доступ заборонено' });
            }

            await db.query('DELETE FROM articles WHERE article_id = $1', [id]);
            res.json({ message: 'Статтю видалено' });
        } catch (error) {
            console.error('Error deleting article:', error.message);
            res.status(500).json({ message: 'Помилка при видаленні статті' });
        }
    }

    // Admin: get all articles
    async getAllArticles(req, res) {
        try {
            const { status, conference_id, author, conference_date, submission_date, has_receipt } = req.query;
            let query = `SELECT a.article_id, a.title, a.section, a.status, a.file_name, a.receipt_name, a.submitted_at, a.updated_at,
                                u.full_name as author_name, u.email as author_email,
                                COALESCE(c.title, ac.title) as conference_title, COALESCE(c.timing, ac.timing) as conference_date
                         FROM articles a
                         LEFT JOIN users u ON a.user_id = u.user_id
                         LEFT JOIN new_conferences c ON a.conference_id = c.conference_id
                         LEFT JOIN archive_conferences ac ON a.conference_id = ac.conference_id`;
            
            const conditions = [];
            const params = [];

            if (status) {
                params.push(status);
                conditions.push(`a.status = $${params.length}`);
            }
            if (conference_id) {
                params.push(conference_id);
                conditions.push(`a.conference_id = $${params.length}`);
            }
            if (author) {
                params.push(`%${author}%`);
                conditions.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
            }
            if (conference_date) {
                params.push(conference_date);
                conditions.push(`(DATE(c.timing) = $${params.length} OR DATE(ac.timing) = $${params.length})`);
            }
            if (submission_date) {
                params.push(submission_date);
                conditions.push(`DATE(a.submitted_at) = $${params.length}`);
            }
            if (has_receipt === 'yes') {
                conditions.push(`a.receipt_name IS NOT NULL`);
            } else if (has_receipt === 'no') {
                conditions.push(`a.receipt_name IS NULL`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY a.submitted_at DESC';

            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching all articles:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні статей' });
        }
    }

    // Admin: review article (change status, add comment)
    async reviewArticle(req, res) {
        try {
            const { id } = req.params;
            const { status, admin_comment } = req.body;

            const validStatuses = ['pending', 'under_review', 'accepted', 'rejected', 'revision_needed'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Невірний статус' });
            }

            const result = await db.query(
                `UPDATE articles SET status = COALESCE($1, status), admin_comment = COALESCE($2, admin_comment), updated_at = NOW()
                 WHERE article_id = $3
                 RETURNING article_id, title, status, admin_comment, updated_at`,
                [status, admin_comment, id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Статтю не знайдено' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error reviewing article:', error.message);
            res.status(500).json({ message: 'Помилка при рецензуванні статті' });
        }
    }

    // Admin: download all articles matching filters as ZIP
    async downloadAllArticles(req, res) {
        try {
            const { status, conference_id, author, conference_date, submission_date, has_receipt } = req.query;
            let query = `SELECT a.article_id, a.file_data, a.file_name, u.full_name as author_name
                         FROM articles a
                         LEFT JOIN users u ON a.user_id = u.user_id
                         LEFT JOIN new_conferences c ON a.conference_id = c.conference_id
                         LEFT JOIN archive_conferences ac ON a.conference_id = ac.conference_id`;

            const conditions = [];
            const params = [];

            if (status) {
                params.push(status);
                conditions.push(`a.status = $${params.length}`);
            }
            if (conference_id) {
                params.push(conference_id);
                conditions.push(`a.conference_id = $${params.length}`);
            }
            if (author) {
                params.push(`%${author}%`);
                conditions.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
            }
            if (conference_date) {
                params.push(conference_date);
                conditions.push(`(DATE(c.timing) = $${params.length} OR DATE(ac.timing) = $${params.length})`);
            }
            if (submission_date) {
                params.push(submission_date);
                conditions.push(`DATE(a.submitted_at) = $${params.length}`);
            }
            if (has_receipt === 'yes') {
                conditions.push(`a.receipt_name IS NOT NULL`);
            } else if (has_receipt === 'no') {
                conditions.push(`a.receipt_name IS NULL`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY a.submitted_at DESC';

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Немає статей для завантаження' });
            }

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent('articles.zip')}`);

            const archive = archiver('zip', { zlib: { level: 5 } });
            archive.pipe(res);

            const usedNames = new Set();
            for (const row of result.rows) {
                let fileName = row.file_name || `article_${row.article_id}`;
                // Ensure unique file names inside the ZIP
                if (usedNames.has(fileName)) {
                    const ext = fileName.lastIndexOf('.') > 0 ? fileName.slice(fileName.lastIndexOf('.')) : '';
                    const base = fileName.lastIndexOf('.') > 0 ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
                    fileName = `${base}_${row.article_id}${ext}`;
                }
                usedNames.add(fileName);
                archive.append(row.file_data, { name: fileName });
            }

            await archive.finalize();
        } catch (error) {
            console.error('Error downloading all articles:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Помилка при завантаженні статей' });
            }
        }
    }
}

module.exports = new ArticlesController();
