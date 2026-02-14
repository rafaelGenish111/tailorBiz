const express = require('express');
const router = express.Router();
const cmsPublicController = require('../controllers/cmsPublicController');
const siteSettingsController = require('../controllers/siteSettingsController');
const publicLeadController = require('../controllers/publicLeadController');
const publicChatController = require('../controllers/publicChatController');
const { body } = require('express-validator');

// Public CMS endpoints (published content only)
router.get('/pages/:slug', cmsPublicController.getPublishedPageBySlug);
router.get('/articles', cmsPublicController.getPublishedArticles);
router.get('/articles/:slug', cmsPublicController.getPublishedArticleBySlug);
router.get('/clients', cmsPublicController.getPublishedClients);
router.get('/clients/count', cmsPublicController.getClientsCount);
router.get('/testimonials', cmsPublicController.getPublishedTestimonials);
router.get('/site-settings', siteSettingsController.getPublic);

// Website forms -> Leads (public endpoint)
router.post(
  '/leads',
  [
    body('name').trim().notEmpty().withMessage('שם מלא הוא שדה חובה'),
    body('phone').trim().notEmpty().withMessage('טלפון הוא שדה חובה'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('אימייל לא תקין'),
    body('company').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('שם העסק ארוך מדי'),
    body('message').optional({ checkFalsy: true }).trim().isLength({ max: 5000 }).withMessage('הודעה ארוכה מדי'),
    body('leadSource').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('מקור ליד ארוך מדי'),
  ],
  publicLeadController.submitWebsiteLead
);

// Website AI Chat (public)
router.post('/chat/init', publicChatController.initChat);
router.post(
  '/chat/message',
  [
    body('sessionId').trim().notEmpty().withMessage('sessionId is required'),
    body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message is required (max 2000 chars)')
  ],
  publicChatController.sendMessage
);

module.exports = router;

