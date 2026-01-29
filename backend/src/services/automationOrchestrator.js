const Client = require('../models/Client');
const MarketingAutomation = require('../models/marketing/MarketingAutomation');
const LeadNurturing = require('../models/LeadNurturing');
const ConversationContext = require('../models/ConversationContext');
const AIBotConfig = require('../models/AIBotConfig');
const aiBotEngine = require('./aiBotEngine');

/**
 * AutomationOrchestrator
 *
 * שכבת routing מרכזית שמתאמת בין מערכות האוטומציה השונות:
 * - MarketingAutomation (קמפיינים B2C)
 * - LeadNurturing (לידים אישיים B2B)
 * - AIBotEngine (שיחות AI)
 *
 * אחריות:
 * 1. ניתוב triggers למערכת המתאימה
 * 2. תיאום workflows בין-מערכתיים
 * 3. רישום ומעקב אחר triggers
 */
class AutomationOrchestrator {
  constructor() {
    this.triggers = new Map(); // triggerType => [handlers]
    this.initialized = false;
  }

  /**
   * אתחול המערכת
   */
  async initialize() {
    if (this.initialized) {
      console.log('🔄 AutomationOrchestrator already initialized');
      return;
    }

    console.log('🚀 Initializing AutomationOrchestrator...');

    try {
      // רישום triggers בסיסיים
      await this.registerDefaultTriggers();

      this.initialized = true;
      console.log('✅ AutomationOrchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AutomationOrchestrator:', error);
      throw error;
    }
  }

  /**
   * רישום triggers ברירת מחדל
   */
  async registerDefaultTriggers() {
    // New lead trigger
    this.registerTrigger('new_lead', async (payload) => {
      await this.handleNewLead(payload.clientId);
    });

    // Status change trigger
    this.registerTrigger('status_change', async (payload) => {
      await this.handleStatusChange(payload.clientId, payload.oldStatus, payload.newStatus);
    });

    // No response trigger
    this.registerTrigger('no_response', async (payload) => {
      await this.handleNoResponse(payload.clientId, payload.daysWithoutContact);
    });

    // New message trigger
    this.registerTrigger('new_message', async (payload) => {
      await this.handleNewMessage(payload.clientId, payload.message, payload.channel);
    });

    // Interaction trigger
    this.registerTrigger('interaction', async (payload) => {
      await this.handleInteraction(payload.clientId, payload.interaction);
    });

    // Bot conversation completed
    this.registerTrigger('bot_conversation_completed', async (payload) => {
      await this.handleBotConversationCompleted(payload.conversationId);
    });

    // Bot conversation abandoned
    this.registerTrigger('bot_conversation_abandoned', async (payload) => {
      await this.handleBotConversationAbandoned(payload.conversationId);
    });

    // Bot intent detected
    this.registerTrigger('bot_intent_detected', async (payload) => {
      await this.handleBotIntentDetected(payload.conversationId, payload.intent, payload.parameters);
    });

    console.log('✅ Default triggers registered');
  }

  /**
   * רישום trigger handler
   * @param {String} triggerType - סוג הטריגר
   * @param {Function} handler - פונקציה שמטפלת בטריגר
   */
  registerTrigger(triggerType, handler) {
    if (!this.triggers.has(triggerType)) {
      this.triggers.set(triggerType, []);
    }

    this.triggers.get(triggerType).push(handler);
    console.debug(`✅ Registered trigger handler for: ${triggerType}`);
  }

  /**
   * ניתוב trigger למערכת המתאימה
   * @param {String} triggerType - סוג הטריגר
   * @param {Object} payload - נתוני הטריגר
   */
  async routeTrigger(triggerType, payload) {
    try {
      console.debug(`🔄 Routing trigger: ${triggerType}`, payload);

      const handlers = this.triggers.get(triggerType);
      if (!handlers || handlers.length === 0) {
        console.warn(`⚠️ No handlers registered for trigger: ${triggerType}`);
        return;
      }

      // הרצת כל ה-handlers במקביל
      await Promise.all(
        handlers.map(handler =>
          handler(payload).catch(error => {
            console.error(`❌ Error in trigger handler for ${triggerType}:`, error);
          })
        )
      );

      console.debug(`✅ Trigger routed successfully: ${triggerType}`);
    } catch (error) {
      console.error(`❌ Error routing trigger ${triggerType}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בליד חדש
   */
  async handleNewLead(clientId) {
    try {
      console.log(`🆕 Handling new lead: ${clientId}`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client not found: ${clientId}`);
        return;
      }

      // חיפוש אוטומציות מתאימות ב-MarketingAutomation
      const marketingAutomations = await MarketingAutomation.find({
        isActive: true,
        'trigger.type': 'new_lead',
        'trigger.enabled': true
      });

      // חיפוש אוטומציות מתאימות ב-LeadNurturing
      const leadNurturingAutomations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'new_lead',
        'trigger.enabled': true
      });

      // הרצת MarketingAutomation
      for (const automation of marketingAutomations) {
        await this.executeMarketingAutomation(automation, client);
      }

      // הרצת LeadNurturing
      for (const automation of leadNurturingAutomations) {
        await this.executeLeadNurturing(automation, client);
      }

      // בדיקה אם צריך להפעיל AI Bot
      const botConfig = await AIBotConfig.findOne({ isActive: true });
      if (botConfig && botConfig.shouldTrigger('new_lead', { leadSource: client.source })) {
        console.log(`🤖 Starting AI bot conversation for new lead: ${clientId}`);

        // שליחת הודעת ברוכים הבאים
        const welcomeMessage = await this.getWelcomeMessage(client);
        await aiBotEngine.handleMessage(clientId, welcomeMessage, 'whatsapp');
      }

      console.log(`✅ New lead handled: ${clientId}`);
    } catch (error) {
      console.error(`❌ Error handling new lead ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בשינוי סטטוס
   */
  async handleStatusChange(clientId, oldStatus, newStatus) {
    try {
      console.log(`🔄 Handling status change: ${clientId} (${oldStatus} → ${newStatus})`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client not found: ${clientId}`);
        return;
      }

      // חיפוש אוטומציות LeadNurturing שמתאימות לשינוי הסטטוס
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'status_change',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        const conditions = automation.trigger.conditions || {};

        // בדיקת תנאי fromStatus
        if (conditions.fromStatus && conditions.fromStatus.length > 0) {
          if (!conditions.fromStatus.includes(oldStatus)) {
            continue; // לא מתאים
          }
        }

        // בדיקת תנאי toStatus
        if (conditions.toStatus && conditions.toStatus.length > 0) {
          if (!conditions.toStatus.includes(newStatus)) {
            continue; // לא מתאים
          }
        }

        // אם הגענו לכאן - האוטומציה מתאימה
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for status change`);
        await this.executeLeadNurturing(automation, client);
      }

      console.log(`✅ Status change handled: ${clientId}`);
    } catch (error) {
      console.error(`❌ Error handling status change for ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בליד ללא מענה
   */
  async handleNoResponse(clientId, daysWithoutContact) {
    try {
      console.log(`⏰ Handling no response: ${clientId} (${daysWithoutContact} days)`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client not found: ${clientId}`);
        return;
      }

      // חיפוש אוטומציות מתאימות
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'no_response',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        const conditions = automation.trigger.conditions || {};

        // בדיקת תנאי daysWithoutContact
        if (conditions.daysWithoutContact) {
          if (daysWithoutContact < conditions.daysWithoutContact) {
            continue; // עדיין לא הגיע הזמן
          }
        }

        // בדיקת תנאי סטטוס
        if (conditions.statuses && conditions.statuses.length > 0) {
          if (!conditions.statuses.includes(client.status)) {
            continue;
          }
        }

        // אם הגענו לכאן - האוטומציה מתאימה
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for no response`);
        await this.executeLeadNurturing(automation, client);
      }

      console.log(`✅ No response handled: ${clientId}`);
    } catch (error) {
      console.error(`❌ Error handling no response for ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בהודעה חדשה
   */
  async handleNewMessage(clientId, message, channel = 'whatsapp') {
    try {
      console.log(`💬 Handling new message: ${clientId} (${channel})`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client not found: ${clientId}`);
        return;
      }

      // בדיקה אם יש שיחה פעילה
      const activeConversation = await ConversationContext.findOne({
        client: clientId,
        channel,
        status: 'active'
      });

      if (activeConversation) {
        // יש שיחה פעילה - מנתב ל-AI Bot
        console.log(`🤖 Routing message to active conversation: ${activeConversation.sessionId}`);
        await aiBotEngine.handleMessage(clientId, message, channel);
        return;
      }

      // בדיקה אם צריך להפעיל AI Bot חדש
      const botConfig = await AIBotConfig.getBotForEvent('new_message', {
        message,
        leadSource: client.source,
        status: client.status
      });

      if (botConfig) {
        console.log(`🤖 Starting new AI bot conversation for message`);
        await aiBotEngine.handleMessage(clientId, message, channel);
        return;
      }

      // אחרת - רק נוסיף אינטראקציה רגילה
      console.debug(`📝 No bot handler, adding interaction only`);

    } catch (error) {
      console.error(`❌ Error handling new message for ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול באינטראקציה
   */
  async handleInteraction(clientId, interaction) {
    try {
      console.log(`💬 Handling interaction: ${clientId} (${interaction.type})`);

      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`❌ Client not found: ${clientId}`);
        return;
      }

      // חיפוש אוטומציות מתאימות
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'interaction',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        const conditions = automation.trigger.conditions || {};

        // בדיקת תנאי interactionType
        if (conditions.interactionTypes && conditions.interactionTypes.length > 0) {
          if (!conditions.interactionTypes.includes(interaction.type)) {
            continue;
          }
        }

        // אם הגענו לכאן - האוטומציה מתאימה
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for interaction`);
        await this.executeLeadNurturing(automation, client);
      }

      console.log(`✅ Interaction handled: ${clientId}`);
    } catch (error) {
      console.error(`❌ Error handling interaction for ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בשיחת בוט שהושלמה
   */
  async handleBotConversationCompleted(conversationId) {
    try {
      console.log(`✅ Handling bot conversation completed: ${conversationId}`);

      const conversation = await ConversationContext.findById(conversationId).populate('client');
      if (!conversation) {
        console.error(`❌ Conversation not found: ${conversationId}`);
        return;
      }

      const client = conversation.client;

      // חיפוש אוטומציות מתאימות
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'bot_conversation_completed',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        const conditions = automation.trigger.conditions || {};

        // בדיקת תנאי conversationOutcome
        if (conditions.conversationOutcome) {
          const outcome = conversation.context?.intent;
          if (outcome !== conditions.conversationOutcome) {
            continue;
          }
        }

        // אם הגענו לכאן - האוטומציה מתאימה
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for conversation completed`);
        await this.executeLeadNurturing(automation, client);
      }

      console.log(`✅ Bot conversation completed handled: ${conversationId}`);
    } catch (error) {
      console.error(`❌ Error handling bot conversation completed ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול בשיחת בוט שננטשה
   */
  async handleBotConversationAbandoned(conversationId) {
    try {
      console.log(`⚠️ Handling bot conversation abandoned: ${conversationId}`);

      const conversation = await ConversationContext.findById(conversationId).populate('client');
      if (!conversation) {
        console.error(`❌ Conversation not found: ${conversationId}`);
        return;
      }

      const client = conversation.client;

      // חיפוש אוטומציות מתאימות
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'bot_conversation_abandoned',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for conversation abandoned`);
        await this.executeLeadNurturing(automation, client);
      }

      console.log(`✅ Bot conversation abandoned handled: ${conversationId}`);
    } catch (error) {
      console.error(`❌ Error handling bot conversation abandoned ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * טיפול ב-intent שזוהה על ידי הבוט
   */
  async handleBotIntentDetected(conversationId, intent, parameters) {
    try {
      console.log(`🎯 Handling bot intent detected: ${intent} in conversation ${conversationId}`);

      const conversation = await ConversationContext.findById(conversationId).populate('client');
      if (!conversation) {
        console.error(`❌ Conversation not found: ${conversationId}`);
        return;
      }

      const client = conversation.client;

      // חיפוש אוטומציות מתאימות
      const automations = await LeadNurturing.find({
        isActive: true,
        'trigger.type': 'bot_intent_detected',
        'trigger.enabled': true
      });

      for (const automation of automations) {
        const conditions = automation.trigger.conditions || {};

        // בדיקת תנאי botIntents
        if (conditions.botIntents && conditions.botIntents.length > 0) {
          if (!conditions.botIntents.includes(intent)) {
            continue;
          }
        }

        // אם הגענו לכאן - האוטומציה מתאימה
        console.log(`✅ Executing LeadNurturing automation: ${automation.name} for intent: ${intent}`);
        await this.executeLeadNurturing(automation, client, { intent, parameters });
      }

      console.log(`✅ Bot intent detected handled: ${intent}`);
    } catch (error) {
      console.error(`❌ Error handling bot intent detected:`, error);
      throw error;
    }
  }

  /**
   * הרצת MarketingAutomation
   */
  async executeMarketingAutomation(automation, client) {
    try {
      console.log(`🎯 Executing MarketingAutomation: ${automation.name} for ${client._id}`);

      // יבוא לייזי של automationEngine למניעת circular dependency
      const automationEngine = require('./marketing/automationEngine');

      // הרצת כל ה-actions באוטומציה
      for (const action of automation.actions) {
        if (!action.enabled) continue;

        try {
          await automationEngine.executeAction(action, client, automation);
          console.log(`✅ Action executed: ${action.type} for ${client._id}`);
        } catch (error) {
          console.error(`❌ Error executing action ${action.type}:`, error);
          // ממשיכים לפעולה הבאה
        }
      }

      console.log(`✅ MarketingAutomation executed: ${automation.name}`);
    } catch (error) {
      console.error(`❌ Error executing MarketingAutomation ${automation.name}:`, error);
      throw error;
    }
  }

  /**
   * הרצת LeadNurturing
   */
  async executeLeadNurturing(automation, client, context = {}) {
    try {
      console.log(`🎯 Executing LeadNurturing: ${automation.name} for ${client._id}`);

      // יבוא לייזי של leadServiceV2 למניעת circular dependency
      const leadServiceV2 = require('./leadServiceV2');

      // הרצת ה-action
      await leadServiceV2.executeNurturingAction(automation, client, context);

      console.log(`✅ LeadNurturing executed: ${automation.name}`);
    } catch (error) {
      console.error(`❌ Error executing LeadNurturing ${automation.name}:`, error);
      throw error;
    }
  }

  /**
   * הרצת workflow מורכב
   */
  async executeWorkflow(workflowDefinition) {
    try {
      console.log(`🔄 Executing workflow: ${workflowDefinition.name}`);

      const { steps, clientId } = workflowDefinition;

      const client = await Client.findById(clientId);
      if (!client) {
        throw new Error(`Client not found: ${clientId}`);
      }

      for (const step of steps) {
        try {
          await this.executeWorkflowStep(step, client);
          console.log(`✅ Workflow step executed: ${step.type}`);
        } catch (error) {
          console.error(`❌ Error executing workflow step ${step.type}:`, error);

          if (step.onError === 'stop') {
            throw error;
          }
          // אחרת ממשיכים
        }
      }

      console.log(`✅ Workflow executed: ${workflowDefinition.name}`);
    } catch (error) {
      console.error(`❌ Error executing workflow:`, error);
      throw error;
    }
  }

  /**
   * הרצת צעד בודד ב-workflow
   */
  async executeWorkflowStep(step, client) {
    const { type, config } = step;

    switch (type) {
      case 'marketing_automation':
        const marketingAutomation = await MarketingAutomation.findById(config.automationId);
        if (marketingAutomation) {
          await this.executeMarketingAutomation(marketingAutomation, client);
        }
        break;

      case 'lead_nurturing':
        const leadNurturing = await LeadNurturing.findById(config.automationId);
        if (leadNurturing) {
          await this.executeLeadNurturing(leadNurturing, client);
        }
        break;

      case 'ai_bot_conversation':
        const welcomeMessage = config.message || await this.getWelcomeMessage(client);
        await aiBotEngine.handleMessage(client._id, welcomeMessage, config.channel || 'whatsapp');
        break;

      case 'delay':
        await new Promise(resolve => setTimeout(resolve, config.delayMs || 1000));
        break;

      default:
        console.warn(`⚠️ Unknown workflow step type: ${type}`);
    }
  }

  /**
   * קבלת הודעת ברוכים הבאים מותאמת אישית
   */
  async getWelcomeMessage(client) {
    const defaultMessage = `שלום ${client.fullName || 'לקוח יקר'}, תודה על פנייתך! איך אוכל לעזור לך היום?`;

    // אפשר להוסיף לוגיקה מתקדמת יותר בהתאם למקור הליד
    return defaultMessage;
  }
}

// יצירת instance יחיד (Singleton)
const orchestrator = new AutomationOrchestrator();

module.exports = orchestrator;
