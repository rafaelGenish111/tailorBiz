const express = require('express');
const router = express.Router();
const channelController = require('../../controllers/marketing/channelController');
const { protect } = require('../../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);

router.route('/')
  .get(channelController.getChannels)
  .post(channelController.createChannel);

router.route('/:id')
  .get(channelController.getChannel)
  .put(channelController.updateChannel)
  .delete(channelController.deleteChannel);

router.route('/:id/connect')
  .post(channelController.connectChannel);

router.route('/:id/disconnect')
  .post(channelController.disconnectChannel);

router.route('/:id/performance')
  .get(channelController.getChannelPerformance);

router.route('/:id/sync')
  .post(channelController.syncChannel);

module.exports = router;










