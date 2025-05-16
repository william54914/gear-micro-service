const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/password/reset-request', userController.requestPasswordReset);
router.post('/password/reset', userController.resetPassword);

// Protected routes
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getUser);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

// Admin routes
router.use(authorize('admin'));
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.adminUpdateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 