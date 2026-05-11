const Router = require('express');
const newConferencesRouter = new Router();
const newConferencesController = require('../controllers/newConferencesController');
const { adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
newConferencesRouter.get('/', newConferencesController.getConferences);
newConferencesRouter.get('/:id', newConferencesController.getConferenceById);
newConferencesRouter.get('/:id/materials', newConferencesController.getConferenceMaterials);

// Admin-only routes
newConferencesRouter.post('/', adminMiddleware, newConferencesController.createConference);
newConferencesRouter.put('/', adminMiddleware, newConferencesController.updateConference);
newConferencesRouter.delete('/:id', adminMiddleware, newConferencesController.deleteConference);
newConferencesRouter.post('/:id/archive', adminMiddleware, newConferencesController.moveToArchive);

module.exports = newConferencesRouter;