const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/v1/chats/:orderId
router.get('/:orderId', chatController.getChatMessages);

// POST /api/v1/chats
router.post('/', chatController.sendMessage);

module.exports = router;
