const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// POST /api/v1/tracking - Petugas mengirim lokasi
router.post('/', trackingController.updateLocation);

// GET /api/v1/tracking/:orderId - Pelanggan melihat lokasi
router.get('/:orderId', trackingController.getLocation);

module.exports = router;
