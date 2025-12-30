const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, preventSubmittedUpdates } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/me', userController.getMe);
router.put('/profile', preventSubmittedUpdates, userController.updateProfile);
router.put('/password', userController.changePassword);
router.delete('/account', preventSubmittedUpdates, userController.deleteAccount);

module.exports = router;
