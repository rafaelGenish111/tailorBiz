const express = require('express');
const router = express.Router();
const campaignsRoutes = require('./campaigns');
const channelsRoutes = require('./channels');
const automationsRoutes = require('./automations');
const analyticsRoutes = require('./analytics');

// Mount routes
router.use('/campaigns', campaignsRoutes);
router.use('/channels', channelsRoutes);
router.use('/automations', automationsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;












