const Router = require('express');
const newConferencesRouter = new Router();
const newConferencesController = require('../controllers/newConferencesController');

newConferencesRouter.post('/', newConferencesController.createConference);
newConferencesRouter.get('/', newConferencesController.getConferences);
newConferencesRouter.get('/:id', newConferencesController.getOneConference);
newConferencesRouter.put('/', newConferencesController.updateConference);
newConferencesRouter.delete('/:id', newConferencesController.deleteConference);

module.exports = newConferencesRouter;