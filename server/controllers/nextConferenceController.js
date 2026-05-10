const db = require('../db');

class NextConferenceController {
    async getNextConference(req, res) {
        try {
            const conference = await db.query(
                'SELECT conference_id, conference_status, title, venue, country, timing FROM new_conferences ORDER BY timing ASC LIMIT 1'
            );
            if (!conference.rows[0]) {
                return res.status(404).json({ message: 'Немає запланованих конференцій' });
            }
            res.json(conference.rows[0]);
        } catch (error) {
            console.error('Error fetching next conference:', error.message);
            res.status(500).json({ message: 'Помилка при отриманні конференції' });
        }
    }
}

module.exports = new NextConferenceController();