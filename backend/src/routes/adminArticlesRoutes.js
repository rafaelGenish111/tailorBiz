const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/adminArticlesController');

// All routes require authentication + admin role
router.use(protect, authorize('admin', 'super_admin'));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.post('/:id/publish', ctrl.publish);
router.post('/:id/unpublish', ctrl.unpublish);
router.post('/:id/rollback/:versionIndex', ctrl.rollback);

module.exports = router;
