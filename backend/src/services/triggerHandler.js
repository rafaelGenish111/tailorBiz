const cron = require('node-cron');
const Client = require('../models/Client');
const LeadNurturing = require('../models/LeadNurturing');
const ConversationContext = require('../models/ConversationContext');
const automationOrchestrator = require('./automationOrchestrator');

/**
 * TriggerHandler
 *
 * שירות לניהול triggers מתוזמנים ואוטומטיים:
 * - בדיקת לידים ללא מענה (cron)
 * - בדיקת triggers מתוזמנים (cron)
 * - ניהול hooks לשינויי סטטוס
 * - ניהול hooks לאינטראקציות
 */
class TriggerHandler {
  constructor() {
    this.initialized = false;
    this.cronJobs = [];
  }

  /**
   * אתחול השירות
   */
  async initialize() {
    if (this.initialized) {
      console.log('🔄 TriggerHandler already initialized');
      return;
    }

    console.log('🚀 Initializing TriggerHandler...');

    try {
      // הפעלת cron jobs
      this.startCronJobs();

      this.initialized = true;
      console.log('✅ TriggerHandler initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TriggerHandler:', error);
      throw error;
    }
  }

  /**
   * הפעלת cron jobs
   */
  startCronJobs() {
    // בדיקת לידים ללא מענה - כל 6 שעות
    const noResponseJob = cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ Running no-response leads check...');
      try {
        await this.checkNoResponseLeads();
      } catch (error) {
        console.error('❌ Error in no-response cron job:', error);
      }
    });

    this.cronJobs.push(noResponseJob);
    console.log('✅ Started no-response cron job (every 6 hours)');

    // בדיקת שיחות נטושות - כל שעה
    const abandonedConversationsJob = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running abandoned conversations check...');
      try {
        await this.checkAbandonedConversations();
      } catch (error) {
        console.error('❌ Error in abandoned conversations cron job:', error);
      }
    });

    this.cronJobs.push(abandonedConversationsJob);
    console.log('✅ Started abandoned conversations cron job (every hour)');

    // ניקוי שיחות ישנות - כל יום ב-02:00
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('⏰ Running conversation cleanup...');
      try {
        await this.cleanupOldConversations();
      } catch (error) {
        console.error('❌ Error in cleanup cron job:', error);
      }
    });

    this.cronJobs.push(cleanupJob);
    console.log('✅ Started cleanup cron job (daily at 02:00)');
  }

  /**
   * עצירת כל ה-cron jobs
   */
  stopCronJobs() {
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    console.log('⏹️ All cron jobs stopped');
  }

  /**
   * בדיקת לידים ללא מענה
   */
  async checkNoResponseLeads() {
    try {
      console.log('🔍 Checking for no-response leads...');

      // מציאת כל הלידים הפעילים
      const activeLeads = await Client.find({
        status: { $in: ['new_lead', 'contacted', 'engaged'] }
      });

      console.log(`📊 Found ${activeLeads.length} active leads to check`);

      let triggeredCount = 0;

      for (const lead of activeLeads) {
        try {
          // חישוב ימים מאז האינטראקציה האחרונה
          const daysSinceLastContact = this.calculateDaysSinceLastContact(lead);

          if (daysSinceLastContact > 0) {
            console.debug(`📅 Lead ${lead._id}: ${daysSinceLastContact} days since last contact`);

            // טריגר של no_response
            await automationOrchestrator.routeTrigger('no_response', {
              clientId: lead._id,
              daysWithoutContact: daysSinceLastContact
            });

            triggeredCount++;
          }
        } catch (error) {
          console.error(`❌ Error checking lead ${lead._id}:`, error);
          // ממשיכים לליד הבא
        }
      }

      console.log(`✅ No-response check completed: ${triggeredCount} triggers fired`);
      return triggeredCount;
    } catch (error) {
      console.error('❌ Error checking no-response leads:', error);
      throw error;
    }
  }

  /**
   * חישוב ימים מאז האינטראקציה האחרונה
   */
  calculateDaysSinceLastContact(client) {
    try {
      let lastContactDate = null;

      // בדיקת אינטראקציה אחרונה
      if (client.interactions && client.interactions.length > 0) {
        const sortedInteractions = client.interactions.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        lastContactDate = new Date(sortedInteractions[0].timestamp);
      }

      // אם אין אינטראקציות, בודקים תאריך יצירה
      if (!lastContactDate) {
        lastContactDate = new Date(client.createdAt);
      }

      // חישוב ההפרש בימים
      const now = new Date();
      const diffTime = Math.abs(now - lastContactDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error(`❌ Error calculating days since last contact for ${client._id}:`, error);
      return 0;
    }
  }

  /**
   * בדיקת שיחות שננטשו
   */
  async checkAbandonedConversations() {
    try {
      console.log('🔍 Checking for abandoned conversations...');

      // מציאת שיחות פעילות שלא הייתה בהן פעילות מזמן
      const timeoutMinutes = parseInt(process.env.BOT_SESSION_TIMEOUT_MINUTES) || 1440; // 24h default
      const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      const abandonedConversations = await ConversationContext.find({
        status: 'active',
        lastActivityAt: { $lt: timeoutDate }
      });

      console.log(`📊 Found ${abandonedConversations.length} abandoned conversations`);

      for (const conversation of abandonedConversations) {
        try {
          // סימון כנטושה
          conversation.abandon('Session timeout');
          await conversation.save();

          // טריגר של bot_conversation_abandoned
          await automationOrchestrator.routeTrigger('bot_conversation_abandoned', {
            conversationId: conversation._id
          });

          console.log(`✅ Conversation abandoned: ${conversation.sessionId}`);
        } catch (error) {
          console.error(`❌ Error abandoning conversation ${conversation._id}:`, error);
        }
      }

      console.log(`✅ Abandoned conversations check completed`);
      return abandonedConversations.length;
    } catch (error) {
      console.error('❌ Error checking abandoned conversations:', error);
      throw error;
    }
  }

  /**
   * ניקוי שיחות ישנות
   */
  async cleanupOldConversations() {
    try {
      console.log('🧹 Cleaning up old conversations...');

      // ארכוב שיחות ישנות (30 ימים)
      const result = await ConversationContext.archiveOldConversations(30);

      console.log(`✅ Cleanup completed: ${result.modifiedCount} conversations archived`);
      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Error cleaning up conversations:', error);
      throw error;
    }
  }

  /**
   * טיפול בשינוי סטטוס (hook)
   * יש לקרוא לזה מה-Client model hooks
   */
  async handleStatusChange(clientId, oldStatus, newStatus) {
    try {
      console.log(`🔄 TriggerHandler: Status change hook: ${clientId} (${oldStatus} → ${newStatus})`);

      await automationOrchestrator.routeTrigger('status_change', {
        clientId,
        oldStatus,
        newStatus
      });

      console.log(`✅ Status change hook completed`);
    } catch (error) {
      console.error(`❌ Error in status change hook:`, error);
      // לא זורקים שגיאה כדי לא לשבור את השמירה של הלקוח
    }
  }

  /**
   * טיפול באינטראקציה חדשה (hook)
   * יש לקרוא לזה מה-Client model hooks
   */
  async handleInteractionCreated(clientId, interaction) {
    try {
      console.log(`💬 TriggerHandler: Interaction hook: ${clientId} (${interaction.type})`);

      await automationOrchestrator.routeTrigger('interaction', {
        clientId,
        interaction
      });

      console.log(`✅ Interaction hook completed`);
    } catch (error) {
      console.error(`❌ Error in interaction hook:`, error);
      // לא זורקים שגיאה
    }
  }

  /**
   * טיפול בליד חדש (hook)
   */
  async handleNewLead(clientId) {
    try {
      console.log(`🆕 TriggerHandler: New lead hook: ${clientId}`);

      await automationOrchestrator.routeTrigger('new_lead', {
        clientId
      });

      console.log(`✅ New lead hook completed`);
    } catch (error) {
      console.error(`❌ Error in new lead hook:`, error);
      // לא זורקים שגיאה
    }
  }

  /**
   * טיפול בהודעה חדשה (hook)
   */
  async handleNewMessage(clientId, message, channel = 'whatsapp') {
    try {
      console.debug(`💬 TriggerHandler: New message hook: ${clientId}`);

      await automationOrchestrator.routeTrigger('new_message', {
        clientId,
        message,
        channel
      });

      console.debug(`✅ New message hook completed`);
    } catch (error) {
      console.error(`❌ Error in new message hook:`, error);
      // לא זורקים שגיאה
    }
  }

  /**
   * הרצת בדיקה ידנית (לטסטים)
   */
  async runManualCheck() {
    console.log('🔧 Running manual trigger check...');

    const results = {
      noResponse: await this.checkNoResponseLeads(),
      abandoned: await this.checkAbandonedConversations()
    };

    console.log('✅ Manual check completed:', results);
    return results;
  }

  /**
   * קבלת סטטוס השירות
   */
  getStatus() {
    return {
      initialized: this.initialized,
      cronJobsRunning: this.cronJobs.length,
      cronJobs: this.cronJobs.map(job => ({
        running: job.running || false
      }))
    };
  }
}

// יצירת instance יחיד (Singleton)
const triggerHandler = new TriggerHandler();

module.exports = triggerHandler;
