const express = require('express');
const router = express.Router();
const regionalController = require('../controllers/regional.controller');

router.get('/centers', regionalController.getAllCenters);

module.exports = router;
