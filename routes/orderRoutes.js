const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.post('/', orderController.addOrder);
router.patch('/:id/status', orderController.updateStatus);

module.exports = router;
