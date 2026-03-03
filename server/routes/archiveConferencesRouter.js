const Router = require('express');
const archiveConferencesController = require('../controllers/archiveConferencesController');
const archiveConferencesRouter = new Router();

archiveConferencesRouter.post('/', archiveConferencesController.createConference);
archiveConferencesRouter.get('/', archiveConferencesController.getConferences);
archiveConferencesRouter.get('/:id', archiveConferencesController.getOneConference);
archiveConferencesRouter.put('/', archiveConferencesController.updateConference);
archiveConferencesRouter.delete('/:id', archiveConferencesController.deleteConference);

module.exports = archiveConferencesRouter;