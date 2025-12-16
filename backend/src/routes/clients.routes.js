const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
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

// Routes כלליים
router.get('/stats/overview', clientController.getOverviewStats);
router.get('/stats/pipeline', clientController.getPipelineStats);
router.get('/stats/morning-focus', clientController.getMorningFocus);

router.route('/')
  .get(clientController.getAllClients)
  .post(validateClient, clientController.createClient);

router.route('/:id')
  .get(clientController.getClientById)
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

// המרת ליד ללקוח (סגירת עסקה)
router.post('/:id/convert', uploadContract.single('contract'), clientController.convertLeadToClient);

// חוזה ללקוח/ליד
router
  .route('/:id/contract')
  .get(clientController.getContract)
  .post(uploadContract.single('contract'), clientController.uploadContract);

// Routes לשאלון אפיון
router.route('/:id/assessment')
  .get(clientController.getAssessmentForm)
  .post(clientController.fillAssessmentForm);

// Routes לאינטראקציות
router.route('/:id/interactions')
  .get(clientController.getInteractions)
  .post(clientController.addInteraction);

router.route('/:id/interactions/:interactionId')
  .put(clientController.updateInteraction)
  .delete(clientController.deleteInteraction);

// Routes להזמנות
router.route('/:id/orders')
  .get(clientController.getOrders)
  .post(clientController.createOrder);

router.route('/:id/orders/:orderId')
  .put(clientController.updateOrder);

// Routes לתוכנית תשלומים
router.route('/:id/payment-plan')
  .post(clientController.createPaymentPlan);

router.route('/:id/payment-plan/installments/:installmentId')
  .put(clientController.updateInstallment);

// Routes לחשבוניות
router.route('/:id/invoices')
  .get(clientController.getInvoices)
  .post(clientController.createInvoice);

// Routes למשימות
router.route('/:id/tasks')
  .get(clientController.getTasks)
  .post(clientController.createTask);

router.route('/:id/tasks/:taskId')
  .put(clientController.updateTask);

module.exports = router;

