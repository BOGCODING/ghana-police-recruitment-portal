const express = require('express');
const router = express.Router();
const eligibilityController = require('../controllers/eligibility.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * Public pre-check route (Stateless)
 */
router.post('/pre-check', eligibilityController.performPreCheck);

/**
 * Protected check based on actual application data
 */
router.get('/status', authenticateToken, eligibilityController.getEligibilityStatus);

module.exports = router;
