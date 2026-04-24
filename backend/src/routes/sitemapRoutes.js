const express = require('express');
const router = express.Router();
const { getArticlesSitemap } = require('../controllers/sitemapController');

router.get('/articles.xml', getArticlesSitemap);
router.get('/sitemap-articles.xml', getArticlesSitemap);

module.exports = router;
