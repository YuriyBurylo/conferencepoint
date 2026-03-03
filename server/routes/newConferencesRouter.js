const Router = require('express');
const newConferencesRouter = new Router();
const newConferencesController = require('../controllers/newConferencesController');

newConferencesRouter.post('/', newConferencesController.createConference);
newConferencesRouter.get('/', newConferencesController.getConferences);
newConferencesRouter.get('/:id', newConferencesController.getConferenceById);
newConferencesRouter.get('/:id/materials', newConferencesController.getConferenceMaterials);
newConferencesRouter.put('/', newConferencesController.updateConference);
newConferencesRouter.delete('/:id', newConferencesController.deleteConference);

module.exports = newConferencesRouter;