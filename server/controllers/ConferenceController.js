const db = require('../db'); 


class ConferenceController {
    async getNextConference(req, res) {
        const conference = await db.query('SELECT * FROM new_conferences ORDER BY timing DESC LIMIT 1');
        res.json(conference.rows[0]);
    }
}

module.exports = new ConferenceController();