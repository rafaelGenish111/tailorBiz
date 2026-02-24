// backend/src/routes/signableDocumentRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/signableDocumentController');
const { protect, requireModule } = require('../middleware/auth.middleware');

// Public routes (no auth) - MUST be before protect middleware
router.get('/public/view/:token', ctrl.getPublicDocument);
router.post('/public/sign/:token', ctrl.submitSignature);

// Protected routes
router.use(protect);
router.use(requireModule('invoices_docs'));

router.route('/client/:clientId')
  .get(ctrl.getClientSignableDocuments)
  .post(ctrl.createSignableDocument);

router.route('/:docId')
  .get(ctrl.getSignableDocument)
  .put(ctrl.updateSignableDocument)
  .delete(ctrl.deleteSignableDocument);

router.post('/:docId/send', ctrl.sendDocument);
router.post('/:docId/preview-pdf', ctrl.generatePreviewPDF);

module.exports = router;
