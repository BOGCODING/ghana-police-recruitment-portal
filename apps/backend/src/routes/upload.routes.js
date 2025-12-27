const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { singleUpload } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(uploadLimiter);

router.post('/', authenticateToken, singleUpload, uploadController.uploadDocument);

module.exports = router;
