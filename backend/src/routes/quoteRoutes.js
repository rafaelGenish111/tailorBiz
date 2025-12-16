// backend/routes/quoteRoutes.js
const express = require('express');
const router = express.Router();
const {
  createQuote,
  updateQuote,
  getClientQuotes,
  getQuote,
  generatePDF,
  deleteQuote,
  updateQuoteStatus,
  duplicateQuote,
  uploadExternalPDF
} = require('../controllers/quoteController');
const { protect, requireModule } = require('../middleware/auth.middleware');
const uploadQuotePdf = require('../middleware/quotePdfUpload.middleware');

router.use(protect);
router.use(requireModule('invoices_docs'));

router.route('/client/:clientId')
  .get(getClientQuotes)
  .post(createQuote);

router.route('/:quoteId')
  .get(getQuote)
  .put(updateQuote)
  .delete(deleteQuote);

router.post('/:quoteId/generate-pdf', generatePDF);
router.post('/:quoteId/upload-pdf', uploadQuotePdf.single('pdf'), uploadExternalPDF);
router.put('/:quoteId/status', updateQuoteStatus);
router.post('/:quoteId/duplicate', duplicateQuote);

module.exports = router;


