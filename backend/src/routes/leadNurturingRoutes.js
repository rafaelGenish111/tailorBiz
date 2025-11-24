// backend/src/routes/leadNurturingRoutes.js
const express = require('express');
const router = express.Router();
const leadNurturingController = require('../controllers/leadNurturingController');
const { protect } = require('../middleware/auth.middleware');

// כל הנתיבים דורשים אימות
router.use(protect);

// Templates
router.get('/templates', leadNurturingController.getAllTemplates);
router.get('/templates/:id', leadNurturingController.getTemplateById);
router.post('/templates', leadNurturingController.createTemplate);
router.put('/templates/:id', leadNurturingController.updateTemplate);
router.delete('/templates/:id', leadNurturingController.deleteTemplate);
router.patch('/templates/:id/toggle', leadNurturingController.toggleTemplateActive);

// Instances
router.get('/instances', leadNurturingController.getActiveInstances);
router.post('/instances/stop/:id', leadNurturingController.stopInstance);
router.post('/instances/trigger', leadNurturingController.manualTrigger);

// Stats
router.get('/stats', leadNurturingController.getNurturingStats);

module.exports = router;

