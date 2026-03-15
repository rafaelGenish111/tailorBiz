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

function htmlToBlocks(html) {
  const blocks = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<hr\s*\/?>|<ul\b[^>]*>([\s\S]*?)<\/ul>|<ol\b[^>]*>([\s\S]*?)<\/ol>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const [full, hTag, hContent, pContent, ulContent, olContent] = match;
    if (hTag) {
      const text = hContent.replace(/<[^>]+>/g, '').trim();
      if (text) blocks.push({ type: 'header', data: { text, level: parseInt(hTag[1]) } });
    } else if (pContent !== undefined) {
      const text = pContent.trim();
      if (text) blocks.push({ type: 'paragraph', data: { text } });
    } else if (full.toLowerCase().startsWith('<hr')) {
      blocks.push({ type: 'delimiter', data: {} });
    } else if (ulContent !== undefined) {
      const items = [...ulContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      if (items.length) blocks.push({ type: 'list', data: { style: 'unordered', items } });
    } else if (olContent !== undefined) {
      const items = [...olContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      if (items.length) blocks.push({ type: 'list', data: { style: 'ordered', items } });
    }
  }
  return blocks.length ? blocks : [{ type: 'paragraph', data: { text: html } }];
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
    const blocks = content?.trim() ? htmlToBlocks(content) : [];
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
