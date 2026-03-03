const uuid = require('uuid');
const path = require('path');
const db = require('../db');

class NewConferencesController {
    
    async createConference(req, res) {
        let {conference_status, title, venue, country, timing} = req.body;
        const {leaflet} = req.files;
        let fileName = uuid.v4() + '.pdf';
        leaflet.mv(path.resolve(__dirname, '..', 'static', fileName));
        const conference = await db.query('INSERT INTO new_conferences (conference_status, title, venue, country, timing, leaflet) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [conference_status, title, venue, country, timing, leaflet.data]);
        res.json(conference.rows);
    }

    async getConferences(req, res) {
        const conferences = await db.query('SELECT * FROM new_conferences');
        res.json(conferences.rows);
    }

    async getOneConference(req, res) {
        const { id } = req.params;
        console.log(id);
        const result = await db.query('SELECT leaflet FROM new_conferences WHERE conference_id = $1', [id]);
        const conference = result.rows[0];

        if (!conference || !conference.leaflet) {
            return res.status(404).send('PDF не найден');
        };

        res.setHeader('Content-Type', 'application/pdf');
        res.send(conference.leaflet);
    }

    async updateConference(req, res) {
        const {conference_id, conference_status, venue, country} = req.body;
        const conference = await db.query('UPDATE new_conferences SET conference_status = $1, venue = $2 WHERE conference_id = $3  RETURNING *', [conference_status, venue, conference_id]);
        res.json(conference.rows);
    }

    async deleteConference(req, res) {
        const id = req.params.id;
        const conference = await db.query('DELETE FROM new_conferences WHERE conference_id = $1', [id]);
        res.json(conference.rows);
    }
}

module.exports = new NewConferencesController();