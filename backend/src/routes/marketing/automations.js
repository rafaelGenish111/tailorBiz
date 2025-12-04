const express = require('express');
const router = express.Router();
const automationController = require('../../controllers/marketing/automationController');
const { protect } = require('../../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);

router.route('/')
  .get(automationController.getAutomations)
  .post(automationController.createAutomation);

router.route('/:id')
  .get(automationController.getAutomation)
  .put(automationController.updateAutomation)
  .delete(automationController.deleteAutomation);

router.route('/:id/activate')
  .post(automationController.activateAutomation);

router.route('/:id/pause')
  .post(automationController.pauseAutomation);

router.route('/:id/logs')
  .get(automationController.getAutomationLogs);

router.route('/:id/test')
  .post(automationController.testAutomation);

module.exports = router;





