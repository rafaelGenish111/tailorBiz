const express = require('express');
const router = express.Router();

const adminUsersController = require('../controllers/adminUsersController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/', adminUsersController.list);
router.post('/', adminUsersController.create);
router.put('/:id', adminUsersController.update);
router.post('/:id/reset-password', adminUsersController.resetPassword);

module.exports = router;

