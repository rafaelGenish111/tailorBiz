// backend/src/services/leadNurturingService.js
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
    console.log('🌱 Starting Lead Nurturing Service...');

    // בדיקה כל שעה
    this.jobs.push(
      cron.schedule('0 * * * *', async () => {
        console.log('🔍 Checking for nurturing triggers...');
        await this.checkTriggers();
        await this.executeScheduledActions();
      })
    );

    // בדיקה כל 6 שעות - לידים ללא תגובה
    this.jobs.push(
      cron.schedule('0 */6 * * *', async () => {
        console.log('📞 Checking for leads without response...');
        await this.checkNoResponseLeads();
      })
    );

    console.log('✅ Lead Nurturing Service is active');
  }

  /**
   * בדיקת טריגרים חדשים
   */
  async checkTriggers() {
    try {
      // קבל כל התבניות הפעילות
      const templates = await LeadNurturing.find({ isActive: true });

      for (const template of templates) {
        switch (template.trigger.type) {
          case 'new_lead':
            await this.triggerNewLeads(template);
            break;

          case 'no_response':
            await this.triggerNoResponse(template);
            break;

          case 'status_change':
            await this.triggerStatusChange(template);
            break;

          case 'time_based':
            await this.triggerTimeBased(template);
            break;
        }
      }
    } catch (error) {
      console.error('Error in checkTriggers:', error);
    }
  }

  /**
   * בדיקת טריגרים לליד ספציפי (נקרא מיד כשליד חדש נוצר)
   */
  async checkTriggersForNewLead(clientId) {
    try {
      console.log(`🔍 Checking triggers for new lead: ${clientId}`);
      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client ${clientId} not found`);
        return;
      }

      console.log(`  📋 Client: ${client.personalInfo.fullName}, Source: ${client.leadSource}, Score: ${client.leadScore}, Status: ${client.status}`);

      // וודא שהליד הוא באמת ליד חדש
      if (client.status !== 'lead') {
        console.log(`  ⚠️ Client status is "${client.status}", not "lead" - skipping nurturing triggers`);
        return;
      }

      // קבל כל התבניות הפעילות עם טריגר של new_lead
      const templates = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'new_lead'
      });

      console.log(`  📊 Found ${templates.length} active templates with new_lead trigger`);

      if (templates.length === 0) {
        console.log(`  ⚠️ No active templates found! Make sure to run: npm run seed:nurturing`);
      }

      for (const template of templates) {
        console.log(`  🔎 Checking template: ${template.name}`);
        const conditions = template.trigger.conditions || {};

        // בדוק תנאים
        let shouldTrigger = true;

        // בדוק מקור ליד
        if (conditions.leadSource && conditions.leadSource.length > 0) {
          console.log(`    📍 Template requires leadSource: ${conditions.leadSource.join(', ')}, Client has: ${client.leadSource}`);
          if (!conditions.leadSource.includes(client.leadSource)) {
            shouldTrigger = false;
            console.log(`    ❌ Lead source mismatch - skipping template`);
          }
        }

        // בדוק Lead Score
        if (conditions.minLeadScore) {
          console.log(`    📊 Template requires minLeadScore: ${conditions.minLeadScore}, Client has: ${client.leadScore}`);
          if (client.leadScore < conditions.minLeadScore) {
            shouldTrigger = false;
            console.log(`    ❌ Lead score too low - skipping template`);
          }
        }

        if (shouldTrigger) {
          console.log(`    ✅ Template conditions met!`);
          // בדוק אם כבר יש מופע פעיל
          const existingInstance = await LeadNurturingInstance.findOne({
            client: client._id,
            nurturingTemplate: template._id,
            status: 'active'
          });

          if (existingInstance) {
            console.log(`    ⚠️ Instance already exists for this client and template`);
          } else {
            // בדוק אם יש אינטראקציה אחרונה עם nextFollowUp
            const lastInteraction = client.interactions
              .filter(int => int.nextFollowUp)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            let baseTime = new Date();
            if (lastInteraction && lastInteraction.nextFollowUp) {
              baseTime = new Date(lastInteraction.nextFollowUp);
              console.log(`    📅 Using nextFollowUp from interaction as base time: ${baseTime.toISOString()}`);
            }

            // צור מופע חדש
            const instance = new LeadNurturingInstance({
              nurturingTemplate: template._id,
              client: client._id,
              status: 'active',
              currentStep: 0,
              nextActionAt: this.calculateNextActionTime(template.sequence[0], baseTime)
            });

            await instance.save();
            template.stats.totalTriggered += 1;
            await template.save();

            console.log(`    ✨ Started nurturing for ${client.personalInfo.fullName} (template: ${template.name})`);

            // הרץ את הפעולה הראשונה מיד אם אין delay
            if (template.sequence[0] && template.sequence[0].delayDays === 0) {
              console.log(`    ⚡ Executing first action immediately (no delay)`);
              await this.executeAction(template.sequence[0], client);
            }
          }
        } else {
          console.log(`    ❌ Template conditions not met - skipping`);
        }
      }
    } catch (error) {
      console.error('Error in checkTriggersForNewLead:', error);
    }
  }

  /**
   * בדיקת טריגרים המבוססים על אינטראקציה חדשה
   * למשל: קביעת שיחת סגירה, סגירה מוצלחת, follow-up אחרי הצעה וכו'
   */
  async checkTriggersForInteraction(clientId, interaction) {
    try {
      console.log(`🔍 Checking interaction-based triggers for client: ${clientId}`);
      console.log('  📋 Interaction:', {
        type: interaction.type,
        direction: interaction.direction,
        subject: interaction.subject,
        hasNextFollowUp: !!interaction.nextFollowUp
      });

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client ${clientId} not found`);
        return;
      }

      // קבל כל התבניות הפעילות עם טריגר אינטראקציה
      const templates = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'interaction'
      });

      if (!templates.length) {
        console.log('ℹ️ No active interaction-based templates found');
        return;
      }

      console.log(`  📊 Found ${templates.length} interaction-based templates`);

      for (const template of templates) {
        const conditions = template.trigger.conditions || {};
        let shouldTrigger = true;

        // סטטוסים נדרשים
        const statusList = conditions.statusIn && conditions.statusIn.length
          ? conditions.statusIn
          : conditions.statuses;
        if (statusList && statusList.length > 0) {
          if (!statusList.includes(client.status)) {
            shouldTrigger = false;
          }
        }

        // ציון מינימלי
        if (shouldTrigger && conditions.minLeadScore) {
          if ((client.leadScore || 0) < conditions.minLeadScore) {
            shouldTrigger = false;
          }
        }

        // סוג אינטראקציה
        if (shouldTrigger && conditions.interactionTypes && conditions.interactionTypes.length > 0) {
          if (!conditions.interactionTypes.includes(interaction.type)) {
            shouldTrigger = false;
          }
        }

        // כיוון אינטראקציה
        if (shouldTrigger && conditions.directions && conditions.directions.length > 0) {
          const direction = interaction.direction || 'unknown';
          if (!conditions.directions.includes(direction)) {
            shouldTrigger = false;
          }
        }

        // מחרוזת בנושא
        if (shouldTrigger && conditions.subjectContains) {
          const subject = interaction.subject || '';
          if (!subject.includes(conditions.subjectContains)) {
            shouldTrigger = false;
          }
        }

        // האם נדרש nextFollowUp
        if (shouldTrigger && typeof conditions.hasNextFollowUp === 'boolean') {
          const has = !!interaction.nextFollowUp;
          if (conditions.hasNextFollowUp !== has) {
            shouldTrigger = false;
          }
        }

        if (!shouldTrigger) {
          continue;
        }

        console.log(`  ✅ Interaction matches template: ${template.name}`);

        // בדוק אם כבר יש מופע פעיל לתבנית הזו על הלקוח
        const existingInstance = await LeadNurturingInstance.findOne({
          client: client._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (existingInstance) {
          console.log('  ℹ️ Active instance already exists for this template and client');
          continue;
        }

        // מצא אינטראקציה אחרונה עם nextFollowUp (יכול להיות גם זו הנוכחית)
        const allInteractions = client.interactions || [];
        const allWithFollowup = [
          ...allInteractions,
          // נוודא שהאינטראקציה הנוכחית בפנים אם עוד לא נשמרה בתוך המערך
          ...(allInteractions.some(i => String(i._id) === String(interaction._id)) ? [] : [interaction])
        ];

        const lastInteraction = allWithFollowup
          .filter(int => int.nextFollowUp)
          .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

        let baseTime = new Date();
        if (lastInteraction && lastInteraction.nextFollowUp) {
          baseTime = new Date(lastInteraction.nextFollowUp);
          console.log(`  📅 Using nextFollowUp from interaction as base time: ${baseTime.toISOString()}`);
        }

        const firstStep = template.sequence[0];

        const instance = new LeadNurturingInstance({
          nurturingTemplate: template._id,
          client: client._id,
          status: 'active',
          currentStep: 0,
          nextActionAt: this.calculateNextActionTime(firstStep, baseTime)
        });

        await instance.save();
        template.stats.totalTriggered += 1;
        template.metadata.lastTriggered = new Date();
        await template.save();

        console.log(`  ✨ Started interaction-based nurturing for ${client.personalInfo.fullName} (template: ${template.name})`);

        // אם אין delay לסטפ הראשון – לבצע מיד
        if (firstStep && (firstStep.delayDays === 0 || firstStep.delayDays == null)) {
          console.log('  ⚡ Executing first interaction-based step immediately');
          await this.executeAction(firstStep, client);
        }
      }
    } catch (error) {
      console.error('Error in checkTriggersForInteraction:', error);
    }
  }

  /**
   * בדיקת טריגרים לשינוי סטטוס עבור לקוח בודד (נקרא מ-updateClient)
   */
  async checkTriggersForStatusChange(clientId, oldStatus, newStatus) {
    try {
      console.log(`🔍 Checking status-change triggers for client: ${clientId} (${oldStatus} -> ${newStatus})`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client ${clientId} not found`);
        return;
      }

      const templates = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'status_change'
      });

      if (!templates.length) {
        console.log('ℹ️ No active status-change templates found');
        return;
      }

      for (const template of templates) {
        const conditions = template.trigger.conditions || {};

        const statusList = conditions.statusIn && conditions.statusIn.length
          ? conditions.statusIn
          : conditions.statuses;

        if (statusList && statusList.length > 0 && !statusList.includes(newStatus)) {
          continue;
        }

        if (conditions.minLeadScore && (client.leadScore || 0) < conditions.minLeadScore) {
          continue;
        }

        const existingInstance = await LeadNurturingInstance.findOne({
          client: client._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (existingInstance) {
          continue;
        }

        const lastInteraction = (client.interactions || [])
          .filter(int => int.nextFollowUp)
          .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

        let baseTime = new Date();
        if (lastInteraction && lastInteraction.nextFollowUp) {
          baseTime = new Date(lastInteraction.nextFollowUp);
        }

        const firstStep = template.sequence[0];

        const instance = new LeadNurturingInstance({
          nurturingTemplate: template._id,
          client: client._id,
          status: 'active',
          currentStep: 0,
          nextActionAt: this.calculateNextActionTime(firstStep, baseTime)
        });

        await instance.save();
        template.stats.totalTriggered += 1;
        template.metadata.lastTriggered = new Date();
        await template.save();

        console.log(`  ✨ Started status-change nurturing for ${client.personalInfo.fullName} (template: ${template.name})`);
      }
    } catch (error) {
      console.error('Error in checkTriggersForStatusChange:', error);
    }
  }

  /**
   * טיפול בלידים חדשים
   */
  async triggerNewLeads(template) {
    try {
      const conditions = template.trigger.conditions || {};

      // מצא לידים חדשים (נוצרו ב-24 השעות האחרונות)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      let query = {
        status: 'new_lead',
        'metadata.createdAt': { $gte: oneDayAgo }
      };

      // תנאים נוספים
      if (conditions.leadSource && conditions.leadSource.length > 0) {
        query.leadSource = { $in: conditions.leadSource };
      }

      if (conditions.minLeadScore) {
        query.leadScore = { $gte: conditions.minLeadScore };
      }

      const newLeads = await Client.find(query);

      for (const lead of newLeads) {
        // בדוק אם כבר יש מופע פעיל
        const existingInstance = await LeadNurturingInstance.findOne({
          client: lead._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (!existingInstance) {
          // בדוק אם יש אינטראקציה אחרונה עם nextFollowUp
          const lastInteraction = lead.interactions
            .filter(int => int.nextFollowUp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

          let baseTime = new Date();
          if (lastInteraction && lastInteraction.nextFollowUp) {
            baseTime = new Date(lastInteraction.nextFollowUp);
          }

          // צור מופע חדש
          const instance = new LeadNurturingInstance({
            nurturingTemplate: template._id,
            client: lead._id,
            status: 'active',
            currentStep: 0,
            nextActionAt: this.calculateNextActionTime(template.sequence[0], baseTime)
          });

          await instance.save();
          template.stats.totalTriggered += 1;

          console.log(`  ✨ Started nurturing for ${lead.personalInfo.fullName}`);
        }
      }

      template.metadata.lastTriggered = new Date();
      await template.save();

    } catch (error) {
      console.error('Error in triggerNewLeads:', error);
    }
  }

  /**
   * בדיקת לידים ללא תגובה
   */
  async triggerNoResponse(template) {
    try {
      const conditions = template.trigger.conditions || {};
      const daysWithoutContact = conditions.daysWithoutContact || 3;

      const thresholdDate = new Date(Date.now() - daysWithoutContact * 24 * 60 * 60 * 1000);

      let query = {
        status: { $in: ['new_lead', 'contacted'] },
        'metadata.lastContactedAt': { $lt: thresholdDate }
      };

      if (conditions.minLeadScore) {
        query.leadScore = { $gte: conditions.minLeadScore };
      }

      const coldLeads = await Client.find(query);

      for (const lead of coldLeads) {
        // בדוק אם כבר יש מופע פעיל
        const existingInstance = await LeadNurturingInstance.findOne({
          client: lead._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (!existingInstance) {
          // בדוק אם יש אינטראקציה אחרונה עם nextFollowUp
          const lastInteraction = lead.interactions
            .filter(int => int.nextFollowUp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

          let baseTime = new Date();
          if (lastInteraction && lastInteraction.nextFollowUp) {
            baseTime = new Date(lastInteraction.nextFollowUp);
          }

          const instance = new LeadNurturingInstance({
            nurturingTemplate: template._id,
            client: lead._id,
            status: 'active',
            currentStep: 0,
            nextActionAt: this.calculateNextActionTime(template.sequence[0], baseTime)
          });

          await instance.save();
          template.stats.totalTriggered += 1;

          console.log(`  ❄️ Started re-engagement for ${lead.personalInfo.fullName}`);
        }
      }

      await template.save();

    } catch (error) {
      console.error('Error in triggerNoResponse:', error);
    }
  }

  /**
   * טריגר כללי מבוסס זמן (daysSinceLastContact וכו')
   */
  async triggerTimeBased(template) {
    try {
      const conditions = template.trigger.conditions || {};

      const days =
        conditions.daysSinceLastContact ||
        conditions.daysWithoutContact ||
        0;

      if (!days) {
        console.log('  ℹ️ time_based template has no daysSinceLastContact/daysWithoutContact, skipping');
        return;
      }

      const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const statusList = conditions.statusIn && conditions.statusIn.length
        ? conditions.statusIn
        : conditions.statuses;

      let query = {
        'metadata.lastContactedAt': { $lt: thresholdDate }
      };

      if (statusList && statusList.length > 0) {
        query.status = { $in: statusList };
      }

      if (conditions.minLeadScore) {
        query.leadScore = { $gte: conditions.minLeadScore };
      }

      if (conditions.tags && conditions.tags.length > 0) {
        query.tags = { $in: conditions.tags };
      }

      const clients = await Client.find(query);

      for (const client of clients) {
        const existingInstance = await LeadNurturingInstance.findOne({
          client: client._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (existingInstance) continue;

        const lastInteraction = (client.interactions || [])
          .filter(int => int.nextFollowUp)
          .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

        let baseTime = new Date();
        if (lastInteraction && lastInteraction.nextFollowUp) {
          baseTime = new Date(lastInteraction.nextFollowUp);
        }

        const firstStep = template.sequence[0];

        const instance = new LeadNurturingInstance({
          nurturingTemplate: template._id,
          client: client._id,
          status: 'active',
          currentStep: 0,
          nextActionAt: this.calculateNextActionTime(firstStep, baseTime)
        });

        await instance.save();
        template.stats.totalTriggered += 1;
      }

      template.metadata.lastTriggered = new Date();
      await template.save();
    } catch (error) {
      console.error('Error in triggerTimeBased:', error);
    }
  }

  /**
   * טריגר לשינוי סטטוס (placeholder)
   */
  async triggerStatusChange(template) {
    try {
      const conditions = template.trigger.conditions || {};

      const statusList = conditions.statusIn && conditions.statusIn.length
        ? conditions.statusIn
        : conditions.statuses;

      if (!statusList || statusList.length === 0) {
        console.log('  ℹ️ Status change template has no statuses defined, skipping');
        return;
      }

      let query = {
        status: { $in: statusList }
      };

      if (conditions.minLeadScore) {
        query.leadScore = { $gte: conditions.minLeadScore };
      }

      const clients = await Client.find(query);

      for (const client of clients) {
        const existingInstance = await LeadNurturingInstance.findOne({
          client: client._id,
          nurturingTemplate: template._id,
          status: 'active'
        });

        if (existingInstance) {
          continue;
        }

        // בסיס הזמן: לפי nextFollowUp האחרון אם קיים
        const lastInteraction = (client.interactions || [])
          .filter(int => int.nextFollowUp)
          .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

        let baseTime = new Date();
        if (lastInteraction && lastInteraction.nextFollowUp) {
          baseTime = new Date(lastInteraction.nextFollowUp);
        }

        const firstStep = template.sequence[0];

        const instance = new LeadNurturingInstance({
          nurturingTemplate: template._id,
          client: client._id,
          status: 'active',
          currentStep: 0,
          nextActionAt: this.calculateNextActionTime(firstStep, baseTime)
        });

        await instance.save();
        template.stats.totalTriggered += 1;
      }

      template.metadata.lastTriggered = new Date();
      await template.save();
    } catch (error) {
      console.error('Error in triggerStatusChange:', error);
    }
  }

  /**
   * ביצוע פעולות מתוזמנות
   */
  async executeScheduledActions() {
    try {
      const now = new Date();

      // מצא את כל המופעים הפעילים שהגיע זמנם
      const instances = await LeadNurturingInstance.find({
        status: 'active',
        nextActionAt: { $lte: now }
      })
        .populate('nurturingTemplate')
        .populate('client');

      console.log(`  ⚡ Found ${instances.length} actions to execute`);

      for (const instance of instances) {
        await this.executeNextStep(instance);
      }

    } catch (error) {
      console.error('Error in executeScheduledActions:', error);
    }
  }

  /**
   * ביצוע השלב הבא
   */
  async executeNextStep(instance) {
    try {
      const template = instance.nurturingTemplate;
      const client = instance.client;
      const currentStepIndex = instance.currentStep;

      if (currentStepIndex >= template.sequence.length) {
        // סיימנו את הרצף!
        instance.status = 'completed';
        instance.metadata.updatedAt = new Date();
        template.stats.totalCompleted += 1;
        await instance.save();
        await template.save();

        console.log(`  ✅ Completed nurturing for ${client.personalInfo.fullName}`);
        return;
      }

      const step = template.sequence[currentStepIndex];

      // בדוק אם צריך להפסיק בגלל תגובה
      if (step.stopIfResponse) {
        const hasRecentResponse = await this.checkForRecentResponse(client);
        if (hasRecentResponse) {
          instance.status = 'stopped';
          instance.stopReason = 'Client responded';
          instance.stoppedAt = new Date();
          template.stats.totalStopped += 1;
          await instance.save();
          await template.save();

          console.log(`  ⏸️ Stopped nurturing for ${client.personalInfo.fullName} - got response`);
          return;
        }
      }

      // בצע את הפעולה
      const result = await this.executeAction(step, client);

      // רשום בהיסטוריה
      instance.executionHistory.push({
        step: currentStepIndex,
        actionType: step.actionType,
        success: result.success,
        response: result.message,
        error: result.error
      });

      // עבור לשלב הבא
      instance.currentStep += 1;

      if (instance.currentStep < template.sequence.length) {
        const nextStep = template.sequence[instance.currentStep];

        // בדוק אם יש אינטראקציה אחרונה עם nextFollowUp
        // אם כן, השתמש בו כבסיס לחישוב הזמן הבא
        const lastInteraction = client.interactions
          .filter(int => int.nextFollowUp)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        let baseTime = new Date();
        if (lastInteraction && lastInteraction.nextFollowUp) {
          baseTime = new Date(lastInteraction.nextFollowUp);
          console.log(`  📅 Using nextFollowUp from interaction as base time: ${baseTime.toISOString()}`);
        }

        instance.nextActionAt = this.calculateNextActionTime(nextStep, baseTime);
      }

      instance.metadata.updatedAt = new Date();
      await instance.save();

      console.log(`  ✨ Executed step ${currentStepIndex + 1} for ${client.personalInfo.fullName}: ${step.actionType}`);

    } catch (error) {
      console.error('Error in executeNextStep:', error);
    }
  }

  /**
   * ביצוע פעולה בודדת
   */
  async executeAction(step, client) {
    try {
      switch (step.actionType) {
        case 'send_whatsapp':
          return await this.sendWhatsAppMessage(step, client);

        case 'create_task':
          return await this.createTask(step, client);

        case 'send_email':
          return await this.sendEmail(step, client);

        case 'change_status':
          return await this.changeStatus(step, client);

        case 'update_lead_score':
          return await this.updateLeadScore(step, client);

        case 'update_client_status':
          return await this.updateClientStatus(step, client);

        case 'schedule_followup':
          return await this.scheduleFollowup(step, client);

        case 'add_tag':
          return await this.addTag(step, client);

        case 'create_notification':
          return await this.createNotification(step, client);

        default:
          return { success: false, error: 'Unknown action type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * שליחת WhatsApp
   */
  async sendWhatsAppMessage(step, client) {
    try {
      const phone = client.personalInfo.whatsappPhone || client.personalInfo.phone;

      if (!phone) {
        return { success: false, error: 'No phone number' };
      }

      // החלף משתנים בהודעה
      let message = step.content.message || '';
      message = message.replace(/{name}/g, client.personalInfo.fullName);
      message = message.replace(/{business}/g, client.businessInfo.businessName || '');

      // שלח דרך WhatsApp Service
      // await whatsappService.sendMessage(phone, message);

      // הוסף אינטראקציה
      client.interactions.push({
        type: 'whatsapp',
        direction: 'outbound',
        subject: 'Follow-up אוטומטי',
        content: message,
        timestamp: new Date()
      });

      await client.save();

      console.log(`    💬 Sent WhatsApp to ${client.personalInfo.fullName}`);

      return { success: true, message: 'WhatsApp sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * יצירת משימה
   */
  async createTask(step, client) {
    try {
      const task = new TaskManager({
        title: step.content.taskTitle || `Follow-up: ${client.personalInfo.fullName}`,
        description: step.content.taskDescription || 'טיפול בליד',
        type: 'follow_up',
        priority: step.content.taskPriority || 'medium',
        status: 'todo',
        dueDate: new Date(),
        relatedClient: client._id,
        assignedTo: client.metadata.assignedTo,
        color: '#ff9800'
      });

      await task.save();

      console.log(`    ✅ Created task for ${client.personalInfo.fullName}`);

      return { success: true, message: 'Task created' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * עדכון ציון הליד
   */
  async updateLeadScore(step, client) {
    try {
      const content = step.content || {};
      const current = client.leadScore || 0;

      let nextScore = current;

      if (typeof content.newScore === 'number') {
        nextScore = content.newScore;
      } else if (typeof content.scoreDelta === 'number') {
        nextScore = current + content.scoreDelta;
      }

      if (nextScore === current) {
        console.log(`    ℹ️ updateLeadScore: no change for ${client.personalInfo.fullName}`);
        return { success: true, message: 'Lead score unchanged' };
      }

      client.leadScore = nextScore;
      await client.save();

      console.log(`    📈 Lead score updated for ${client.personalInfo.fullName}: ${current} -> ${nextScore}`);

      return {
        success: true,
        message: `Lead score updated from ${current} to ${nextScore}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * עדכון סטטוס הלקוח
   */
  async updateClientStatus(step, client) {
    try {
      const content = step.content || {};
      const newStatus = content.newStatus;

      if (!newStatus) {
        return { success: false, error: 'newStatus is required for update_client_status' };
      }

      const oldStatus = client.status;

      if (oldStatus === newStatus) {
        console.log(`    ℹ️ updateClientStatus: status already ${newStatus} for ${client.personalInfo.fullName}`);
        return { success: true, message: 'Status unchanged' };
      }

      client.status = newStatus;
      await client.save();

      console.log(`    🔄 Client status updated for ${client.personalInfo.fullName}: ${oldStatus} -> ${newStatus}`);

      return {
        success: true,
        message: `Status updated from ${oldStatus} to ${newStatus}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * יצירת אינטראקציית follow-up בסיסית עם nextFollowUp עתידי
   */
  async scheduleFollowup(step, client) {
    try {
      const content = step.content || {};

      const type = content.followupType || 'task';
      const subject = content.followupSubject || 'Follow-up';
      const body = content.followupContent || '';

      const now = new Date();

      let nextFollowUp = null;
      if (typeof content.followupDays === 'number') {
        nextFollowUp = new Date(now.getTime() + content.followupDays * 24 * 60 * 60 * 1000);
      }

      client.interactions.push({
        type,
        direction: 'outbound',
        subject,
        content: body,
        timestamp: now,
        nextFollowUp
      });

      await client.save();

      console.log(`    📅 Scheduled follow-up (${type}) for ${client.personalInfo.fullName} at ${nextFollowUp || 'ASAP'}`);

      return {
        success: true,
        message: 'Follow-up interaction scheduled'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * שליחת אימייל
   */
  async sendEmail(step, client) {
    // לעתיד - אינטגרציה עם שירות מייל
    console.log(`    📧 Email action for ${client.personalInfo.fullName}`);
    return { success: true, message: 'Email action logged' };
  }

  /**
   * שינוי סטטוס
   */
  async changeStatus(step, client) {
    try {
      const oldStatus = client.status;
      client.status = step.content.newStatus;
      await client.save();

      console.log(`    🔄 Changed status for ${client.personalInfo.fullName}: ${oldStatus} → ${step.content.newStatus}`);

      return { success: true, message: `Status changed to ${step.content.newStatus}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * הוספת תג
   */
  async addTag(step, client) {
    try {
      if (!client.tags.includes(step.content.tagName)) {
        client.tags.push(step.content.tagName);
        await client.save();
      }

      console.log(`    🏷️ Added tag "${step.content.tagName}" to ${client.personalInfo.fullName}`);

      return { success: true, message: 'Tag added' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * יצירת התראה
   */
  async createNotification(step, client) {
    try {
      const assignedUserId = client.metadata.assignedTo;

      if (!assignedUserId) {
        return { success: false, error: 'No assigned user' };
      }

      await Notification.create({
        type: 'client_update',
        title: step.content.notificationTitle || 'עדכון ליד',
        message: step.content.notificationMessage || `עדכון עבור ${client.personalInfo.fullName}`,
        userId: assignedUserId,
        relatedClient: client._id,
        priority: 'medium',
        actionUrl: `/admin/clients/${client._id}`,
        icon: 'info',
        color: '#2196f3'
      });

      console.log(`    🔔 Created notification for ${client.personalInfo.fullName}`);

      return { success: true, message: 'Notification created' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * בדיקה אם יש תגובה אחרונה
   */
  async checkForRecentResponse(client) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentInbound = client.interactions.find(
      int => int.direction === 'inbound' &&
        new Date(int.timestamp) > oneDayAgo
    );

    return !!recentInbound;
  }

  /**
   * בדיקה ועצירת רצפים פעילים כשנוצרת אינטראקציה חדשה
   */
  async checkInteractionForActiveNurturing(clientId, interaction) {
    try {
      console.log(`🔍 Checking active nurturing for new interaction: ${clientId}`);
      console.log(`  📋 Interaction details:`, {
        direction: interaction.direction,
        type: interaction.type,
        subject: interaction.subject,
        hasDirection: !!interaction.direction
      });

      // בדוק אם זו אינטראקציה inbound (תגובה מהלקוח)
      // אם אין direction או שהיא inbound - נניח שזו תגובה מהלקוח
      // אם היא outbound - לא נעצור (זו הודעה שלנו ללקוח)
      const isInbound = interaction.direction === 'inbound' || !interaction.direction;
      const isOutbound = interaction.direction === 'outbound';

      if (isOutbound) {
        console.log(`  ℹ️ Interaction is outbound - no need to stop nurturing`);
        return;
      }

      console.log(`  ✅ Interaction is inbound (or no direction) - checking for active nurturing sequences`);

      // מצא כל הרצפים הפעילים עבור הלקוח
      const activeInstances = await LeadNurturingInstance.find({
        client: clientId,
        status: 'active'
      })
        .populate('nurturingTemplate')
        .populate('client');

      console.log(`  📊 Found ${activeInstances.length} active nurturing instances`);

      if (activeInstances.length === 0) {
        console.log(`  ℹ️ No active nurturing instances found for this client`);
        return;
      }

      for (const instance of activeInstances) {
        const template = instance.nurturingTemplate;
        const currentStepIndex = instance.currentStep;

        console.log(`  🔎 Checking instance: ${template.name}, current step: ${currentStepIndex}`);

        // אם הליד מגיב (inbound interaction), נעצור את הרצף האוטומטי
        // נבדוק אם השלב הנוכחי או הבא כולל stopIfResponse
        // אבל גם אם לא - אם יש תגובה מהלקוח, נעצור את הרצף (זה יותר הגיוני)
        if (currentStepIndex < template.sequence.length) {
          const currentStep = template.sequence[currentStepIndex];

          console.log(`    📋 Current step: ${currentStep.actionType}, stopIfResponse: ${currentStep.stopIfResponse}`);

          // אם הליד מגיב, נעצור את הרצף האוטומטי
          // אלא אם כן השלב הנוכחי כולל במפורש stopIfResponse: false
          const shouldStop = !currentStep || currentStep.stopIfResponse !== false;

          if (shouldStop) {
            console.log(`  ⏸️ Stopping instance for ${instance.client.personalInfo.fullName} - client responded`);
            instance.status = 'stopped';
            instance.stopReason = 'Client responded - interaction detected';
            instance.stoppedAt = new Date();
            if (!template.stats.totalStopped) template.stats.totalStopped = 0;
            template.stats.totalStopped += 1;
            await instance.save();
            await template.save();
            console.log(`  ✅ Instance stopped successfully`);
            continue;
          } else {
            console.log(`  ℹ️ Current step has stopIfResponse: false - continuing nurturing sequence`);
          }
        } else {
          console.log(`  ℹ️ Instance already completed all steps`);
        }
      }

    } catch (error) {
      console.error('Error in checkInteractionForActiveNurturing:', error);
    }
  }

  /**
   * חישוב מתי השלב הבא
   * תומך ב-delayDays (ימים) וגם ב-delayTime (תאריך ושעה ספציפיים)
   */
  calculateNextActionTime(step, baseTime = null) {
    if (!step) return new Date();

    const now = baseTime || new Date();

    // אם יש delayTime (תאריך ושעה ספציפיים), השתמש בו
    if (step.delayTime) {
      const scheduledTime = new Date(step.delayTime);
      // אם התאריך בעבר, הוסף את הימים
      if (scheduledTime < now && step.delayDays) {
        const delayMs = (step.delayDays || 0) * 24 * 60 * 60 * 1000;
        return new Date(now.getTime() + delayMs);
      }
      return scheduledTime;
    }

    // אם יש delayDays, חשב לפי ימים
    if (step.delayDays !== undefined && step.delayDays !== null) {
      const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
      return new Date(now.getTime() + delayMs);
    }

    // אם יש delayHours, חשב לפי שעות
    if (step.delayHours !== undefined && step.delayHours !== null) {
      const delayMs = step.delayHours * 60 * 60 * 1000;
      return new Date(now.getTime() + delayMs);
    }

    // ברירת מחדל - עכשיו
    return new Date();
  }

  /**
   * בדיקת לידים ללא תגובה (פונקציה ידנית)
   */
  async checkNoResponseLeads() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const leadsWithoutResponse = await Client.find({
        status: { $in: ['new_lead', 'contacted'] },
        'metadata.lastContactedAt': { $lt: threeDaysAgo }
      });

      console.log(`  📊 Found ${leadsWithoutResponse.length} leads without response (3+ days)`);

      for (const lead of leadsWithoutResponse) {
        // בדוק אם יש מופע פעיל
        const activeInstance = await LeadNurturingInstance.findOne({
          client: lead._id,
          status: 'active'
        });

        if (!activeInstance) {
          console.log(`  ⚠️ Lead needs attention: ${lead.personalInfo.fullName}`);

          // צור התראה
          const assignedUserId = lead.metadata.assignedTo;

          if (assignedUserId) {
            await Notification.create({
              type: 'follow_up',
              title: '⚠️ ליד ללא תגובה',
              message: `${lead.personalInfo.fullName} לא הגיב כבר 3 ימים`,
              userId: assignedUserId,
              relatedClient: lead._id,
              priority: 'high',
              actionUrl: `/admin/clients/${lead._id}`,
              actionText: 'טפל עכשיו',
              icon: 'warning',
              color: '#ff9800'
            });
          }
        }
      }

    } catch (error) {
      console.error('Error in checkNoResponseLeads:', error);
    }
  }

  /**
   * הפסקת השירות
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('⏹️ Lead Nurturing Service stopped');
  }
}

module.exports = new LeadNurturingService();

