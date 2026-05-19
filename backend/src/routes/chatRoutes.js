const express = require('express');
const router = express.Router();
const chatController = require('../chat/chatController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// IMPORTANT: /rooms must be BEFORE /:roomId or Express matches "rooms" as a roomId param
router.get('/rooms', chatController.getChatRooms);
router.get('/:roomId/history', chatController.getChatHistory);
router.put('/:roomId/read', chatController.markMessagesAsRead);

module.exports = router;
