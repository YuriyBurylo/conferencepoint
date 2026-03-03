const Router = require('express');
const router = new Router();
const ConferenceRouter = require('./ConferenceRouter');
const newConferencesRouter = require('./newConferencesRouter');
const archiveConferencesRouter = require('./archiveConferencesRouter');

router.use('/conference', ConferenceRouter)
router.use('/newconferences', newConferencesRouter);
router.use('/pastconferences', archiveConferencesRouter);

module.exports = router;