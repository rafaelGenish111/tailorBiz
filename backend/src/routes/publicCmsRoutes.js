const express = require('express');
const router = express.Router();
const cmsPublicController = require('../controllers/cmsPublicController');

// Public CMS endpoints (published content only)
router.get('/pages/:slug', cmsPublicController.getPublishedPageBySlug);
router.get('/articles', cmsPublicController.getPublishedArticles);
router.get('/articles/:slug', cmsPublicController.getPublishedArticleBySlug);
router.get('/clients', cmsPublicController.getPublishedClients);

module.exports = router;

