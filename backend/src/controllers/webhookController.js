const Article = require('../models/Article');

/**
 * Generate a URL-safe slug from a title string.
 * Supports Hebrew characters by transliterating common letters,
 * but falls back to a timestamp-based slug for non-Latin titles.
 */
function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '') // keep alphanumeric, spaces, Hebrew, hyphens
    .replace(/[\s_]+/g, '-')               // spaces/underscores → hyphens
    .replace(/-+/g, '-')                   // collapse multiple hyphens
    .replace(/^-|-$/g, '');                // trim leading/trailing hyphens

  // If slug is empty or only Hebrew (no Latin), use a timestamp prefix
  if (!slug || !/[a-z0-9]/.test(slug)) {
    slug = `article-${Date.now()}`;
  }

  return slug;
}

/**
 * POST /api/webhook/article
 * Receives an article from an external AI agent and saves it as a draft.
 */
exports.createArticleFromWebhook = async (req, res) => {
  try {
    const { title, content, status, excerpt, category, tags, seo } = req.body;

    // --- Validation ---
    const errors = [];
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('title is required and must be a non-empty string');
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      errors.push('content is required and must be a non-empty string');
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // --- Build article document ---
    const baseSlug = generateSlug(title.trim());

    // Ensure slug uniqueness by appending a short suffix if needed
    let slug = baseSlug;
    const existing = await Article.findOne({ slug }).lean();
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const isPublished = status === 'published';

    // Store the content as a paragraph block in the draft (or published) blocks array
    const blocks = [
      { type: 'paragraph', data: { text: content.trim() } }
    ];

    const articleData = {
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() || '',
      category: category?.trim() || 'general',
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()) : [],
      seo: {
        title: seo?.title?.trim() || title.trim(),
        description: seo?.description?.trim() || ''
      },
      draft: { blocks },
      isPublished,
      ...(isPublished && {
        published: { blocks },
        publishedAt: new Date()
      })
    };

    const article = await Article.create(articleData);

    return res.status(201).json({
      success: true,
      message: isPublished ? 'Article published successfully' : 'Article saved as draft',
      data: {
        id: article._id,
        slug: article.slug,
        isPublished: article.isPublished
      }
    });
  } catch (error) {
    // Handle duplicate slug (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An article with a similar title already exists',
      });
    }

    console.error('[Webhook] Error creating article:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};
