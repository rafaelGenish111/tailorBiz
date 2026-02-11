const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');

// Webhook לקבלת הודעות נכנסות (לא דורש אימות)
router.post('/webhook', whatsappController.handleWebhook);
router.get('/webhook', whatsappController.verifyWebhook); // לאימות Webhook

// כל ה-routes האחרים דורשים אימות (leads/clients/settings - כל משתמש באדמין)
router.use(protect);
router.use(requireAnyModule(['leads', 'clients', 'settings']));

// שליחת הודעות
router.post('/send-message', whatsappController.sendMessage);
router.post('/send-template', whatsappController.sendTemplate);

// שליחה מרובה (broadcast)
router.get('/bulk/preview', whatsappController.previewBulk);
router.post('/bulk/send', whatsappController.sendBulk);

// שיחות
router.get('/conversations', whatsappController.getConversations);
router.get('/conversations/:clientId', whatsappController.getClientConversation);

// סטטוס חיבור
router.get('/status', whatsappController.getConnectionStatus);
// QR code (לצפייה בדפדפן; נדרש אימות)
router.get('/qr', whatsappController.getQrCode);
// QR כתמונה (SVG) לסריקה נוחה בדפדפן; נדרש אימות
router.get('/qr.svg', whatsappController.getQrSvg);

// איתחול שירות WhatsApp
router.post('/restart', whatsappController.restart);

module.exports = router;











