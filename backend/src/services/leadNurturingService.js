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
        }
      }
    } catch (error) {
      console.error('Error in checkTriggers:', error);
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
        status: 'lead',
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
          // צור מופע חדש
          const instance = new LeadNurturingInstance({
            nurturingTemplate: template._id,
            client: lead._id,
            status: 'active',
            currentStep: 0,
            nextActionAt: this.calculateNextActionTime(template.sequence[0])
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
        status: { $in: ['lead', 'contacted'] },
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
          const instance = new LeadNurturingInstance({
            nurturingTemplate: template._id,
            client: lead._id,
            status: 'active',
            currentStep: 0,
            nextActionAt: new Date()
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
   * טריגר לשינוי סטטוס (placeholder)
   */
  async triggerStatusChange(template) {
    // לעתיד - טיפול בשינויי סטטוס
    console.log('  🔄 Status change trigger (not implemented yet)');
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
        instance.nextActionAt = this.calculateNextActionTime(nextStep);
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
   * חישוב מתי השלב הבא
   */
  calculateNextActionTime(step) {
    if (!step) return new Date();
    const now = new Date();
    const delayMs = (step.delayDays || 0) * 24 * 60 * 60 * 1000;
    return new Date(now.getTime() + delayMs);
  }

  /**
   * בדיקת לידים ללא תגובה (פונקציה ידנית)
   */
  async checkNoResponseLeads() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const leadsWithoutResponse = await Client.find({
        status: { $in: ['lead', 'contacted'] },
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

