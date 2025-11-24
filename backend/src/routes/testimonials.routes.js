const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public route
router.get('/public', testimonialController.getPublicTestimonials);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .get(testimonialController.getAllTestimonials)
  .post(upload.single('image'), testimonialController.createTestimonial);

router.patch('/reorder', testimonialController.reorderTestimonials);

router.route('/:id')
  .get(testimonialController.getTestimonialById)
  .put(upload.single('image'), testimonialController.updateTestimonial)
  .delete(testimonialController.deleteTestimonial);

// Admin only routes
router.patch('/:id/status', authorize('admin', 'super_admin'), testimonialController.updateTestimonialStatus);

module.exports = router;




