const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/marketing/analyticsController');
const { protect } = require('../../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);

router.route('/')
  .get(analyticsController.getAnalyticsReports);

router.route('/overview')
  .get(analyticsController.getOverview);

router.route('/dashboard')
  .get(analyticsController.getDashboardOverview);

router.route('/campaigns')
  .get(analyticsController.getCampaignsPerformance);

router.route('/channels')
  .get(analyticsController.getChannelsPerformance);

router.route('/roi')
  .get(analyticsController.getROIAnalysis);

router.route('/insights')
  .get(analyticsController.getInsights);

router.route('/generate')
  .post(analyticsController.generateReport);

router.route('/export')
  .post(analyticsController.exportAnalytics);

router.route('/:id')
  .get(analyticsController.getAnalyticsReport)
  .delete(analyticsController.deleteAnalyticsReport);

module.exports = router;

