const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { singleUpload } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

const { authenticateToken, preventSubmittedUpdates } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(uploadLimiter);

router.post('/', authenticateToken, preventSubmittedUpdates, singleUpload, uploadController.uploadDocument);

module.exports = router;
