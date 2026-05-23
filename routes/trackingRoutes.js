const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// PATCH /api/v2/tracking/location
router.patch('/location', trackingController.updateLocation);

module.exports = router;
