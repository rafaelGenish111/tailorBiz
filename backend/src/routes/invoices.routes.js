const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect, requireModule } = require('../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);
router.use(requireModule('invoices_docs'));

// Routes כלליים
router.get('/stats/overview', invoiceController.getInvoiceStats);

router.route('/')
  .get(invoiceController.getAllInvoices)
  .post(invoiceController.createInvoice);

router.route('/:id')
  .get(invoiceController.getInvoiceById)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

// Routes לסטטוס
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// Routes לתשלום
router.put('/:id/payment', invoiceController.updatePayment);

// Routes לשליחה
router.post('/:id/send', invoiceController.sendInvoice);

// Routes ל-PDF
router.post('/:id/generate-pdf', invoiceController.generatePDF);

// Routes לתשלום
router.post('/:id/mark-paid', invoiceController.markAsPaid);

// Routes לתזכורות
router.post('/:id/reminders', invoiceController.addReminder);
router.post('/:id/send-reminder', invoiceController.sendReminder);

module.exports = router;

