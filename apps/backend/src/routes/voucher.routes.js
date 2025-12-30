const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { authenticateAdmin, canManageVouchers } = require('../middleware/admin.middleware');
const { validateBody, validateQuery } = require('../middleware/validation.middleware');
const { voucherLimiter } = require('../middleware/rateLimiter.middleware');
const { 
  generateVoucherSchema, 
  bulkVoucherSchema,
  validateVoucherSchema,
  voucherQuerySchema
} = require('../validators/voucher.validator');

// Public: Check voucher validity
router.post('/check',
  voucherLimiter,
  validateBody(validateVoucherSchema),
  voucherController.checkVoucher
);

// Public: Purchase voucher
router.post('/purchase',
  voucherLimiter,
  validateBody(require('../validators/voucher.validator').purchaseVoucherSchema),
  voucherController.purchaseVoucher
);

// Admin routes - require authentication
router.use(authenticateAdmin);
router.use(canManageVouchers);

// Generate single voucher
router.post('/generate',
  validateBody(generateVoucherSchema),
  voucherController.generateVoucher
);

// Generate bulk vouchers
router.post('/generate-bulk',
  validateBody(bulkVoucherSchema),
  voucherController.generateBulk
);

// Export vouchers to CSV
router.get('/export-csv',
  validateQuery(voucherQuerySchema),
  voucherController.exportToCSV
);

// Get all vouchers with pagination
router.get('/',
  validateQuery(voucherQuerySchema),
  voucherController.getAllVouchers
);

// Get voucher statistics
router.get('/stats', voucherController.getVoucherStats);

// Get single voucher details
router.get('/:code', voucherController.getVoucherByCode);

// Deactivate a voucher
router.patch('/:code/deactivate', voucherController.deactivateVoucher);

// Delete a voucher (hard delete)
router.delete('/:code', voucherController.deleteVoucher);

module.exports = router;
