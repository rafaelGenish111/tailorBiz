const express = require('express');
const router = express.Router();
const { protect, requireModule } = require('../middleware/auth.middleware');
const adminBotConfigController = require('../controllers/adminBotConfigController');

// All bot config routes require authentication + settings module access
router.get('/', protect, requireModule('settings'), adminBotConfigController.getConfig);
router.put('/', protect, requireModule('settings'), adminBotConfigController.updateConfig);
router.get('/stats', protect, requireModule('settings'), adminBotConfigController.getStats);

module.exports = router;
