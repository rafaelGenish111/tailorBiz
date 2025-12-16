const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth.middleware');

// Setup / Bootstrap
router.get('/bootstrap-needed', authController.bootstrapNeeded);
router.post('/bootstrap', authController.bootstrap);

// Session
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;

