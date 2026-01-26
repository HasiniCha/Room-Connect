const express = require('express');
const router = express.Router();
const authController = require('../auth/authController');
const { authenticateToken } = require('../middleware/auth');


router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;