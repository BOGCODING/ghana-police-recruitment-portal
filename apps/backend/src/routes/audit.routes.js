const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { superAdminOnly } = require('../middleware/admin.middleware');

router.get('/', superAdminOnly, auditController.getLogs);

module.exports = router;
