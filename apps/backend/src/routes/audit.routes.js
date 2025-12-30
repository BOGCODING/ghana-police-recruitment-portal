const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { superAdminOnly, authenticateAdmin } = require('../middleware/admin.middleware');
const { validateSecurityCombo } = require('../middleware/security.middleware');

router.get('/', authenticateAdmin, superAdminOnly, validateSecurityCombo, auditController.getLogs);

module.exports = router;
