const db = require('../db');
const { hasUpload, readUpload, sendFile } = require('../utils/files');
const { parsePositiveInteger, validatePdfFile, validateText } = require('../utils/security');

const handleError = (res, error, fallbackMessage) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(fallbackMessage, error.message);
    return res.status(500).json({ message: fallbackMessage });
};

const normalizeConferencePayload = (body) => ({
    conference_status: validateText(body.conference_status, 'Статус конференції', { max: 128 }),
    title: validateText(body.title, 'Назва конференції', { required: true, max: 500 }),
    venue: validateText(body.venue, 'Місто', { max: 128 }),
    country: validateText(body.country, 'Країна', { max: 128 }),
    timing: validateText(body.timing, 'Дата конференції', { required: true, max: 32 })
});

class NewConferencesController {
    
    async createConference(req, res) {
        try {
            const { conference_status, title, venue, country, timing } = normalizeConferencePayload(req.body);

            if (!hasUpload(req, 'leaflet')) {
                return res.status(400).json({ message: 'Файл листівки обов\'язковий' });
            }

            const leaflet = await readUpload(req, 'leaflet', validatePdfFile);
            const conference = await db.query(
                'INSERT INTO new_conferences (conference_status, title, venue, country, timing, leaflet, leaflet_blob) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING conference_id, conference_status, title, venue, country, timing',
                [conference_status, title, venue, country, timing, leaflet.blobPathname ? null : leaflet.data, leaflet.blobPathname || null]
            );
            res.json(conference.rows[0]);
        } catch (error) {
            return handleError(res, error, 'Помилка при створенні конференції');
        }
    }

    async getConferences(req, res) {
        try {
            const conferences = await db.query('SELECT conference_id, conference_status, title, venue, country, timing FROM new_conferences ORDER BY timing DESC');
            res.json(conferences.rows);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні конференцій');
        }
    }

    async getConferenceById(req, res) {
        try {
            const { id } = req.params;
            const conference = await db.query('SELECT conference_id, conference_status, title, venue, country, timing FROM new_conferences WHERE conference_id = $1', [id]);
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
            const result = await db.query('SELECT leaflet, leaflet_blob FROM new_conferences WHERE conference_id = $1', [id]);
            const conference = result.rows[0];

            if (!conference || (!conference.leaflet && !conference.leaflet_blob)) {
                return res.status(404).json({ message: 'PDF не знайдено' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            await sendFile(res, conference.leaflet, conference.leaflet_blob);
        } catch (error) {
            return handleError(res, error, 'Помилка при отриманні матеріалів');
        }
    }

    async updateConference(req, res) {
        try {
            const conference_id = parsePositiveInteger(req.body.conference_id, 'conference_id', { required: true });
            const { conference_status, title, venue, country, timing } = normalizeConferencePayload(req.body);
            const hasLeaflet = hasUpload(req, 'leaflet');
            const leaflet = hasLeaflet ? await readUpload(req, 'leaflet', validatePdfFile) : null;
            const conference = hasLeaflet
                ? await db.query(
                    'UPDATE new_conferences SET conference_status = $1, title = $2, venue = $3, country = $4, timing = $5, leaflet = $6, leaflet_blob = $8 WHERE conference_id = $7 RETURNING conference_id, conference_status, title, venue, country, timing',
                    [conference_status, title, venue, country, timing, leaflet.blobPathname ? null : leaflet.data, conference_id, leaflet.blobPathname || null]
                )
                : await db.query(
                    'UPDATE new_conferences SET conference_status = $1, title = $2, venue = $3, country = $4, timing = $5 WHERE conference_id = $6 RETURNING conference_id, conference_status, title, venue, country, timing',
                    [conference_status, title, venue, country, timing, conference_id]
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
            const conference = await db.query('DELETE FROM new_conferences WHERE conference_id = $1 RETURNING *', [id]);
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json({ message: 'Конференцію видалено' });
        } catch (error) {
            return handleError(res, error, 'Помилка при видаленні конференції');
        }
    }

    async moveToArchive(req, res) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const id = parsePositiveInteger(req.params.id, 'conference_id', { required: true });

            const newConfResult = await client.query('SELECT * FROM new_conferences WHERE conference_id = $1', [id]);
            const conf = newConfResult.rows[0];
            if (!conf) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }

            const insertResult = await client.query(
                'INSERT INTO archive_conferences (conference_status, title, venue, country, timing, participants, textpdf, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING conference_id',
                [conf.conference_status, conf.title, conf.venue, conf.country, conf.timing, null, null, false]
            );
            const newArchiveId = insertResult.rows[0].conference_id;

            await client.query(
                'UPDATE articles SET new_conference_id = NULL, archive_conference_id = $1, conference_id = NULL WHERE new_conference_id = $2 OR conference_id = $2',
                [newArchiveId, id]
            );

            await client.query('DELETE FROM new_conferences WHERE conference_id = $1', [id]);

            await client.query('COMMIT');
            res.json({ message: 'Конференцію успішно переміщено в архів' });
        } catch (error) {
            await client.query('ROLLBACK');
            return handleError(res, error, 'Помилка при переміщенні в архів');
        } finally {
            client.release();
        }
    }
}

module.exports = new NewConferencesController();
