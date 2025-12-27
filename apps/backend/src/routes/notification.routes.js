const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateAdmin } = require('../middleware/admin.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { verifyAccessToken } = require('../config/jwt');

// Middleware to delegate to appropriate auth middleware based on token type
const authenticateUserOrAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.accessToken || req.cookies?.adminAccessToken;
  const finalToken = token || cookieToken;

  if (finalToken) {
    const decoded = verifyAccessToken(finalToken);
    if (decoded && decoded.type === 'admin') {
      return authenticateAdmin(req, res, next);
    }
  }
  return authenticateToken(req, res, next);
};

// Routes accessible by either admin or applicant
router.get('/', authenticateUserOrAdmin, notificationController.getMyNotifications);
router.put('/read-all', authenticateUserOrAdmin, notificationController.markAllAsRead);
router.put('/:id/read', authenticateUserOrAdmin, notificationController.markAsRead);

module.exports = router;
