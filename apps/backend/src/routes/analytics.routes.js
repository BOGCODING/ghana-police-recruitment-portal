const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateAdmin, canViewData, superAdminOnly } = require('../middleware/admin.middleware');

// All analytics routes require admin authentication
router.use(authenticateAdmin);
router.use(canViewData);

// Overall statistics
router.get('/overview', analyticsController.getOverviewStats);

// Applications by category
router.get('/by-category', analyticsController.getStatsByCategory);

// Applications by region
router.get('/by-region', analyticsController.getStatsByRegion);
router.get('/regions', analyticsController.getDetailedRegionalStats);

// Applications by status
router.get('/by-status', analyticsController.getStatsByStatus);

// Trend analysis (daily/weekly/monthly)
router.get('/trends', analyticsController.getTrendAnalysis);

// Voucher analytics
router.get('/vouchers', canViewData, analyticsController.getVoucherAnalytics);

// Real-time statistics (for WebSocket updates)
router.get('/realtime', canViewData, analyticsController.getRealtimeStats);

// Compliance stats
router.get('/compliance', superAdminOnly, analyticsController.getComplianceStats);

module.exports = router;
