const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

function generateSlug(title) {
  let slug = title
    .toLowerCase().trim()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug || !/[a-z0-9]/.test(slug)) slug = `article-${Date.now()}`;
  return slug;
}

router.post('/article', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { title, content, status } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'כותרת נדרשת' });
    let slug = generateSlug(title.trim());
    const existing = await Article.findOne({ slug }).lean();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    const blocks = content?.trim() ? [{ type: 'paragraph', data: { text: content.trim() } }] : [];
    const isPublished = status === 'published';
    const article = await Article.create({
      slug, title: title.trim(), excerpt: '', category: 'general', tags: [],
      coverImage: null, seo: { title: title.trim(), description: '' },
      draft: { blocks }, isPublished,
      ...(isPublished && { publishedAt: new Date(), published: { blocks } }),
    });
    return res.status(201).json({ success: true, data: article });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'slug כבר קיים' });
    console.error('[Webhook] create article error:', err);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת מאמר' });
  }
});

module.exports = router;
