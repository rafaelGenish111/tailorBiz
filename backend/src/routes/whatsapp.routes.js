const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect, requireModule } = require('../middleware/auth.middleware');

// Webhook לקבלת הודעות נכנסות (לא דורש אימות)
router.post('/webhook', whatsappController.handleWebhook);
router.get('/webhook', whatsappController.verifyWebhook); // לאימות Webhook

// כל ה-routes האחרים דורשים אימות
router.use(protect);
router.use(requireModule('marketing'));

// שליחת הודעות
router.post('/send-message', whatsappController.sendMessage);
router.post('/send-template', whatsappController.sendTemplate);

// שיחות
router.get('/conversations', whatsappController.getConversations);
router.get('/conversations/:clientId', whatsappController.getClientConversation);

// סטטוס חיבור
router.get('/status', whatsappController.getConnectionStatus);

module.exports = router;











