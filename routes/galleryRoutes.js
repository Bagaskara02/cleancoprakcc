const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// GET /api/v2/gallery/:orderId
router.get('/:orderId', galleryController.getGalleryPhotos);

// POST /api/v2/gallery
router.post('/', galleryController.addGalleryPhoto);

module.exports = router;
