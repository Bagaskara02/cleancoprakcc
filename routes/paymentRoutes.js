const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.processPayment);
router.get('/order/:orderId', paymentController.getPaymentDetail);
router.patch('/:id/status', paymentController.confirmPayment);

module.exports = router;
