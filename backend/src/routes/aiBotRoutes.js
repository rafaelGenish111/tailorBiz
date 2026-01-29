const express = require('express');
const router = express.Router();
const aiBotController = require('../controllers/aiBotController');
const { protect } = require('../middleware/auth.middleware');

/**
 * AI Bot Routes
 *
 * כל ה-routes מוגנים ב-authentication
 */

// Bot Configs
router.post('/bot-configs', protect, aiBotController.createBotConfig);
router.get('/bot-configs', protect, aiBotController.getBotConfigs);
router.get('/bot-configs/default', protect, aiBotController.getDefaultBotConfig);
router.post('/bot-configs/ensure-default', protect, aiBotController.ensureDefaultBot);
router.get('/bot-configs/:id', protect, aiBotController.getBotConfigById);
router.put('/bot-configs/:id', protect, aiBotController.updateBotConfig);
router.delete('/bot-configs/:id', protect, aiBotController.deleteBotConfig);
router.patch('/bot-configs/:id/toggle', protect, aiBotController.toggleBotConfig);
router.patch('/bot-configs/:id/stats', protect, aiBotController.updateBotStats);

// Conversations
router.post('/conversations/test', protect, aiBotController.testBotConversation);
router.get('/conversations/:clientId', protect, aiBotController.getClientConversations);
router.get('/conversations/:id/messages', protect, aiBotController.getConversationMessages);
router.post('/conversations/:id/handoff', protect, aiBotController.handoffToHuman);
router.delete('/conversations/:id', protect, aiBotController.archiveConversation);

// Statistics
router.get('/stats', protect, aiBotController.getBotStats);

module.exports = router;
