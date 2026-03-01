const Project = require('../models/Project');
const Client = require('../models/Client');
const notionService = require('./notionService');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

class NotionSyncService {
  constructor() {
    this.enabled = false;
  }

  initialize() {
    notionService.initialize();
    this.enabled = notionService.isReady() &&
      process.env.ENABLE_NOTION_SYNC !== 'false';

    if (this.enabled) {
      console.log('[NotionSync] Enabled');
    } else {
      console.log('[NotionSync] Disabled');
    }
  }

  /**
   * נקודת כניסה עיקרית. Fire-and-forget - לעולם לא זורקת שגיאה.
   * נקראת אחרי כל create/update של פרויקט.
   */
  syncProject(projectId) {
    if (!this.enabled) return;

    setImmediate(() => {
      this._syncWithRetry(projectId, 0).catch(err => {
        console.error(`[NotionSync] Unhandled error for project ${projectId}:`, err.message);
      });
    });
  }

  async _syncWithRetry(projectId, attempt) {
    try {
      await this._doSync(projectId);
    } catch (err) {
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[NotionSync] Retry ${attempt + 1}/${MAX_RETRIES} for project ${projectId} ` +
          `in ${delay}ms. Error: ${err.message}`
        );
        await new Promise(r => setTimeout(r, delay));
        return this._syncWithRetry(projectId, attempt + 1);
      }
      console.error(
        `[NotionSync] Failed after ${MAX_RETRIES} attempts for project ${projectId}:`,
        err.message
      );
    }
  }

  async _doSync(projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) {
      console.warn(`[NotionSync] Project ${projectId} not found, skipping`);
      return;
    }

    let client = null;
    if (project.clientId) {
      client = await Client.findById(project.clientId)
        .select('personalInfo.fullName businessInfo.businessName')
        .lean();
    }

    if (project.notionPageId) {
      console.log(`[NotionSync] Updating page ${project.notionPageId} for project ${projectId}`);
      await notionService.updatePage(project.notionPageId, project, client);
    } else {
      console.log(`[NotionSync] Creating Notion page for project ${projectId}`);
      const pageId = await notionService.createPage(project, client);

      await Project.findByIdAndUpdate(
        projectId,
        { $set: { notionPageId: pageId } },
        { new: false }
      );
      console.log(`[NotionSync] Stored notionPageId ${pageId} for project ${projectId}`);
    }
  }

  /**
   * סנכרון כל הפרויקטים (backfill).
   * משמש את endpoint ה-admin.
   */
  async syncAll() {
    if (!this.enabled) {
      console.warn('[NotionSync] syncAll called but service is disabled');
      return { synced: 0, failed: 0 };
    }

    const projects = await Project.find({}).select('_id').lean();
    let synced = 0;
    let failed = 0;

    for (const project of projects) {
      try {
        await this._doSync(project._id.toString());
        synced++;
      } catch (err) {
        failed++;
        console.error(`[NotionSync] syncAll failed for ${project._id}:`, err.message);
      }
    }

    return { synced, failed, total: projects.length };
  }
}

const notionSyncService = new NotionSyncService();
module.exports = notionSyncService;
