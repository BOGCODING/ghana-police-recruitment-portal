const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const applicationRoutes = require('./application.routes');
const voucherRoutes = require('./voucher.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');
const uploadRoutes = require('./upload.routes');
const notificationRoutes = require('./notification.routes');
const analyticsRoutes = require('./analytics.routes');
const regionalRoutes = require('./regional.routes');
const auditRoutes = require('./audit.routes');
const educationRoutes = require('./education.routes');
const eligibilityRoutes = require('./eligibility.routes');
const systemRoutes = require('./system.routes');
const checkMaintenanceMode = require('../middleware/maintenance.middleware');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Ghana Police Service Recruitment API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
router.use(checkMaintenanceMode);
router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/regions', regionalRoutes);
router.use('/education', educationRoutes);
router.use('/eligibility', eligibilityRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);
router.use('/system', systemRoutes);

// Catch-all for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router;
