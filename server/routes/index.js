const Router = require('express');
const router = new Router();
const nextConferenceRouter = require('./nextConferenceRouter');
const newConferencesRouter = require('./newConferencesRouter');
const archiveConferencesRouter = require('./archiveConferencesRouter');

router.use('/nextconference', nextConferenceRouter);
router.use('/newconferences', newConferencesRouter);
router.use('/pastconferences', archiveConferencesRouter);

module.exports = router;