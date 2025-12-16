const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const siteSettingsController = require('../controllers/siteSettingsController');

// Admin site settings (singleton)
router.get('/', protect, authorize('admin'), siteSettingsController.getAdmin);
router.put('/', protect, authorize('admin'), siteSettingsController.updateAdmin);

module.exports = router;
