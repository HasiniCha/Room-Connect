const express = require('express');
const router = express.Router();
const { createPaymentIntent, webhookHandler } = require('../payments/paymentController');
const { authenticateToken } = require('../middleware/auth');


router.post('/create-intent', authenticateToken, createPaymentIntent);


router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

module.exports = router;
