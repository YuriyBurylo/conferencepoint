const Router = require('express');
const archiveConferencesController = require('../controllers/archiveConferencesController');
const archiveConferencesRouter = new Router();
const { adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
archiveConferencesRouter.get('/', archiveConferencesController.getConferences);
archiveConferencesRouter.get('/:id', archiveConferencesController.getConferenceById);
archiveConferencesRouter.get('/:id/materials', archiveConferencesController.getConferenceMaterials);

// Admin-only routes
archiveConferencesRouter.post('/', adminMiddleware, archiveConferencesController.createConference);
archiveConferencesRouter.put('/', adminMiddleware, archiveConferencesController.updateConference);
archiveConferencesRouter.delete('/:id', adminMiddleware, archiveConferencesController.deleteConference);

module.exports = archiveConferencesRouter;