const express = require('express');
const router = express.Router();
const { protect, requireModule } = require('../middleware/auth.middleware');
const adminPagesController = require('../controllers/adminPagesController');

router.use(protect);
router.use(requireModule('cms'));

router.get('/', adminPagesController.listPages);
router.get('/:slug', adminPagesController.getPage);
router.put('/:slug/draft', adminPagesController.upsertDraft);
router.post('/:slug/publish', adminPagesController.publish);
router.post('/:slug/unpublish', adminPagesController.unpublish);
router.post('/:slug/rollback/:versionIndex', adminPagesController.rollback);

module.exports = router;

