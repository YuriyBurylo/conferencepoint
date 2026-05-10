const Router = require('express');
const router = new Router();
const nextConferenceRouter = require('./nextConferenceRouter');
const newConferencesRouter = require('./newConferencesRouter');
const archiveConferencesRouter = require('./archiveConferencesRouter');
const authRouter = require('./authRouter');
const articlesRouter = require('./articlesRouter');

router.use('/auth', authRouter);
router.use('/nextconference', nextConferenceRouter);
router.use('/newconferences', newConferencesRouter);
router.use('/pastconferences', archiveConferencesRouter);
router.use('/articles', articlesRouter);

module.exports = router;