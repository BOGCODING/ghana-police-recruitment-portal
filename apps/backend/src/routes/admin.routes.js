const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const analyticsController = require('../controllers/analytics.controller');
const notificationController = require('../controllers/notification.controller');
const sessionController = require('../controllers/session.controller');
const { 
  authenticateAdmin, 
  superAdminOnly,
  canManageApplications,
  canViewData,
  checkRegionalAccess
} = require('../middleware/admin.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const {
  adminLoginSchema,
  createAdminSchema,
  updateAdminSchema,
  applicationActionSchema
} = require('../validators/admin.validator');

const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validateCaptcha } = require('../middleware/captcha.middleware');

// Admin Login (public)
router.post('/login',
  authLimiter,
  validateCaptcha,
  validateBody(adminLoginSchema),
  adminController.login
);

// Initialize Super Admin (one-time setup)
router.post('/init-super-admin', adminController.initializeSuperAdmin);

// Refresh token (must be before auth middleware to work when access token is expired)
router.post('/refresh-token', adminController.refreshToken);

// Protected routes
router.use(authenticateAdmin);

// Get current admin info
router.get('/me', adminController.getCurrentAdmin);

// Logout
router.post('/logout', adminController.logout);

// ===== Admin User Management (Super Admin only) =====
router.post('/users',
  superAdminOnly,
  validateBody(createAdminSchema),
  adminController.createAdmin
);

router.get('/users',
  superAdminOnly,
  adminController.getAllAdmins
);

router.get('/users/:id',
  superAdminOnly,
  adminController.getAdminById
);

router.put('/users/:id',
  superAdminOnly,
  validateBody(updateAdminSchema),
  adminController.updateAdmin
);

router.delete('/users/:id',
  superAdminOnly,
  adminController.deleteAdmin
);

// ===== Application Management =====
router.get('/applications',
  canViewData,
  checkRegionalAccess,
  adminController.getAllApplications
);

router.get('/applications/export',
  canViewData,
  checkRegionalAccess,
  adminController.exportApplications
);

router.get('/applications/:id',
  canViewData,
  checkRegionalAccess,
  adminController.getApplicationById
);

router.post('/applications/:id/approve',
  canManageApplications,
  checkRegionalAccess,
  validateBody(applicationActionSchema),
  adminController.approveApplication
);

router.post('/applications/:id/reject',
  canManageApplications,
  checkRegionalAccess,
  validateBody(applicationActionSchema),
  adminController.rejectApplication
);

router.post('/applications/:id/request-documents',
  canManageApplications,
  adminController.requestDocuments
);

router.post('/applications/:id/documents/:docId/verify',
  canManageApplications,
  adminController.verifyDocument
);

// ===== Bulk Actions =====
router.post('/applications/bulk/approve',
  canManageApplications,
  adminController.bulkApproveApplications
);

router.post('/applications/bulk/reject',
  canManageApplications,
  adminController.bulkRejectApplications
);

// ===== Application Notes =====
router.get('/applications/:id/notes',
  canViewData,
  adminController.getApplicationNotes
);

router.post('/applications/:id/notes',
  canManageApplications,
  adminController.addApplicationNote
);

router.delete('/applications/:id/notes/:noteId',
  canManageApplications,
  adminController.deleteApplicationNote
);

// ===== Application Timeline =====
router.get('/applications/:id/timeline',
  canViewData,
  adminController.getApplicationTimeline
);

// ===== Dashboard =====

router.get('/dashboard/recent', canViewData, adminController.getRecentApplications);
router.get('/dashboard/pending', canViewData, adminController.getPendingActions);
router.get('/dashboard/stats', canViewData, analyticsController.getDashboardStats);



// ===== Analytics =====
router.get('/analytics/overview', canViewData, analyticsController.getOverviewStats);
router.get('/analytics/trends', canViewData, analyticsController.getAppTrends);
router.get('/analytics/distribution', canViewData, analyticsController.getStatusDistribution);
router.get('/analytics/demographics', canViewData, analyticsController.getDemographics);
router.get('/analytics/regions', canViewData, analyticsController.getDetailedRegionalStats);

// ===== Audit Logs =====
router.get('/audit-logs', superAdminOnly, adminController.getAuditLogs);

// ===== Communication =====
router.get('/notifications/templates', canViewData, notificationController.getTemplates);
router.post('/notifications/send-bulk', canManageApplications, notificationController.sendBulkNotification);

// ===== Session Monitoring =====
router.get('/sessions', superAdminOnly, sessionController.getActiveSessions);
router.delete('/sessions/:adminId/:sessionId', superAdminOnly, sessionController.terminateSession);

module.exports = router;

