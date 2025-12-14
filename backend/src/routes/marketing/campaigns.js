const express = require('express');
const router = express.Router();
const campaignController = require('../../controllers/marketing/campaignController');
const { protect } = require('../../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);

router.route('/')
  .get(campaignController.getCampaigns)
  .post(campaignController.createCampaign);

router.route('/upcoming')
  .get(campaignController.getUpcomingCampaigns);

router.route('/:id')
  .get(campaignController.getCampaign)
  .put(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

router.route('/:id/activate')
  .post(campaignController.activateCampaign);

router.route('/:id/pause')
  .post(campaignController.pauseCampaign);

router.route('/:id/analytics')
  .get(campaignController.getCampaignAnalytics);

router.route('/:id/duplicate')
  .post(campaignController.duplicateCampaign);

module.exports = router;








