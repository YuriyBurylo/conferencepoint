const uuid = require('uuid');
const path = require('path');
const db = require('../db');

class NewConferencesController {
    
    async createConference(req, res) {
        try {
            const { conference_status, title, venue, country, timing } = req.body;

            if (!req.files || !req.files.leaflet) {
                return res.status(400).json({ message: 'Файл листівки обов\'язковий' });
            }

            const { leaflet } = req.files;
            const conference = await db.query(
                'INSERT INTO new_conferences (conference_status, title, venue, country, timing, leaflet) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [conference_status, title, venue, country, timing, leaflet.data]
            );
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error creating conference:', error.message);
            res.status(500).json({ message: 'Помилка при створенні конференції' });
        }
    }

    async getConferences(req, res) {
        try {
            const conferences = await db.query('SELECT conference_id, conference_status, title, venue, country, timing FROM new_conferences ORDER BY timing DESC');
            res.json(conferences.rows);
        } catch (error) {
            console.error('Error fetching conferences:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні конференцій' });
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
            console.error('Error fetching conference:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні конференції' });
        }
    }

    async getConferenceMaterials(req, res) {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT leaflet FROM new_conferences WHERE conference_id = $1', [id]);
            const conference = result.rows[0];

            if (!conference || !conference.leaflet) {
                return res.status(404).json({ message: 'PDF не знайдено' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.send(conference.leaflet);
        } catch (error) {
            console.error('Error fetching materials:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні матеріалів' });
        }
    }

    async updateConference(req, res) {
        try {
            const { conference_id, conference_status, title, venue, country, timing } = req.body;
            const conference = await db.query(
                'UPDATE new_conferences SET conference_status = $1, title = $2, venue = $3, country = $4, timing = $5 WHERE conference_id = $6 RETURNING *',
                [conference_status, title, venue, country, timing, conference_id]
            );
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Конференцію не знайдено' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error updating conference:', error.message);
            res.status(500).json({ message: 'Помилка при оновленні конференції' });
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
            console.error('Error deleting conference:', error.message);
            res.status(500).json({ message: 'Помилка при видаленні конференції' });
        }
    }
}

module.exports = new NewConferencesController();
