const express = require('express');
const router = express.Router();
const { verifyWebhookToken } = require('../middleware/webhookAuth.middleware');
const { createArticleFromWebhook } = require('../controllers/webhookController');

// POST /api/webhook/article
router.post('/article', verifyWebhookToken, createArticleFromWebhook);

module.exports = router;
