
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:roomId/history', chatController.getChatHistory);

router.get('/rooms', chatController.getChatRooms);

router.put('/:roomId/read', chatController.markMessagesAsRead);

module.exports = router;