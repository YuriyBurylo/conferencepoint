const db = require('../db');

console.log('СОДЕРЖИМОЕ DB:', db);

class ConferenceController {
    async getNextConference(req, res) {
        const conference = await db.query('SELECT * FROM new_conferences ORDER BY timing DESC LIMIT 1');
        res.json(conference.rows[0]);
        console.log('СОДЕРЖИМОЕ DB:', db);
    }

    async getConferenceById(req, res) {
        const {id} = req.params;
        const conference = await db.query('SELECT * FROM new_conferences WHERE conference_id = $1', [id]);
        res.json(conference.rows[0]);
    }
}

module.exports = new ConferenceController();