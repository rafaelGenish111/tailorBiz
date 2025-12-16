const express = require('express');
const router = express.Router();
const { protect, requireModule } = require('../middleware/auth.middleware');
const siteSettingsController = require('../controllers/siteSettingsController');

// Admin site settings (singleton)
router.get('/', protect, requireModule('settings'), siteSettingsController.getAdmin);
router.put('/', protect, requireModule('settings'), siteSettingsController.updateAdmin);

module.exports = router;
