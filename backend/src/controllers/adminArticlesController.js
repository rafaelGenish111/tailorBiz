const Article = require('../models/Article');

const snapshotArticle = (article, userId) => {
  article.versions.unshift({
    createdBy: userId || null,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    tags: article.tags || [],
    coverImage: article.coverImage || null,
    seo: article.seo || {},
    draft: article.draft || { blocks: [] },
    published: article.published || { blocks: [] },
    isPublished: article.isPublished,
    publishedAt: article.publishedAt || null
  });
  article.versions = article.versions.slice(0, 25);
};

exports.listArticles = async (req, res) => {
  try {
    const { status, q, category } = req.query;
    const query = {};
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;
    if (category) query.category = category;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } }
      ];
    }

    const items = await Article.find(query)
      .select('slug title excerpt category coverImage isPublished publishedAt updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error in listArticles:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמרים', error: error.message });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error in getArticle:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמר', error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const slug = String(req.body.slug || '').toLowerCase().trim();
    if (!slug) return res.status(400).json({ success: false, message: 'slug הוא שדה חובה' });

    const created = await Article.create({
      slug,
      title: req.body.title,
      excerpt: req.body.excerpt || '',
      category: req.body.category || 'general',
      tags: req.body.tags || [],
      coverImage: req.body.coverImage || null,
      seo: req.body.seo || {},
      draft: req.body.draft || { blocks: [] },
      published: { blocks: [] },
      isPublished: false
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error in createArticle:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת מאמר', error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });

    snapshotArticle(article, userId);

    if (req.body.slug) article.slug = String(req.body.slug).toLowerCase().trim();
    if (req.body.title !== undefined) article.title = req.body.title;
    if (req.body.excerpt !== undefined) article.excerpt = req.body.excerpt;
    if (req.body.category !== undefined) article.category = req.body.category;
    if (req.body.tags !== undefined) article.tags = req.body.tags;
    if (req.body.coverImage !== undefined) article.coverImage = req.body.coverImage;
    if (req.body.seo !== undefined) article.seo = req.body.seo;
    if (req.body.draft !== undefined) article.draft = req.body.draft;

    await article.save();
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error in updateArticle:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון מאמר', error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    return res.json({ success: true, message: 'מאמר נמחק' });
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקת מאמר', error: error.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });

    snapshotArticle(article, userId);
    article.published = article.draft || { blocks: [] };
    article.isPublished = true;
    article.publishedAt = new Date();
    await article.save();
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error in publish article:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בפרסום מאמר', error: error.message });
  }
};

exports.unpublish = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });

    snapshotArticle(article, userId);
    article.isPublished = false;
    article.publishedAt = null;
    await article.save();
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error in unpublish article:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהורדת מאמר מפרסום', error: error.message });
  }
};

exports.rollback = async (req, res) => {
  try {
    const versionIdx = parseInt(req.params.versionIndex, 10);
    const userId = req.user?.id || req.user?._id || null;

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    if (Number.isNaN(versionIdx) || versionIdx < 0 || versionIdx >= article.versions.length) {
      return res.status(400).json({ success: false, message: 'גרסה לא תקינה' });
    }

    snapshotArticle(article, userId);
    const v = article.versions[versionIdx];

    article.slug = v.slug ? String(v.slug).toLowerCase().trim() : article.slug;
    article.title = v.title || article.title;
    article.excerpt = v.excerpt || '';
    article.category = v.category || 'general';
    article.tags = v.tags || [];
    article.coverImage = v.coverImage ?? null;
    article.seo = v.seo || {};
    article.draft = v.draft || { blocks: [] };
    article.published = v.published || { blocks: [] };
    article.isPublished = Boolean(v.isPublished);
    article.publishedAt = v.publishedAt || null;

    await article.save();
    return res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error in rollback article:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשחזור גרסה', error: error.message });
  }
};

