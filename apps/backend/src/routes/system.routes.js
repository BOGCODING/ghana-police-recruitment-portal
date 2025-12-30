const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');
const { authenticateAdmin, superAdminOnly } = require('../middleware/admin.middleware');
const { validateSecurityCombo } = require('../middleware/security.middleware');

// Public route to get voucher price (needed for purchase page)
router.get('/voucher-price', systemController.getVoucherPrice);

// Public route to get public-facing settings (announcement, registration status)
router.get('/public-settings', systemController.getPublicSettings);

// Protected routes
router.use(authenticateAdmin);

// Get all settings (for admin dashboard)
router.get('/settings', systemController.getSettings);

// Update setting (Super Admin only)
router.post('/settings', superAdminOnly, validateSecurityCombo, systemController.updateSetting);

module.exports = router;
