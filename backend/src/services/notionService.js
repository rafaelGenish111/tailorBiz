const { Client } = require('@notionhq/client');

// מיפוי סטטוסים מה-CRM לערכים ב-Notion
const STAGE_TO_NOTION_STATUS = {
  lead: 'Kickoff',
  assessment: 'Kickoff',
  proposal: 'Kickoff',
  contract: 'Kickoff',
  active: 'In Progress',
  completed: 'QA',
  maintenance: 'Retainer',
  archived: 'Ready for Client'
};

class NotionService {
  constructor() {
    this.client = null;
    this.databaseId = null;
    this.isConfigured = false;
  }

  initialize() {
    const token = process.env.NOTION_API_TOKEN;
    if (!token) {
      console.warn('[NotionService] Disabled: NOTION_API_TOKEN not set');
      return;
    }

    this.client = new Client({ auth: token });
    this.databaseId = process.env.NOTION_DATABASE_ID || null;
    this.isConfigured = true;
    console.log('[NotionService] Initialized');
  }

  isReady() {
    return this.isConfigured && this.client !== null;
  }

  /**
   * יצירת Database ב-Notion בהפעלה ראשונה (אם NOTION_DATABASE_ID ריק).
   * דורש NOTION_PARENT_PAGE_ID כדי לדעת איפה ליצור.
   */
  async ensureDatabase() {
    if (this.databaseId) return this.databaseId;

    const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
    if (!parentPageId) {
      throw new Error(
        'NOTION_DATABASE_ID is not set and NOTION_PARENT_PAGE_ID is not set. ' +
        'Cannot auto-create Notion database. Set one of these in backend/.env'
      );
    }

    console.log('[NotionService] Creating Notion database for first time...');

    const db = await this.client.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'פרויקטי BizFlow CRM' } }],
      initial_data_source: {
        properties: {
          'שם הפרויקט': { type: 'title', title: {} },
          'לקוח': { type: 'rich_text', rich_text: {} },
          'סטטוס פרויקט': {
            type: 'select',
            select: {
              options: [
                { name: 'Kickoff', color: 'yellow' },
                { name: 'In Progress', color: 'blue' },
                { name: 'QA', color: 'orange' },
                { name: 'Ready for Client', color: 'green' },
                { name: 'Retainer', color: 'purple' }
              ]
            }
          },
          'סוג המוצר': {
            type: 'select',
            select: {
              options: [
                { name: 'מוצר מדף SaaS', color: 'blue' },
                { name: 'הטמעת AI', color: 'green' }
              ]
            }
          },
          'שווי העסקה': { type: 'number', number: { format: 'number' } },
          'MRR צפוי': { type: 'number', number: { format: 'number' } },
          'תאריכי עבודה': { type: 'date', date: {} }
        }
      }
    });

    this.databaseId = db.id;
    console.log('[NotionService] Database created:', db.id);
    console.log('');
    console.log('========================================');
    console.log('ACTION REQUIRED: Add to backend/.env:');
    console.log(`NOTION_DATABASE_ID=${db.id}`);
    console.log('========================================');
    console.log('');

    return this.databaseId;
  }

  /**
   * בניית אובייקט properties עבור Notion API מנתוני פרויקט ולקוח.
   */
  buildProperties(project, client) {
    const projectName = project.name ||
      client?.businessInfo?.businessName ||
      'פרויקט ללא שם';

    const clientName = client?.personalInfo?.fullName || '';

    const notionStatus = STAGE_TO_NOTION_STATUS[project.stage] ||
      STAGE_TO_NOTION_STATUS[project.status] ||
      'Kickoff';

    const properties = {
      'שם הפרויקט': {
        title: [{ text: { content: projectName } }]
      },
      'לקוח': {
        rich_text: [{ text: { content: clientName } }]
      },
      'סטטוס פרויקט': {
        select: { name: notionStatus }
      },
      'שווי העסקה': {
        number: project.financials?.totalValue || 0
      },
      'MRR צפוי': {
        number: project.expectedMrr || 0
      }
    };

    if (project.productType) {
      properties['סוג המוצר'] = { select: { name: project.productType } };
    }

    if (project.endDate) {
      properties['תאריכי עבודה'] = {
        date: {
          start: new Date(project.startDate || project.endDate).toISOString().split('T')[0],
          end: new Date(project.endDate).toISOString().split('T')[0]
        }
      };
    } else if (project.startDate) {
      properties['תאריכי עבודה'] = {
        date: { start: new Date(project.startDate).toISOString().split('T')[0] }
      };
    }

    return properties;
  }

  /**
   * יצירת דף חדש (שורה) ב-Notion Database.
   * @returns {string} Notion page ID
   */
  async createPage(project, client) {
    const dbId = await this.ensureDatabase();
    const properties = this.buildProperties(project, client);

    const page = await this.client.pages.create({
      parent: { type: 'database_id', database_id: dbId },
      properties
    });

    return page.id;
  }

  /**
   * עדכון דף קיים ב-Notion.
   */
  async updatePage(notionPageId, project, client) {
    const properties = this.buildProperties(project, client);

    await this.client.pages.update({
      page_id: notionPageId,
      properties
    });
  }
}

const notionService = new NotionService();
module.exports = notionService;
