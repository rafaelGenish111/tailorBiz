const { Client } = require('@notionhq/client');

// === CRM → Notion mappings ===
const STAGE_TO_NOTION = {
  lead: 'Kickoff',
  assessment: 'Kickoff',
  won: 'ריטיינר פעיל',
  active: 'בפיתוח',
  completed: 'מוכן ללקוח',
  lost: 'Kickoff',
  archived: 'מוכן ללקוח'
};

const PRODUCT_TO_DIVISION = {
  'מערכת SaaS': 'SaaS הדרכות',
  'מערכות AI': 'AI לארגונים',
  'הטמעת בינה מלאכותית בארגון': 'AI לארגונים',
  'קורסים': 'SaaS הדרכות',
  'אפליקציה בהתאמה אישית': 'פרויקט פנימי'
};

// === Notion → CRM mappings (reverse) ===
const NOTION_TO_STAGE = {
  'Kickoff': 'lead',
  'בפיתוח': 'active',
  'QA': 'active',
  'מוכן ללקוח': 'completed',
  'ריטיינר פעיל': 'won'
};

const DIVISION_TO_PRODUCT = {
  'SaaS הדרכות': 'מערכת SaaS',
  'AI לארגונים': 'מערכות AI',
  'פרויקט פנימי': 'אפליקציה בהתאמה אישית'
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
    console.log('[NotionService] Initialized', this.databaseId ? `(DB: ${this.databaseId})` : '(no DB ID)');
  }

  isReady() {
    return this.isConfigured && this.client !== null && this.databaseId !== null;
  }

  // =====================================================
  //  CRM → Notion: Build properties for push
  // =====================================================
  buildProperties(project, client) {
    const clientName = client?.personalInfo?.fullName || 'ללא לקוח';
    const projectName = project.name || client?.businessInfo?.businessName || 'פרויקט ללא שם';

    const notionStatus = STAGE_TO_NOTION[project.stage] || 'Kickoff';

    const properties = {
      'שם לקוח': {
        title: [{ text: { content: clientName } }]
      },
      'שם פרויקט': {
        rich_text: [{ text: { content: projectName } }]
      },
      'סטטוס פרויקט': {
        select: { name: notionStatus }
      },
      'הכנסת הקמה': {
        number: project.financials?.totalValue || 0
      },
      'ריטיינר חודשי': {
        number: project.expectedMrr || 0
      }
    };

    // Division mapping
    const division = PRODUCT_TO_DIVISION[project.productType];
    if (division) {
      properties['חטיבה עסקית'] = { select: { name: division } };
    }

    // Deadline
    if (project.endDate) {
      properties['תאריך יעד למסירה'] = {
        date: { start: new Date(project.endDate).toISOString().split('T')[0] }
      };
    }

    return properties;
  }

  // =====================================================
  //  Notion → CRM: Parse properties from pull
  // =====================================================
  parseNotionProperties(notionPage) {
    const props = notionPage.properties;
    const updates = {};

    // שם לקוח (Title) → _parsedClientName (transient, not persisted)
    const clientNameProp = props['שם לקוח'];
    let parsedClientName = null;
    if (clientNameProp?.title?.[0]?.plain_text) {
      parsedClientName = clientNameProp.title[0].plain_text.trim();
    }

    // שם פרויקט (Rich Text) → name
    const projectNameProp = props['שם פרויקט'];
    if (projectNameProp?.rich_text?.[0]?.plain_text) {
      updates.name = projectNameProp.rich_text[0].plain_text.trim();
    }

    // Backward compatibility: if שם פרויקט is empty but title contains " – ", split it
    if (!updates.name && parsedClientName && parsedClientName.includes(' – ')) {
      const [clientPart, ...projectParts] = parsedClientName.split(' – ');
      parsedClientName = clientPart.trim();
      updates.name = projectParts.join(' – ').trim();
    }

    updates._parsedClientName = parsedClientName;

    // Status → stage
    const statusProp = props['סטטוס פרויקט'];
    if (statusProp?.select?.name) {
      const stage = NOTION_TO_STAGE[statusProp.select.name];
      if (stage) updates.stage = stage;
    }

    // הכנסת הקמה → financials.totalValue
    const setupProp = props['הכנסת הקמה'];
    if (setupProp?.number !== undefined && setupProp.number !== null) {
      updates['financials.totalValue'] = setupProp.number;
    }

    // ריטיינר חודשי → expectedMrr
    const mrrProp = props['ריטיינר חודשי'];
    if (mrrProp?.number !== undefined && mrrProp.number !== null) {
      updates.expectedMrr = mrrProp.number;
    }

    // חטיבה עסקית → productType
    const divisionProp = props['חטיבה עסקית'];
    if (divisionProp?.select?.name) {
      const productType = DIVISION_TO_PRODUCT[divisionProp.select.name];
      if (productType) updates.productType = productType;
    }

    // תאריך יעד למסירה → endDate
    const dateProp = props['תאריך יעד למסירה'];
    if (dateProp?.date?.start) {
      updates.endDate = new Date(dateProp.date.start);
    }

    return updates;
  }

  // =====================================================
  //  CRUD operations
  // =====================================================
  async createPage(project, client) {
    const properties = this.buildProperties(project, client);

    const page = await this.client.pages.create({
      parent: { type: 'database_id', database_id: this.databaseId },
      properties
    });

    return page.id;
  }

  async updatePage(notionPageId, project, client) {
    const properties = this.buildProperties(project, client);

    await this.client.pages.update({
      page_id: notionPageId,
      properties
    });
  }

  /**
   * Query database for recently edited pages using search API.
   * @param {string} sinceISO - ISO timestamp to filter pages edited after
   * @returns {Array} Notion pages with properties
   */
  async queryRecentlyEdited(sinceISO) {
    // Use search API to find pages in our database, then filter by edit time
    const response = await this.client.search({
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' }
    });

    const sinceTime = new Date(sinceISO).getTime();

    // Filter: only pages from our database, edited after sinceISO
    const filtered = response.results.filter(page => {
      if (page.parent?.database_id?.replace(/-/g, '') !== this.databaseId.replace(/-/g, '')) return false;
      return new Date(page.last_edited_time).getTime() > sinceTime;
    });

    // Search API doesn't return full properties, so fetch each page
    const fullPages = [];
    for (const page of filtered) {
      try {
        const fullPage = await this.client.pages.retrieve({ page_id: page.id });
        fullPages.push(fullPage);
      } catch (err) {
        console.warn(`[NotionService] Failed to retrieve page ${page.id}:`, err.message);
      }
    }

    return fullPages;
  }
}

const notionService = new NotionService();
module.exports = notionService;
