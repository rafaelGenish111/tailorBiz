const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, requireModule } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireModule('invoices_docs'));

// Core CRUD
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Requirements
router.post('/:id/requirements', projectController.addRequirement);
router.put('/:id/requirements/:requirementId', projectController.updateRequirement);
router.delete('/:id/requirements/:requirementId', projectController.deleteRequirement);

// Contract
router.get('/:id/contract', projectController.getContract);
router.put('/:id/contract', projectController.updateContract);

// Payment Plan
router.put('/:id/payment-plan', projectController.updatePaymentPlan);
router.put('/:id/payment-plan/installments/:installmentId', projectController.updateInstallment);

// Interactions
router.get('/:id/interactions', projectController.getInteractions);
router.post('/:id/interactions', projectController.addInteraction);
router.put('/:id/interactions/:interactionId', projectController.updateInteraction);
router.delete('/:id/interactions/:interactionId', projectController.deleteInteraction);

// Documents
router.get('/:id/documents', projectController.getDocuments);
router.post('/:id/documents', projectController.addDocument);
router.delete('/:id/documents/:documentId', projectController.deleteDocument);

// Progress
router.put('/:id/progress', projectController.updateProgress);

// Invoices (scoped to project)
router.get('/:id/invoices', projectController.getProjectInvoices);

module.exports = router;
