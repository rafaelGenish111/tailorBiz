const Article = require('../models/Article');

/**
 * Generate a URL-safe slug from a title string.
 */
function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug || !/[a-z0-9]/.test(slug)) {
    slug = `article-${Date.now()}`;
  }
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

// GET /admin/articles
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, q, status } = req.query;
    const query = {};

    if (status === 'published') query.isPublished = true;
    else if (status === 'draft') query.isPublished = false;

    if (category) query.category = category;
    if (q) {
      const escaped = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { excerpt: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const lim = Math.min(parseInt(limit, 10) || 50, 200);

    const [items, total] = await Promise.all([
      Article.find(query)
        .select('slug title excerpt category tags coverImage isPublished publishedAt createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Article.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { total, page: parseInt(page, 10), limit: lim },
    });
  } catch (error) {
    console.error('[AdminArticles] list error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמרים' });
  }
};

// GET /admin/articles/:id
exports.getById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('[AdminArticles] getById error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמר' });
  }
};

// POST /admin/articles
exports.create = async (req, res) => {
  try {
    const { title, excerpt, category, tags, coverImage, seo, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'כותרת נדרשת' });
    }

    // Generate unique slug
    let slug = generateSlug(title.trim());
    const existing = await Article.findOne({ slug }).lean();
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Parse HTML from rich text editor into structured blocks
    const blocks = content?.trim() ? htmlToBlocks(content) : [];

    const article = await Article.create({
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() || '',
      category: category?.trim() || 'general',
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || null,
      seo: {
        title: seo?.title?.trim() || title.trim(),
        description: seo?.description?.trim() || '',
      },
      draft: { blocks },
      isPublished: false,
    });

    return res.status(201).json({ success: true, data: article });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'מאמר עם slug דומה כבר קיים' });
    }
    console.error('[AdminArticles] create error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת מאמר' });
  }
};

// PUT /admin/articles/:id
exports.update = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }

    const { title, excerpt, category, tags, coverImage, seo, content } = req.body;

    if (title !== undefined) article.title = title.trim();
    if (excerpt !== undefined) article.excerpt = excerpt?.trim() || '';
    if (category !== undefined) article.category = category?.trim() || 'general';
    if (tags !== undefined) article.tags = Array.isArray(tags) ? tags : [];
    if (coverImage !== undefined) article.coverImage = coverImage || null;
    if (seo !== undefined) {
      article.seo = {
        title: seo?.title?.trim() || article.title,
        description: seo?.description?.trim() || '',
      };
    }

    // Update draft blocks from HTML content
    if (content !== undefined) {
      const blocks = content?.trim() ? htmlToBlocks(content) : [];
      article.draft = { blocks };
    }

    await article.save();
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('[AdminArticles] update error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון מאמר' });
  }
};

// DELETE /admin/articles/:id
exports.delete = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }
    return res.json({ success: true, message: 'מאמר נמחק' });
  } catch (error) {
    console.error('[AdminArticles] delete error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקת מאמר' });
  }
};

// POST /admin/articles/:id/publish
exports.publish = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }

    // Save current state as a version before publishing
    article.versions.push({
      createdAt: new Date(),
      createdBy: req.user?._id || null,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      coverImage: article.coverImage,
      seo: article.seo,
      draft: article.draft,
      published: article.published,
      isPublished: article.isPublished,
      publishedAt: article.publishedAt,
    });

    // Copy draft to published
    article.published = { blocks: [...(article.draft?.blocks || [])] };
    article.isPublished = true;
    article.publishedAt = new Date();

    await article.save();
    return res.json({ success: true, data: article, message: 'מאמר פורסם בהצלחה' });
  } catch (error) {
    console.error('[AdminArticles] publish error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בפרסום מאמר' });
  }
};

// POST /admin/articles/:id/unpublish
exports.unpublish = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }

    article.isPublished = false;
    await article.save();
    return res.json({ success: true, data: article, message: 'מאמר הוסר מפרסום' });
  } catch (error) {
    console.error('[AdminArticles] unpublish error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהסרת פרסום' });
  }
};

// POST /admin/articles/:id/rollback/:versionIndex
exports.rollback = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }

    const idx = parseInt(req.params.versionIndex, 10);
    const version = article.versions?.[idx];
    if (!version) {
      return res.status(404).json({ success: false, message: 'גרסה לא נמצאה' });
    }

    article.title = version.title;
    article.excerpt = version.excerpt;
    article.category = version.category;
    article.tags = version.tags;
    article.coverImage = version.coverImage;
    article.seo = version.seo;
    article.draft = version.draft;

    await article.save();
    return res.json({ success: true, data: article, message: 'שוחזר לגרסה קודמת' });
  } catch (error) {
    console.error('[AdminArticles] rollback error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשחזור גרסה' });
  }
};
