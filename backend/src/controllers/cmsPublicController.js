const PageContent = require('../models/PageContent');
const Article = require('../models/Article');
const ClientLogo = require('../models/ClientLogo');
const Testimonial = require('../models/Testimonial');
const Client = require('../models/Client');

exports.getPublishedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isVisible: true, status: 'approved' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error in getPublishedTestimonials:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת המלצות', error: error.message });
  }
};

exports.getPublishedPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await PageContent.findOne({ slug: String(slug).toLowerCase() }).lean();
    if (!page || !page.published) {
      return res.status(404).json({ success: false, message: 'דף לא נמצא' });
    }
    return res.json({
      success: true,
      data: {
        slug: page.slug,
        seo: page.seo || {},
        content: page.published,
        publishedAt: page.publishedAt || null
      }
    });
  } catch (error) {
    console.error('Error in getPublishedPageBySlug:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת הדף', error: error.message });
  }
};

exports.getPublishedArticles = async (req, res) => {
  try {
    const { category, limit = 20, q } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } }
      ];
    }

    const items = await Article.find(query)
      .select('slug title excerpt category tags coverImage publishedAt seo')
      .sort({ publishedAt: -1, updatedAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 20, 100))
      .lean();

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error in getPublishedArticles:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמרים', error: error.message });
  }
};

exports.getPublishedArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug: String(slug).toLowerCase(), isPublished: true }).lean();
    if (!article) {
      return res.status(404).json({ success: false, message: 'מאמר לא נמצא' });
    }
    return res.json({
      success: true,
      data: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags || [],
        coverImage: article.coverImage || null,
        seo: article.seo || {},
        blocks: article.published?.blocks || [],
        publishedAt: article.publishedAt || null
      }
    });
  } catch (error) {
    console.error('Error in getPublishedArticleBySlug:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מאמר', error: error.message });
  }
};

exports.getPublishedClients = async (req, res) => {
  try {
    const clients = await ClientLogo.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error in getPublishedClients:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת לקוחות', error: error.message });
  }
};

exports.getClientsCount = async (req, res) => {
  try {
    // Count only clients with status 'won' (actual customers)
    const count = await Client.countDocuments({ status: 'won' });
    return res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error in getClientsCount:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בספירת לקוחות', error: error.message });
  }
};

