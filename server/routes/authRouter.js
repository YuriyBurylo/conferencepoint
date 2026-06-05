const Router = require('express');
const authRouter = new Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createRateLimit } = require('../utils/security');

const authRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Забагато спроб. Спробуйте пізніше'
});

// Public routes
authRouter.post('/register', authRateLimit, authController.register);
authRouter.post('/login', authRateLimit, authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/password-reset/request', authRateLimit, authController.requestPasswordReset);
authRouter.post('/password-reset/confirm', authRateLimit, authController.resetPassword);

// Protected routes
authRouter.get('/profile', authMiddleware, authController.getProfile);
authRouter.put('/profile', authMiddleware, authController.updateProfile);
authRouter.put('/password', authMiddleware, authController.changePassword);

// Admin routes
authRouter.get('/users', adminMiddleware, authController.getAllUsers);
authRouter.patch('/users/:id/role', adminMiddleware, authController.updateUserRole);
authRouter.delete('/users/:id', adminMiddleware, authController.deleteUser);

module.exports = authRouter;
