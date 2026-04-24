#!/usr/bin/env node
/**
 * Generates sitemap-articles.xml at build time by fetching published articles
 * from the backend. Writes to public/sitemap-articles.xml so it ships with the
 * static build. Fails gracefully (empty sitemap) if the backend is unreachable.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const OUTPUT = resolve(PUBLIC_DIR, 'sitemap-articles.xml');
const SITE_URL = 'https://tailorbiz-software.com';

const API_URL = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:5001/api';

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(articles) {
  const urls = articles
    .filter((a) => a.slug)
    .map((a) => {
      const lastmod = a.publishedAt || a.updatedAt;
      const lastmodTag = lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n` : '';
      return `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/blog/${a.slug}`)}</loc>\n${lastmodTag}    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  let articles = [];
  try {
    const res = await fetch(`${API_URL}/public/articles?limit=1000`);
    if (res.ok) {
      const body = await res.json();
      articles = body?.data || [];
      console.log(`[sitemap] Fetched ${articles.length} published articles from ${API_URL}`);
    } else {
      console.warn(`[sitemap] Backend returned ${res.status}, writing empty articles sitemap`);
    }
  } catch (err) {
    console.warn(`[sitemap] Could not reach ${API_URL}: ${err.message}. Writing empty articles sitemap.`);
  }

  writeFileSync(OUTPUT, buildSitemap(articles));
  console.log(`[sitemap] Wrote ${OUTPUT}`);
}

main();
