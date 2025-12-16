// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, requireModule } = require('../middleware/auth.middleware');

// כל הנתיבים דורשים אימות
router.use(protect);
router.use(requireModule('tasks_calendar'));

// קבלת התראות
router.get('/', notificationController.getAllNotifications);

// עדכון התראות
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

// מחיקת התראות
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;











