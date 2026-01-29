/**
 * Public Chat Routes
 *
 * נתיבים ציבוריים לצ'אט עם הבוט (ללא אימות)
 */

const express = require('express');
const router = express.Router();
const publicChatController = require('../controllers/publicChatController');
const rateLimit = require('express-rate-limit');

// Rate limiting for public endpoints to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

// Initialize chat session
router.post('/init', chatLimiter, publicChatController.initSession);

// Send message to bot
router.post('/message', chatLimiter, publicChatController.sendMessage);

// Get conversation history
router.get('/history/:sessionId', chatLimiter, publicChatController.getHistory);

// End chat session
router.post('/end/:sessionId', chatLimiter, publicChatController.endSession);

module.exports = router;
