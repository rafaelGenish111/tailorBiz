const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, requireModule } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireModule('invoices_docs'));

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/requirements', projectController.addRequirement);
router.put('/:id/requirements/:requirementId', projectController.updateRequirement);
router.delete('/:id/requirements/:requirementId', projectController.deleteRequirement);

module.exports = router;
