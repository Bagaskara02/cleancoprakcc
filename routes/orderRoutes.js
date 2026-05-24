const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.post('/', orderController.addOrder);
router.patch('/:id/status', orderController.updateStatus);
router.patch('/:id/assign', orderController.assignWorker);

module.exports = router;
