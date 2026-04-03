const cron = require('node-cron');
const Project = require('../models/Project');
const Client = require('../models/Client');
const notionService = require('./notionService');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const POLL_INTERVAL = '*/2 * * * *'; // Every 2 minutes

class NotionSyncService {
  constructor() {
    this.enabled = false;
    this.lastPollTime = null;
    this._skipNotionSync = new Set(); // projectIds to skip on next CRM→Notion push
    this.syncStats = {
      lastPullAt: null,
      projectsCreated: 0,
      projectsUpdated: 0,
      errors: [],
      clientNotFound: [] // { clientName, projectName, notionPageId, timestamp }
    };
  }

  initialize() {
    notionService.initialize();
    this.enabled = notionService.isReady() &&
      process.env.ENABLE_NOTION_SYNC !== 'false';

    if (this.enabled) {
      console.log('[NotionSync] Enabled (bidirectional)');
      this._startPolling();
    } else {
      console.log('[NotionSync] Disabled');
    }
  }

  // =====================================================
  //  CRM → Notion: Push (existing, fire-and-forget)
  // =====================================================
  syncProject(projectId) {
    if (!this.enabled) return;

    // Skip if this update was triggered by Notion→CRM pull
    if (this._skipNotionSync.has(projectId)) {
      this._skipNotionSync.delete(projectId);
      return;
    }

    setImmediate(() => {
      this._syncWithRetry(projectId, 0).catch(err => {
        console.error(`[NotionSync] Unhandled error for project ${projectId}:`, err.message);
      });
    });
  }

  async _syncWithRetry(projectId, attempt) {
    try {
      await this._pushToNotion(projectId);
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

  async _pushToNotion(projectId) {
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
      console.log(`[NotionSync] Push → Notion: updating page ${project.notionPageId}`);
      await notionService.updatePage(project.notionPageId, project, client);
    } else {
      console.log(`[NotionSync] Push → Notion: creating page for project ${projectId}`);
      const pageId = await notionService.createPage(project, client);

      await Project.findByIdAndUpdate(projectId, {
        $set: { notionPageId: pageId }
      });
      console.log(`[NotionSync] Stored notionPageId ${pageId} for project ${projectId}`);
    }
  }

  // =====================================================
  //  Notion → CRM: Pull (new, cron polling)
  // =====================================================
  _startPolling() {
    // Set initial poll time to now (only pull future changes)
    this.lastPollTime = new Date().toISOString();

    cron.schedule(POLL_INTERVAL, () => {
      this._pullFromNotion().catch(err => {
        console.error('[NotionSync] Pull error:', err.message);
      });
    });

    console.log(`[NotionSync] Polling started (${POLL_INTERVAL})`);
  }

  async _pullFromNotion() {
    if (!this.enabled || !this.lastPollTime) return;

    const sinceISO = this.lastPollTime;
    this.lastPollTime = new Date().toISOString();

    let pages;
    try {
      pages = await notionService.queryRecentlyEdited(sinceISO);
    } catch (err) {
      console.error('[NotionSync] Failed to query Notion:', err.message);
      // Restore lastPollTime so we don't miss changes
      this.lastPollTime = sinceISO;
      return;
    }

    if (!pages || pages.length === 0) return;

    console.log(`[NotionSync] Pull ← Notion: ${pages.length} pages changed since ${sinceISO}`);

    this.syncStats.lastPullAt = new Date().toISOString();

    for (const page of pages) {
      try {
        await this._applyNotionChanges(page);
      } catch (err) {
        console.error(`[NotionSync] Failed to apply changes for page ${page.id}:`, err.message);
        this.syncStats.errors.push({
          notionPageId: page.id,
          error: err.message,
          timestamp: new Date().toISOString()
        });
        // Keep only last 50 errors
        if (this.syncStats.errors.length > 50) {
          this.syncStats.errors = this.syncStats.errors.slice(-50);
        }
      }
    }
  }

  async _applyNotionChanges(notionPage) {
    const notionPageId = notionPage.id;

    // Parse Notion properties into CRM update fields
    const updates = notionService.parseNotionProperties(notionPage);
    const clientName = updates._parsedClientName;
    delete updates._parsedClientName; // transient field, don't persist

    // Find the project linked to this Notion page
    const project = await Project.findOne({ notionPageId }).lean();

    if (!project) {
      // No linked CRM project - try to create one from Notion
      await this._createProjectFromNotion(notionPage, updates, clientName);
      return;
    }

    // Check if this edit was made by our push (prevent loop)
    const notionEditedAt = new Date(notionPage.last_edited_time);
    if (project.notionLastEditedAt &&
      notionEditedAt.getTime() <= new Date(project.notionLastEditedAt).getTime()) {
      return; // Already processed
    }

    if (Object.keys(updates).length === 0) return;

    // Mark this project to skip next CRM→Notion push (prevent loop)
    this._skipNotionSync.add(project._id.toString());

    // Apply updates
    updates.notionLastEditedAt = notionEditedAt;
    updates['metadata.updatedAt'] = new Date();

    await Project.findByIdAndUpdate(project._id, { $set: updates });

    this.syncStats.projectsUpdated++;
    const changedFields = Object.keys(updates).filter(k => k !== 'notionLastEditedAt' && k !== 'metadata.updatedAt');
    console.log(`[NotionSync] Pull ← Applied to project ${project._id}: ${changedFields.join(', ')}`);
  }

  // =====================================================
  //  Notion → CRM: Find client by name
  // =====================================================
  async _findClientByName(clientName) {
    if (!clientName) return null;

    // Try exact match on personalInfo.fullName (case-insensitive)
    let client = await Client.findOne({
      'personalInfo.fullName': new RegExp(`^${clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }).lean();

    if (client) return client;

    // Fallback: try businessInfo.businessName (case-insensitive)
    client = await Client.findOne({
      'businessInfo.businessName': new RegExp(`^${clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }).lean();

    return client;
  }

  // =====================================================
  //  Notion → CRM: Create project from Notion page
  // =====================================================
  async _createProjectFromNotion(notionPage, parsedUpdates, clientName) {
    const notionPageId = notionPage.id;
    const projectName = parsedUpdates.name;

    // Validate required fields
    if (!projectName || !clientName) {
      console.warn(`[NotionSync] Skipping page ${notionPageId}: missing projectName="${projectName}" or clientName="${clientName}"`);
      return;
    }

    // Find client in CRM
    const client = await this._findClientByName(clientName);
    if (!client) {
      const errorEntry = {
        clientName,
        projectName,
        notionPageId,
        timestamp: new Date().toISOString()
      };
      this.syncStats.clientNotFound.push(errorEntry);
      // Keep only last 50 entries
      if (this.syncStats.clientNotFound.length > 50) {
        this.syncStats.clientNotFound = this.syncStats.clientNotFound.slice(-50);
      }
      console.error(`[NotionSync] Client "${clientName}" not found in CRM. Cannot create project "${projectName}" from Notion page ${notionPageId}`);
      return;
    }

    // Check for duplicate: same name + same client
    const existing = await Project.findOne({
      name: projectName,
      clientId: client._id
    }).lean();

    if (existing) {
      // Link existing project to Notion page instead of creating duplicate
      await Project.findByIdAndUpdate(existing._id, {
        $set: { notionPageId, notionLastEditedAt: new Date(notionPage.last_edited_time) }
      });
      this._skipNotionSync.add(existing._id.toString());
      console.log(`[NotionSync] Linked existing project ${existing._id} ("${projectName}") to Notion page ${notionPageId}`);
      return;
    }

    // Build new project data
    const projectData = {
      name: projectName,
      clientId: client._id,
      notionPageId,
      notionLastEditedAt: new Date(notionPage.last_edited_time),
      stage: parsedUpdates.stage || 'lead',
      expectedMrr: parsedUpdates.expectedMrr || 0
    };

    if (parsedUpdates['financials.totalValue'] !== undefined) {
      projectData.financials = { totalValue: parsedUpdates['financials.totalValue'] };
    }
    if (parsedUpdates.productType) {
      projectData.productType = parsedUpdates.productType;
    }
    if (parsedUpdates.endDate) {
      projectData.endDate = parsedUpdates.endDate;
    }

    const newProject = await Project.create(projectData);

    // Prevent push-back loop
    this._skipNotionSync.add(newProject._id.toString());
    this.syncStats.projectsCreated++;

    console.log(`[NotionSync] Created project ${newProject._id} ("${projectName}") for client "${clientName}" from Notion page ${notionPageId}`);
  }

  // =====================================================
  //  Admin: Sync all (backfill)
  // =====================================================
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
        await this._pushToNotion(project._id.toString());
        synced++;
      } catch (err) {
        failed++;
        console.error(`[NotionSync] syncAll failed for ${project._id}:`, err.message);
      }
    }

    return { synced, failed, total: projects.length };
  }

  /**
   * Force pull from Notion now (for admin/testing).
   */
  async forcePull() {
    if (!this.enabled) {
      return { pulled: 0 };
    }

    // Pull everything edited in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const saved = this.lastPollTime;
    this.lastPollTime = oneHourAgo;

    await this._pullFromNotion();

    return { success: true };
  }
}

const notionSyncService = new NotionSyncService();
module.exports = notionSyncService;
