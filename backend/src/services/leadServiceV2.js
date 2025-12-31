// backend/src/services/leadNurturingService.js
console.log("🔥🔥🔥 I AM THE REAL FILE: src/services/leadNurturingService.js LOADED 🔥🔥🔥");
console.log("🔥🔥🔥 VERSION: V6 - OLD LOG REMOVED - If you see 'skipping nurturing triggers', clear Node cache! 🔥🔥🔥");
// ... rest of the code

const cron = require('node-cron');
const Client = require('../models/Client');
const LeadNurturing = require('../models/LeadNurturing');
const LeadNurturingInstance = require('../models/LeadNurturingInstance');
const TaskManager = require('../models/TaskManager');
const Notification = require('../models/Notification');
const whatsappService = require('./whatsappService');

class LeadNurturingService {
  constructor() {
    this.jobs = [];
  }

  /**
   * התחלת שירות הטיפוח
   */
  start() {
    console.log('🌱 Starting Lead Nurturing Service (V5 Force Update - Status Check Removed)...');

    // בדיקה כל שעה - משימות מתוזמנות
    this.jobs.push(
      cron.schedule('0 * * * *', async () => {
        console.log('🔍 Checking for nurturing triggers...');
        await this.executeScheduledActions();
      })
    );

    // בדיקה כל 6 שעות - לידים ללא תגובה (Ghosting)
    this.jobs.push(
      cron.schedule('0 */6 * * *', async () => {
        console.log('📞 Checking for leads without response...');
        await this.checkNoResponseLeads();
      })
    );

    console.log('✅ Lead Nurturing Service is active');
  }

  /**
   * בדיקת טריגרים לליד חדש (נקראת מיד בעת יצירת הליד)
   * @param {string} clientId 
   */
  async checkTriggersForNewLead(clientId) {
    try {
      console.log(`🚀 DEBUG V6: checkTriggersForNewLead called for client ID: ${clientId}`);
      console.log(`  🔥🔥🔥 THIS IS V6 CODE - If you see old log, there's a cache issue! 🔥🔥🔥`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client ${clientId} not found`);
        return;
      }

      console.log(`  📋 Client: ${client.personalInfo.fullName}, Status: '${client.status}', Source: '${client.leadSource}'`);
      console.log(`  🔥 V6 CODE RUNNING - Old log should NOT appear! 🔥`);

      // CRITICAL: If you see the old log after this line, the code is cached!
      if (client.status === 'new_lead') {
        console.log(`  ✅ Status is 'new_lead' - proceeding with template check (OLD LOG SHOULD NOT APPEAR!)`);
      }

      // ✅ FIX: הוסרה הבדיקה הקשיחה לסטטוס 'lead'.
      // כעת שואבים את כל התבניות המוגדרות ללידים חדשים ובודקים התאמה.
      // ⚠️ NOTE: The old log "Client status is 'new_lead', not 'lead' - skipping nurturing triggers" 
      // has been REMOVED. If you see it, it's from cached code. Restart the server!

      const templates = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'new_lead'
      });

      console.log(`  📊 Found ${templates.length} active 'new_lead' templates.`);

      for (const template of templates) {
        console.log(`  🔎 Evaluating template: "${template.name}"`);
        const conditions = template.trigger.conditions || {};
        let isMatch = true;

        // 1. בדיקת מקור הליד (Lead Source) - אם מוגדר בתבנית
        if (conditions.leadSource && conditions.leadSource.length > 0) {
          const clientSource = (client.leadSource || '').toLowerCase();
          const allowedSources = conditions.leadSource.map(s => s.toLowerCase());

          // בדיקת הכלה (למשל: 'facebook ads' יתפוס ב-'facebook')
          const sourceMatch = allowedSources.some(src => clientSource.includes(src) || src.includes(clientSource));

          if (!sourceMatch) {
            isMatch = false;
            console.log(`    ❌ Source Mismatch: '${clientSource}' not in [${allowedSources.join(', ')}]`);
          }
        }

        // 2. בדיקת ניקוד (Min Score)
        if (isMatch && conditions.minLeadScore) {
          const clientScore = client.leadScore || 0;
          if (clientScore < conditions.minLeadScore) {
            isMatch = false;
            console.log(`    ❌ Score Too Low: ${clientScore} < ${conditions.minLeadScore}`);
          }
        }

        if (isMatch) {
          await this.startAutomationForClient(client, template);
        }
      }
    } catch (error) {
      console.error('❌ Error in checkTriggersForNewLead:', error);
    }
  }

  /**
   * יצירת והפעלת אינסטנס של אוטומציה
   */
  async startAutomationForClient(client, template) {
    try {
      // בדיקת כפילות
      const existingInstance = await LeadNurturingInstance.findOne({
        client: client._id,
        nurturingTemplate: template._id,
        status: 'active'
      });

      if (existingInstance) {
        console.log(`    ⚠️ Automation "${template.name}" already running for this client.`);
        return;
      }

      console.log(`    ✅ MATCH! Starting automation: "${template.name}"`);

      // יצירת מופע חדש
      const instance = new LeadNurturingInstance({
        nurturingTemplate: template._id,
        client: client._id,
        status: 'active',
        currentStep: 0,
        nextActionAt: this.calculateNextActionTime(template.sequence[0], new Date())
      });

      await instance.save();

      // עדכון סטטיסטיקות
      await LeadNurturing.findByIdAndUpdate(template._id, { $inc: { 'stats.totalTriggered': 1 } });

      // ביצוע מיידי אם אין דיליי (Zero Delay Execution)
      const firstStep = template.sequence[0];
      const isImmediate = this.isStepImmediate(firstStep);

      if (isImmediate) {
        console.log(`    ⚡ Zero Delay detected - Executing Step 0 immediately...`);
        await this.executeNextStep(instance);
      }

    } catch (error) {
      console.error('Error starting automation:', error);
    }
  }

  /**
   * ביצוע המשימות המתוזמנות (רץ ב-Cron Job)
   */
  async executeScheduledActions() {
    try {
      const now = new Date();
      const instances = await LeadNurturingInstance.find({
        status: 'active',
        nextActionAt: { $lte: now }
      }).populate('nurturingTemplate').populate('client');

      if (instances.length > 0) console.log(`  ⚡ Executing ${instances.length} scheduled actions...`);

      for (const instance of instances) {
        await this.executeNextStep(instance);
      }
    } catch (error) {
      console.error('Error in executeScheduledActions:', error);
    }
  }

  /**
   * ביצוע צעד בודד באוטומציה
   */
  async executeNextStep(instance) {
    try {
      // ריענון נתונים במקרה שהשתנו מאז השליפה
      // טעינה מחדש עם populate כדי לקבל את ה-template המלא
      const refreshedInstance = await LeadNurturingInstance.findById(instance._id)
        .populate('nurturingTemplate')
        .populate('client');

      if (!refreshedInstance) {
        console.error(`  ❌ Instance not found: ${instance._id}`);
        return;
      }

      const template = refreshedInstance.nurturingTemplate;
      const client = refreshedInstance.client;

      if (!template || !client) {
        console.error(`  ❌ Invalid instance data (missing template or client)`);
        console.error(`     Instance ID: ${refreshedInstance._id}`);
        console.error(`     Template: ${template ? 'exists' : 'MISSING'}, Client: ${client ? 'exists' : 'MISSING'}`);

        // נסה למחוק את ה-instance הפגום במקום לשמור אותו עם status error
        try {
          await LeadNurturingInstance.findByIdAndDelete(refreshedInstance._id);
          console.log(`     ✅ Deleted invalid instance ${refreshedInstance._id}`);
        } catch (deleteError) {
          console.error(`     ❌ Failed to delete invalid instance: ${deleteError.message}`);
          // אם לא הצלחנו למחוק, נשנה ל-stopped במקום error
          refreshedInstance.status = 'stopped';
          refreshedInstance.stopReason = 'Invalid data - missing template or client';
          await refreshedInstance.save();
        }
        return;
      }

      // בדיקה שה-sequence קיים
      if (!template.sequence || !Array.isArray(template.sequence)) {
        console.error(`  ❌ Template "${template.name}" has no sequence array`);
        refreshedInstance.status = 'stopped';
        refreshedInstance.stopReason = 'Template has no sequence array';
        await refreshedInstance.save();
        return;
      }

      const currentStepIndex = refreshedInstance.currentStep;

      // בדיקה אם סיימנו
      if (currentStepIndex >= template.sequence.length) {
        refreshedInstance.status = 'completed';
        await LeadNurturing.findByIdAndUpdate(template._id, { $inc: { 'stats.totalCompleted': 1 } });
        await refreshedInstance.save();
        return;
      }

      const step = template.sequence[currentStepIndex];

      // בדיקת עצירה במקרה של תגובה (Stop If Response)
      if (step.stopIfResponse) {
        const hasResponded = await this.checkForRecentResponse(client);
        if (hasResponded) {
          console.log(`  ⏸️ Stopping automation for ${client.personalInfo.fullName} (User Responded)`);
          refreshedInstance.status = 'stopped';
          await LeadNurturing.findByIdAndUpdate(template._id, { $inc: { 'stats.totalStopped': 1 } });
          await refreshedInstance.save();
          return;
        }
      }

      // --- ביצוע הפעולה ---
      console.log(`  ▶️ Step ${currentStepIndex} (${step.actionType}) for ${client.personalInfo.fullName}`);

      const actionResult = await this.executeActionLogic(step, client);

      // תיעוד בהיסטוריה
      refreshedInstance.executionHistory.push({
        step: currentStepIndex,
        actionType: step.actionType,
        success: actionResult.success,
        response: actionResult.message,
        executedAt: new Date()
      });

      // חישוב הצעד הבא
      refreshedInstance.currentStep += 1;

      if (refreshedInstance.currentStep < template.sequence.length) {
        const nextStep = template.sequence[refreshedInstance.currentStep];
        refreshedInstance.nextActionAt = this.calculateNextActionTime(nextStep, new Date());
      } else {
        refreshedInstance.status = 'completed';
        await LeadNurturing.findByIdAndUpdate(template._id, { $inc: { 'stats.totalCompleted': 1 } });
      }

      await refreshedInstance.save();

    } catch (error) {
      console.error('Error in executeNextStep:', error);
    }
  }

  /**
   * נתב סוגי פעולות (Switch Case)
   */
  async executeActionLogic(step, client) {
    try {
      switch (step.actionType) {
        case 'send_whatsapp':
          await this.sendWhatsAppMessage(step, client);
          return { success: true, message: 'WhatsApp sent' };

        case 'create_task':
          await this.createTask(step, client);
          return { success: true, message: 'Task created' };

        case 'update_lead_score':
          await this.updateLeadScore(step, client);
          return { success: true, message: 'Score updated' };

        case 'change_status':
          await this.changeStatus(step, client);
          return { success: true, message: 'Status changed' };

        default:
          return { success: true, message: 'No action performed' };
      }
    } catch (error) {
      console.error(`    ❌ Action Failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  // --- Helper Methods ---

  async sendWhatsAppMessage(step, client) {
    try {
      const phone = client.personalInfo.whatsappPhone || client.personalInfo.phone;
      if (!phone) {
        throw new Error('No phone number found for client');
      }

      let message = step.content.message || '';
      if (!message) {
        throw new Error('No message content in step');
      }

      // סניטציה והחלפת משתנים
      message = message
        .replace(/{name}/g, client.personalInfo.fullName || 'לקוח יקר')
        .replace(/{firstName}/g, (client.personalInfo.fullName || '').split(' ')[0] || 'לקוח יקר')
        .replace(/{business}/g, client.businessInfo.businessName || 'העסק שלך')
        .replace(/{email}/g, client.personalInfo.email || '')
        .replace(/{phone}/g, client.personalInfo.phone || '');

      console.log(`    📱 Sending WhatsApp to ${phone}: ${message.substring(0, 50)}...`);

      // שימוש ב-Service הקיים עם timeout
      try {
        const result = await Promise.race([
          whatsappService.sendMessage(phone, message),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('WhatsApp send timeout after 35 seconds')), 35000)
          )
        ]);

        console.log(`    ✅ WhatsApp sent successfully: ${result.messageId || 'OK'}`);
      } catch (error) {
        console.error(`    ❌ WhatsApp send failed: ${error.message}`);
        // נמשיך גם אם שליחת WhatsApp נכשלה - נוסיף אינטראקציה עם שגיאה
        client.interactions.push({
          type: 'whatsapp',
          direction: 'outbound',
          subject: 'Automation: ' + (step.name || 'Message') + ' (FAILED)',
          content: `Failed to send: ${error.message}\n\nIntended message: ${message}`,
          timestamp: new Date()
        });
        await client.save();
        throw error; // נזרוק את השגיאה כדי שהקוד ידע שהפעולה נכשלה
      }

      // תיעוד אינטראקציה בתיק לקוח
      client.interactions.push({
        type: 'whatsapp',
        direction: 'outbound',
        subject: 'Automation: ' + (step.name || 'Message'),
        content: message,
        timestamp: new Date()
      });
      await client.save();
    } catch (error) {
      console.error(`    ❌ Failed to send WhatsApp: ${error.message}`);
      throw error;
    }
  }

  async createTask(step, client) {
    let title = step.content.taskTitle || 'משימה אוטומטית';
    title = title.replace(/{name}/g, client.personalInfo.fullName);

    await TaskManager.create({
      title,
      description: step.content.taskDescription,
      relatedClient: client._id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      status: 'todo',
      priority: step.content.taskPriority || 'medium'
    });
  }

  async updateLeadScore(step, client) {
    if (step.content.scoreDelta) {
      client.leadScore = (client.leadScore || 0) + step.content.scoreDelta;
      await client.save();
    }
  }

  async changeStatus(step, client) {
    if (step.content.newStatus) {
      client.status = step.content.newStatus;
      await client.save();
    }
  }

  async checkForRecentResponse(client) {
    // האם התקבלה הודעה ב-24 שעות האחרונות?
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return client.interactions.some(i =>
      i.type === 'whatsapp' &&
      i.direction === 'inbound' &&
      new Date(i.timestamp) > oneDayAgo
    );
  }

  async checkNoResponseLeads() {
    // כאן ניתן להוסיף לוגיקה לאיתור לידים שנתקעו
    // (מומש חלקית בגרסאות קודמות, השארתי כ-Place holder תקין)
  }

  /**
   * בדיקת טריגרים לשינוי סטטוס
   */
  async checkTriggersForStatusChange(clientId, oldStatus, newStatus) {
    try {
      // TODO: Implement status change triggers
      // This method is called when client status changes
      // For now, it's a placeholder
    } catch (error) {
      console.error('Error in checkTriggersForStatusChange:', error);
    }
  }

  /**
   * בדיקת טריגרים לאינטראקציה
   */
  async checkTriggersForInteraction(clientId, interaction) {
    try {
      // TODO: Implement interaction-based triggers
      // This method is called when a new interaction is added
      // For now, it's a placeholder
    } catch (error) {
      console.error('Error in checkTriggersForInteraction:', error);
    }
  }

  /**
   * בדיקת אינטראקציה לרצפי טיפוח פעילים
   */
  async checkInteractionForActiveNurturing(clientId, interaction) {
    try {
      // TODO: Implement check for active nurturing instances
      // This method checks if an interaction should stop/update active nurturing sequences
      // For now, it's a placeholder
    } catch (error) {
      console.error('Error in checkInteractionForActiveNurturing:', error);
    }
  }

  calculateNextActionTime(step, baseTime) {
    const now = new Date(baseTime);
    const delayMs = (step.delayDays || 0) * 86400000 + (step.delayHours || 0) * 3600000;
    return new Date(now.getTime() + delayMs);
  }

  isStepImmediate(step) {
    return (!step.delayDays && !step.delayHours) || (step.delayDays === 0 && step.delayHours === 0);
  }

  stop() {
    this.jobs.forEach(j => j.stop());
  }
}

module.exports = new LeadNurturingService();