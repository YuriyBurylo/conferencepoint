const Router = require('express');
const authRouter = new Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

// Protected routes
authRouter.get('/profile', authMiddleware, authController.getProfile);
authRouter.put('/profile', authMiddleware, authController.updateProfile);

// Admin routes
authRouter.get('/users', adminMiddleware, authController.getAllUsers);
authRouter.patch('/users/:id/role', adminMiddleware, authController.updateUserRole);
authRouter.delete('/users/:id', adminMiddleware, authController.deleteUser);

module.exports = authRouter;
