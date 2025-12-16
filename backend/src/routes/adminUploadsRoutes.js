const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const adminUploadsController = require('../controllers/adminUploadsController');

router.use(protect);

// חתימה להעלאה ישירה ל-Cloudinary (GET /signature?folder=...)
router.get('/signature', adminUploadsController.getCloudinarySignature);

// multipart/form-data: file=<image>
router.post('/image', upload.single('file'), adminUploadsController.uploadImage);

module.exports = router;

