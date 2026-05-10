const db = require('../db');

class ArchiveConferencesController {
    async createConference(req, res) {
        try {
            const { conference_status, title, venue, country, timing, participants } = req.body;

            if (!req.files || !req.files.textpdf) {
                return res.status(400).json({ message: 'Файл матеріалів обов\'язковий' });
            }

            const { textpdf } = req.files;
            const conference = await db.query(
                'INSERT INTO archive_conferences (conference_status, title, venue, country, timing, participants, textpdf) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING conference_id, conference_status, title, venue, country, timing, participants',
                [conference_status, title, venue, country, timing, participants, textpdf.data]
            );
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error creating archive conference:', error.message);
            res.status(500).json({ message: 'Помилка при створенні конференції' });
        }
    }

    async getConferences(req, res) {
        try {
            const conferences = await db.query('SELECT conference_id, conference_status, title, venue, country, timing, participants FROM archive_conferences ORDER BY timing DESC');
            res.json(conferences.rows);
        } catch (error) {
            console.error('Error fetching archive conferences:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні конференцій' });
        }
    }

    async getConferenceById(req, res) {
        try {
            const { id } = req.params;
            const conference = await db.query('SELECT conference_id, conference_status, title, venue, country, timing, participants FROM archive_conferences WHERE conference_id = $1', [id]);
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error fetching archive conference:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні конференції' });
        }
    }

    async getConferenceMaterials(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT textpdf FROM archive_conferences WHERE conference_id = $1', [id]);
            const conference = result.rows[0];

            if (!conference || !conference.textpdf) {
                return res.status(404).json({ message: 'PDF не знайдено' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.send(conference.textpdf);
        } catch (error) {
            console.error('Error fetching archive materials:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні матеріалів' });
        }
    }

    async updateConference(req, res) {
        try {
            const { conference_id, conference_status, title, venue, country, timing, participants } = req.body;
            const conference = await db.query(
                'UPDATE archive_conferences SET conference_status = $2, title = $3, venue = $4, country = $5, timing = $6, participants = $7 WHERE conference_id = $1 RETURNING conference_id, conference_status, title, venue, country, timing, participants',
                [conference_id, conference_status, title, venue, country, timing, participants]
            );
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error updating archive conference:', error.message);
            res.status(500).json({ message: 'Помилка при оновленні конференції' });
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
            console.error('Error deleting archive conference:', error.message);
            res.status(500).json({ message: 'Помилка при видаленні конференції' });
        }
    }
}

module.exports = new ArchiveConferencesController();