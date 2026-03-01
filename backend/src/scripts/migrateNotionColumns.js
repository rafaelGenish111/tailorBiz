/**
 * Migration script: Split combined Notion title column into separate columns.
 *
 * Old format: "שם לקוח – שם פרויקט" in title column
 * New format: "שם לקוח" in title column, "שם פרויקט" in rich_text column
 *
 * Usage: node backend/src/scripts/migrateNotionColumns.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Client } = require('@notionhq/client');

const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_TOKEN || !NOTION_DATABASE_ID) {
  console.error('Missing NOTION_API_TOKEN or NOTION_DATABASE_ID in .env');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_TOKEN });

const RATE_LIMIT_MS = 350;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getAllPages() {
  // Use search API (same approach as notionService) since databases.query
  // may not be available in this Notion client version
  const response = await notion.search({
    filter: { property: 'object', value: 'page' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' }
  });

  const dbIdNorm = NOTION_DATABASE_ID.replace(/-/g, '');

  // Filter only pages from our database
  const pages = response.results.filter(page =>
    page.parent?.database_id?.replace(/-/g, '') === dbIdNorm
  );

  // Fetch full page data (search doesn't return all properties)
  const fullPages = [];
  for (const page of pages) {
    try {
      const full = await notion.pages.retrieve({ page_id: page.id });
      fullPages.push(full);
      await sleep(RATE_LIMIT_MS);
    } catch (err) {
      console.warn(`  WARN: Failed to retrieve page ${page.id}: ${err.message}`);
    }
  }

  return fullPages;
}

async function migratePage(page) {
  const props = page.properties;

  // Get current title
  const titleProp = props['שם לקוח'];
  const titleText = titleProp?.title?.[0]?.plain_text || '';

  // Check if "שם פרויקט" already has content
  const projectNameProp = props['שם פרויקט'];
  const existingProjectName = projectNameProp?.rich_text?.[0]?.plain_text || '';

  // If project name column already has content, skip
  if (existingProjectName) {
    console.log(`  SKIP (already migrated): "${titleText}" → project: "${existingProjectName}"`);
    return false;
  }

  // Check if title contains the " – " separator
  if (!titleText.includes(' – ')) {
    console.log(`  SKIP (no separator): "${titleText}"`);
    return false;
  }

  // Split: "שם לקוח – שם פרויקט"
  const [clientPart, ...projectParts] = titleText.split(' – ');
  const clientName = clientPart.trim();
  const projectName = projectParts.join(' – ').trim();

  if (!clientName || !projectName) {
    console.log(`  SKIP (empty after split): client="${clientName}" project="${projectName}"`);
    return false;
  }

  // Update the page: set title to client name only, add project name
  await notion.pages.update({
    page_id: page.id,
    properties: {
      'שם לקוח': {
        title: [{ text: { content: clientName } }]
      },
      'שם פרויקט': {
        rich_text: [{ text: { content: projectName } }]
      }
    }
  });

  console.log(`  MIGRATED: "${titleText}" → client: "${clientName}" | project: "${projectName}"`);
  return true;
}

async function main() {
  console.log('=== Notion Column Migration ===');
  console.log(`Database: ${NOTION_DATABASE_ID}\n`);

  const pages = await getAllPages();
  console.log(`Found ${pages.length} pages\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of pages) {
    try {
      const didMigrate = await migratePage(page);
      if (didMigrate) migrated++;
      else skipped++;
    } catch (err) {
      errors++;
      console.error(`  ERROR (${page.id}): ${err.message}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\n=== Done ===`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
