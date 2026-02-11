const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', notificationsController.getAll);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.remove);

module.exports = router;
