const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleStripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);

// Webhook route - match the path excluded in server.js
// Use raw body parser for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
