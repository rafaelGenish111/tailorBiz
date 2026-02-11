#!/usr/bin/env node
/**
 * Downloads Heebo font (TTF) from Google Fonts GitHub for PDF generation
 * Run: node backend/scripts/download-heebo-font.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/heebo/Heebo%5Bwght%5D.ttf';
const FONTS_DIR = path.join(__dirname, '..', 'src', 'assets', 'fonts');
const OUTPUT_FILE = path.join(FONTS_DIR, 'Heebo-Variable.ttf');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  if (fs.existsSync(OUTPUT_FILE)) {
    console.log('Heebo font already exists:', OUTPUT_FILE);
    process.exit(0);
  }

  console.log('Downloading Heebo font...');
  const buffer = await download(FONT_URL);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log('Saved:', OUTPUT_FILE);
}

main().catch((err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
