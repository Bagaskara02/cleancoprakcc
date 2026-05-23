const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/', reviewController.addReview);
router.get('/worker/:workerId', reviewController.getWorkerReviews);

module.exports = router;
