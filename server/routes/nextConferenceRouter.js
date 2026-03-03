const Router = require('express');
const nextConferenceRouter = new Router();
const nextConferenceController = require('../controllers/nextConferenceController');

nextConferenceRouter.get('/', nextConferenceController.getNextConference);

module.exports = nextConferenceRouter;