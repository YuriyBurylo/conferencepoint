const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createRateLimit, RequestValidationError } = require('../utils/security');

const router = express.Router();
const uploadLimit = createRateLimit({ windowMs: 60_000, max: 30, message: 'Too many uploads' });

router.get('/', authMiddleware, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ prefix: `uploads/${_req.user.user_id}/` });
});

// Run the explicit legacy-file migration with this deployment's Blob identity.
router.post('/migrate', adminMiddleware, async (_req, res) => {
    try {
        await require('../scripts/migrate-files-to-blob').migrateFiles();
        res.json({ migrated: true });
    } catch (error) {
        console.error('File migration failed:', error.message);
        res.status(500).json({ message: 'File migration failed; safe to retry' });
    }
});

router.post('/', async (req, res) => {
    // Blob callbacks have their own SDK signature validation and no session cookie.
    if (req.body?.type === 'blob.generate-presigned-url') {
        let authenticated = false;
        await authMiddleware(req, res, () => { authenticated = true; });
        if (!authenticated) return;
        let allowed = false;
        uploadLimit(req, res, () => { allowed = true; });
        if (!allowed) return;
    }
    try {
        const { handleUploadPresigned } = require('@vercel/blob/client');
        const { issueSignedToken } = require('@vercel/blob');
        const response = await handleUploadPresigned({
            request: req,
            body: req.body,
            getSignedToken: async (pathname) => {
                if (!req.user) throw new RequestValidationError('Authentication required', 401);
                const match = pathname.match(/^uploads\/(\d+)\/(article|receipt|leaflet|textpdf)\/[a-f0-9-]+\.(pdf|docx?)$/);
                if (!match || match[1] !== String(req.user.user_id)) {
                    throw new RequestValidationError('Invalid upload path', 403);
                }
                const field = match[2];
                if (['leaflet', 'textpdf'].includes(field) && req.user.role !== 'admin') {
                    throw new RequestValidationError('Admin access required', 403);
                }
                if (field !== 'article' && match[3] !== 'pdf') {
                    throw new RequestValidationError('PDF required');
                }
                const constraints = {
                    allowedContentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
                    maximumSizeInBytes: (field === 'article' ? 20 : 10) * 1024 * 1024,
                    validUntil: Date.now() + 10 * 60 * 1000
                };
                return {
                    token: await issueSignedToken({ pathname, operations: ['put'], ...constraints }),
                    urlOptions: { ...constraints, addRandomSuffix: false, allowOverwrite: false }
                };
            },
            onUploadCompleted: async () => {}
        });
        res.json(response);
    } catch (error) {
        console.error('Upload authorization failed:', error.message);
        res.status(error.statusCode || 400).json({ message: 'Upload failed' });
    }
});

module.exports = router;
