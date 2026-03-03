const Router = require('express');
const ConferenceRouter = new Router();
const ConferenceController = require('../controllers/ConferenceController');

ConferenceRouter.get('/', ConferenceController.getNextConference);
ConferenceRouter.get('/:id', ConferenceController.getConferenceById);

module.exports = ConferenceRouter;