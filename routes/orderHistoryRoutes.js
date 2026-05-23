const express = require('express');
const router = express.Router();
const orderHistoryController = require('../controllers/orderHistoryController');

router.post('/', orderHistoryController.logOrderStatus);
router.get('/:orderId', orderHistoryController.getOrderHistory);

module.exports = router;
