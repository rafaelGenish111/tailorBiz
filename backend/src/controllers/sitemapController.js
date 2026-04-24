const Article = require('../models/Article');

const SITE_URL = process.env.SITE_URL || 'https://tailorbiz-software.com';

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

exports.getArticlesSitemap = async (req, res) => {
  try {
    const articles = await Article.find({ isPublished: true })
      .select('slug publishedAt updatedAt')
      .sort({ publishedAt: -1 })
      .lean();

    const urls = articles
      .filter((a) => a.slug)
      .map((a) => {
        const lastmod = a.publishedAt || a.updatedAt;
        const lastmodTag = lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n` : '';
        return `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/blog/${a.slug}`)}</loc>\n${lastmodTag}    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[Sitemap] articles error:', error);
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error/>');
  }
};
