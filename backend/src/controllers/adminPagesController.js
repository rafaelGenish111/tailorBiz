const PageContent = require('../models/PageContent');

const snapshotPage = (page, userId) => {
  page.versions.unshift({
    createdBy: userId || null,
    draft: page.draft,
    published: page.published,
    seo: page.seo || {}
  });
  // keep last 25
  page.versions = page.versions.slice(0, 25);
};

exports.listPages = async (req, res) => {
  try {
    const pages = await PageContent.find({})
      .select('slug seo publishedAt updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error in listPages:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת דפים', error: error.message });
  }
};

exports.getPage = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const page = await PageContent.findOne({ slug }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'דף לא נמצא' });
    return res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error in getPage:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת דף', error: error.message });
  }
};

exports.upsertDraft = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const userId = req.user?.id || req.user?._id || null;

    const page = await PageContent.findOne({ slug });
    if (!page) {
      const created = await PageContent.create({
        slug,
        seo: req.body.seo || {},
        draft: req.body.draft || {},
        published: null
      });
      return res.status(201).json({ success: true, data: created });
    }

    snapshotPage(page, userId);
    if (req.body.seo) page.seo = req.body.seo;
    if (req.body.draft !== undefined) page.draft = req.body.draft;
    await page.save();
    return res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error in upsertDraft:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשמירת טיוטה', error: error.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const userId = req.user?.id || req.user?._id || null;
    const page = await PageContent.findOne({ slug });
    if (!page) return res.status(404).json({ success: false, message: 'דף לא נמצא' });

    snapshotPage(page, userId);
    page.published = page.draft || {};
    page.publishedAt = new Date();
    await page.save();
    return res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error in publish page:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בפרסום דף', error: error.message });
  }
};

exports.unpublish = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const userId = req.user?.id || req.user?._id || null;
    const page = await PageContent.findOne({ slug });
    if (!page) return res.status(404).json({ success: false, message: 'דף לא נמצא' });

    snapshotPage(page, userId);
    page.published = null;
    page.publishedAt = null;
    await page.save();
    return res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error in unpublish page:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהורדת דף מפרסום', error: error.message });
  }
};

exports.rollback = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const versionIdx = parseInt(req.params.versionIndex, 10);
    const userId = req.user?.id || req.user?._id || null;

    const page = await PageContent.findOne({ slug });
    if (!page) return res.status(404).json({ success: false, message: 'דף לא נמצא' });
    if (Number.isNaN(versionIdx) || versionIdx < 0 || versionIdx >= page.versions.length) {
      return res.status(400).json({ success: false, message: 'גרסה לא תקינה' });
    }

    snapshotPage(page, userId);
    const v = page.versions[versionIdx];
    page.draft = v.draft || {};
    page.published = v.published ?? null;
    page.seo = v.seo || {};
    page.publishedAt = v.published ? (v.publishedAt || page.publishedAt || new Date()) : null;
    await page.save();
    return res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error in rollback page:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשחזור גרסה', error: error.message });
  }
};

