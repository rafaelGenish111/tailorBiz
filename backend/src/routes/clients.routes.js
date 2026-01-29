const express = require('express');
const router = express.Router();
// Split controllers for better organization
const clientCrud = require('../controllers/client-crud');
const clientInteractions = require('../controllers/client-interactions');
const clientAssessment = require('../controllers/client-assessment');
const clientPayments = require('../controllers/client-payments');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const uploadContract = require('../middleware/contractUpload.middleware');

// Validation middleware
const validateClient = [
  body('personalInfo.fullName').trim().notEmpty().withMessage('שם מלא הוא שדה חובה'),
  body('personalInfo.phone').trim().notEmpty().withMessage('מספר טלפון הוא שדה חובה'),
  body('businessInfo.businessName').trim().notEmpty().withMessage('שם העסק הוא שדה חובה'),
  body('leadSource').isIn(['whatsapp', 'website_form', 'referral', 'cold_call', 'social_media', 'linkedin', 'facebook', 'google_ads', 'other'])
    .withMessage('מקור ליד לא תקין')
];

// כל ה-routes דורשים אימות
router.use(protect);
router.use(requireAnyModule(['clients', 'leads']));

// ============================================================================
// Statistics Routes - client-payments.js
// ============================================================================
router.get('/stats/overview', clientPayments.getOverviewStats);
router.get('/stats/pipeline', clientPayments.getPipelineStats);
router.get('/stats/morning-focus', clientPayments.getMorningFocus);

// ============================================================================
// CRUD Routes - client-crud.js
// ============================================================================
router.route('/')
  .get(clientCrud.getAllClients)
  .post(validateClient, clientCrud.createClient);

router.route('/:id')
  .get(clientCrud.getClientById)
  .put(clientCrud.updateClient)
  .patch(clientCrud.updateClient)
  .delete(clientCrud.deleteClient);

// המרת ליד ללקוח (סגירת עסקה)
router.post('/:id/convert', uploadContract.single('contract'), clientCrud.convertLeadToClient);

// ============================================================================
// Contract & Assessment Routes - client-assessment.js
// ============================================================================
router
  .route('/:id/contract')
  .get(clientAssessment.getContract)
  .post(uploadContract.single('contract'), clientAssessment.uploadContract);

router.route('/:id/assessment')
  .get(clientAssessment.getAssessmentForm)
  .post(clientAssessment.fillAssessmentForm);

// ============================================================================
// Interactions, Orders & Tasks Routes - client-interactions.js
// ============================================================================
router.route('/:id/interactions')
  .get(clientInteractions.getInteractions)
  .post(clientInteractions.addInteraction);

router.route('/:id/interactions/:interactionId')
  .put(clientInteractions.updateInteraction)
  .delete(clientInteractions.deleteInteraction);

router.route('/:id/orders')
  .get(clientInteractions.getOrders)
  .post(clientInteractions.createOrder);

router.route('/:id/orders/:orderId')
  .put(clientInteractions.updateOrder);

router.route('/:id/tasks')
  .get(clientInteractions.getTasks)
  .post(clientInteractions.createTask);

router.route('/:id/tasks/:taskId')
  .put(clientInteractions.updateTask);

// ============================================================================
// Payment Plans & Invoices Routes - client-payments.js
// ============================================================================
router.route('/:id/payment-plan')
  .post(clientPayments.createPaymentPlan);

router.route('/:id/payment-plan/installments/:installmentId')
  .put(clientPayments.updateInstallment);

router.route('/:id/invoices')
  .get(clientPayments.getInvoices)
  .post(clientPayments.createInvoice);

module.exports = router;

