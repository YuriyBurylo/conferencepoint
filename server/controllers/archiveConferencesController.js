const db = require('../db');
const { parsePositiveInteger, validatePdfFile, validateText } = require('../utils/security');

const handleError = (res, error, fallbackMessage) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(fallbackMessage, error.message);
    return res.status(500).json({ message: fallbackMessage });
};

const normalizeParticipants = (participants) => {
    if (!participants) return null;
    if (Array.isArray(participants)) return participants;
    return participants.split(',').map(item => item.trim()).filter(Boolean);
};

const normalizeConferencePayload = (body) => ({
    conference_status: validateText(body.conference_status, 'Статус конференції', { max: 128 }),
    title: validateText(body.title, 'Назва конференції', { required: true, max: 500 }),
    venue: validateText(body.venue, 'Місто', { max: 128 }),
    country: validateText(body.country, 'Країна', { max: 128 }),
    timing: validateText(body.timing, 'Дата конференції', { required: true, max: 32 }),
    participants: normalizeParticipants(body.participants)
});

class ArchiveConferencesController {
    async createConference(req, res) {
        try {
            const { conference_status, title, venue, country, timing, participants } = normalizeConferencePayload(req.body);

            if (!req.files || !req.files.textpdf) {
                return res.status(400).json({ message: 'Файл матеріалів обов\'язковий' });
            }

            const textpdf = validatePdfFile(req.files.textpdf);
            const conference = await db.query(
                'INSERT INTO archive_conferences (conference_status, title, venue, country, timing, participants, textpdf, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING conference_id, conference_status, title, venue, country, timing, participants, is_published',
                [conference_status, title, venue, country, timing, participants, textpdf.data]
            );
            res.json(conference.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при створенні конференції');
        }
    }

    async getConferences(req, res) {
        try {
            const conferences = await db.query('SELECT conference_id, conference_status, title, venue, country, timing, participants FROM archive_conferences WHERE is_published = true ORDER BY timing DESC');
            res.json(conferences.rows);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні конференцій');
        }
    }

    async getAdminConferences(req, res) {
        try {
            const conferences = await db.query('SELECT conference_id, conference_status, title, venue, country, timing, participants, is_published FROM archive_conferences ORDER BY is_published ASC, conference_id DESC, timing DESC');
            res.json(conferences.rows);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні конференцій');
        }
    }

    async getConferenceById(req, res) {
        try {
            const { id } = req.params;
            const conference = await db.query('SELECT conference_id, conference_status, title, venue, country, timing, participants FROM archive_conferences WHERE conference_id = $1 AND is_published = true', [id]);
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні конференції');
        }
    }

    async getConferenceMaterials(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT textpdf FROM archive_conferences WHERE conference_id = $1 AND is_published = true', [id]);
            const conference = result.rows[0];

            if (!conference || !conference.textpdf) {
                return res.status(404).json({ message: 'PDF не знайдено' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.send(conference.textpdf);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні матеріалів');
        }
    }

    async updateConference(req, res) {
        try {
            const conference_id = parsePositiveInteger(req.body.conference_id, 'conference_id', { required: true });
            const { conference_status, title, venue, country, timing, participants } = normalizeConferencePayload(req.body);
            const hasMaterials = req.files && req.files.textpdf;
            const textpdf = hasMaterials ? validatePdfFile(req.files.textpdf) : null;
            const existing = await db.query('SELECT is_published FROM archive_conferences WHERE conference_id = $1', [conference_id]);
            if (!existing.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            const conference = hasMaterials
                ? await db.query(
                    'UPDATE archive_conferences SET conference_status = $2, title = $3, venue = $4, country = $5, timing = $6, participants = $7, textpdf = $8, is_published = true WHERE conference_id = $1 RETURNING conference_id, conference_status, title, venue, country, timing, participants, is_published',
                    [conference_id, conference_status, title, venue, country, timing, participants, textpdf.data]
                )
                : await db.query(
                    'UPDATE archive_conferences SET conference_status = $2, title = $3, venue = $4, country = $5, timing = $6, participants = $7 WHERE conference_id = $1 RETURNING conference_id, conference_status, title, venue, country, timing, participants, is_published',
                    [conference_id, conference_status, title, venue, country, timing, participants]
                );
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при оновленні конференції');
        }
    }

    async deleteConference(req, res) {
        try {
            const id = req.params.id;
            const conference = await db.query('DELETE FROM archive_conferences WHERE conference_id = $1 RETURNING *', [id]);
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json({ message: 'Конференцію видалено' });
        } catch (error) {
            return handleError(res, error, 'Помилка при видаленні конференції');
        }
    }
}

module.exports = new ArchiveConferencesController();
