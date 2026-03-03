const uuid = require('uuid');
const path = require('path');
const db = require('../db');

class ArchiveConferencesController {
    async createConference(req, res) {
        const {conference_status, title, venue,country, timing, participants} = req.body;
        const {textpdf} = req.files;
        let fileName = uuid.v4() + '.pdf';
        textpdf.mv(path.resolve(__dirname, '..', 'static',fileName));
        const conference = await db.query('INSERT INTO archive_conferences (conference_status, title, venue,country, timing, participants, textpdf) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [conference_status, title, venue,country, timing, participants, textpdf.data]);
        res.json(conference.rows[0]);
    }

    async getConferences(req, res) {
        const conferences = await db.query('SELECT * FROM archive_conferences');
        res.json(conferences.rows);
    }

    async getOneConference(req, res) {
        const { id } = req.params;
        const result = await db.query('SELECT textpdf FROM archive_conferences WHERE conference_id = $1', [id]);  
        const conference = result.rows[0];

        if (!conference || !conference.textpdf) {
            return res.status(404).send('PDF не найден');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(conference.textpdf);
    }

    async updateConference(req, res) {
        const {conference_id, conference_status, title, venue,country, timing, participants} = req.body;
        const conference = await db.query('UPDATE archive_conferences SET conference_status = $2, title = $3, venue = $4, country = $5, timing = $6, participants = $7 WHERE conference_id = $1 RETURNING *', [conference_id, conference_status, title, venue,country, timing, participants]);
        res.json(conference.rows);
    }

    async deleteConference(req, res) {
        const id = req.params.id;
        const conference = await db.query('DELETE FROM archive_conferences WHERE conference_id = $1', [id]);
        res.json(conference.rows);
    }

}

module.exports = new ArchiveConferencesController();