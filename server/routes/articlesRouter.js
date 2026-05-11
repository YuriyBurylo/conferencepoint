const Router = require('express');
const articlesRouter = new Router();
const articlesController = require('../controllers/articlesController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// User routes (authenticated)
articlesRouter.post('/', authMiddleware, articlesController.submitArticle);
articlesRouter.get('/my', authMiddleware, articlesController.getMyArticles);
articlesRouter.get('/:id', authMiddleware, articlesController.getArticleById);
articlesRouter.get('/:id/download', authMiddleware, articlesController.downloadArticle);
articlesRouter.put('/:id', authMiddleware, articlesController.updateArticle);
articlesRouter.delete('/:id', authMiddleware, articlesController.deleteArticle);

// Admin routes
articlesRouter.get('/', adminMiddleware, articlesController.getAllArticles);
articlesRouter.get('/download-all', adminMiddleware, articlesController.downloadAllArticles);
articlesRouter.patch('/:id/review', adminMiddleware, articlesController.reviewArticle);
articlesRouter.get('/:id/receipt', adminMiddleware, articlesController.downloadReceipt);

module.exports = articlesRouter;
