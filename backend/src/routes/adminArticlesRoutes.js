const express = require('express');
const router = express.Router();
const { protect, requireModule } = require('../middleware/auth.middleware');
const adminArticlesController = require('../controllers/adminArticlesController');

router.use(protect);
router.use(requireModule('cms'));

router.get('/', adminArticlesController.listArticles);
router.post('/', adminArticlesController.createArticle);
router.get('/:id', adminArticlesController.getArticle);
router.put('/:id', adminArticlesController.updateArticle);
router.delete('/:id', adminArticlesController.deleteArticle);
router.post('/:id/publish', adminArticlesController.publish);
router.post('/:id/unpublish', adminArticlesController.unpublish);
router.post('/:id/rollback/:versionIndex', adminArticlesController.rollback);

module.exports = router;

