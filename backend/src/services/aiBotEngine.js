const axios = require('axios');
const ConversationContext = require('../models/ConversationContext');
const AIBotConfig = require('../models/AIBotConfig');
const Client = require('../models/Client');
const TaskManager = require('../models/TaskManager');
const whatsappService = require('./whatsappService');
const emailService = require('./emailService');

/**
 * AIBotEngine - Core AI conversation engine
 * Handles OpenAI function calling, intent detection, and action execution
 */
class AIBotEngine {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.defaultTemperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '500');
    this.botEnabled = process.env.BOT_ENABLE_FUNCTION_CALLING !== 'false';

    if (!this.openaiApiKey) {
      console.warn('⚠️ OPENAI_API_KEY not set - AI Bot will not function');
    }
  }

  /**
   * Handle incoming message and manage conversation
   * @param {String} clientId - Client ID
   * @param {String} message - User message
   * @param {String} channel - Communication channel (whatsapp/chat/email)
   * @returns {Promise<Object>} Response with bot message and actions taken
   */
  async handleMessage(clientId, message, channel = 'whatsapp') {
    try {
      console.log(`🤖 AI Bot handling message from client ${clientId} on ${channel}`);

      // 1. Get or create conversation context
      const context = await this.getOrCreateContext(clientId, channel);

      // 2. Get client info for personalization
      const client = await Client.findById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // 3. Check if bot is enabled for this client
      if (client.aiPreferences && client.aiPreferences.botEnabled === false) {
        console.log(`⏭️ Bot disabled for client ${clientId}`);
        return { success: false, message: 'Bot disabled for this client' };
      }

      // 4. Get bot config
      const botConfig = await this.getBotConfig(client);

      // 5. Check for stop keywords
      if (botConfig.isStopKeyword(message)) {
        console.log(`🛑 Stop keyword detected, ending conversation`);
        context.complete('stop_keyword');
        await context.save();
        return {
          success: true,
          message: 'שיחה הסתיימה. אם תרצה לדבר איתי שוב, פשוט שלח לי הודעה.',
          conversationEnded: true
        };
      }

      // 6. Check for handoff keywords
      if (botConfig.isHandoffKeyword(message)) {
        console.log(`👋 Handoff keyword detected`);
        await this.handoffToHuman(context, client, 'user_request');
        return {
          success: true,
          message: 'מעביר אותך לנציג אנושי. הוא יחזור אליך בהקדם.',
          handedOff: true
        };
      }

      // 7. Add user message to context
      context.addMessage('user', message);

      // 8. Call OpenAI with function calling
      const openaiResponse = await this.callOpenAI(context, botConfig, client);

      // 9. Handle function calls (if any)
      let actionResults = [];
      if (openaiResponse.function_call) {
        console.log(`🔧 Function call detected: ${openaiResponse.function_call.name}`);
        const actionResult = await this.executeFunction(
          openaiResponse.function_call,
          context,
          botConfig,
          client
        );
        actionResults.push(actionResult);
      }

      // 10. Add assistant response to context
      let assistantMessage = openaiResponse.content || openaiResponse.message?.content;

      // If no message but function was called, generate a confirmation message
      if (!assistantMessage && openaiResponse.function_call) {
        const functionName = openaiResponse.function_call.name;
        if (functionName === 'update_lead_status') {
          assistantMessage = 'עדכנתי את הסטטוס שלך בהצלחה!';
        } else if (functionName === 'schedule_followup') {
          assistantMessage = 'קבעתי את הפגישה בשבילך!';
        } else if (functionName === 'handoff_to_human') {
          assistantMessage = 'מעביר אותך לנציג אנושי. הוא יחזור אליך בהקדם.';
        } else {
          assistantMessage = 'הפעולה בוצעה בהצלחה!';
        }
      }

      if (assistantMessage) {
        context.addMessage('assistant', assistantMessage, openaiResponse.function_call);
      }

      // 11. Check conversation limits
      if (context.messages.length >= botConfig.rules.maxConversationLength) {
        console.log(`⚠️ Max conversation length reached`);
        context.complete('max_length_reached');
        await context.save();
        return {
          success: true,
          message: assistantMessage + '\n\nהשיחה הגיעה לאורך מקסימלי. אם תרצה להמשיך, פנה לנציג.',
          conversationEnded: true,
          actionResults
        };
      }

      // 12. Send response via channel
      await this.sendResponse(context, client, assistantMessage, channel);

      // 13. Save updated context
      await context.save();

      // 14. Update bot stats
      await this.updateBotStats(botConfig, context);

      return {
        success: true,
        message: assistantMessage,
        actionResults,
        conversationId: context.sessionId
      };

    } catch (error) {
      console.error('❌ Error in AI Bot handleMessage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Call OpenAI API with function calling
   * @param {Object} context - Conversation context
   * @param {Object} botConfig - Bot configuration
   * @param {Object} client - Client data
   * @returns {Promise<Object>} OpenAI response
   */
  async callOpenAI(context, botConfig, client) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!this.botEnabled) {
      throw new Error('Bot function calling is disabled');
    }

    // Build messages array
    const messages = this.buildMessages(context, botConfig, client);

    // Get active functions
    const functions = botConfig.getActiveFunctions();

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: botConfig.model || this.defaultModel,
          messages,
          functions: functions.length > 0 ? functions : undefined,
          function_call: functions.length > 0 ? 'auto' : undefined,
          temperature: botConfig.temperature !== undefined ? botConfig.temperature : this.defaultTemperature,
          max_tokens: botConfig.maxTokens || this.maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data.choices[0].message;

    } catch (error) {
      console.error('❌ OpenAI API error:', error.response?.data || error.message);
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Build messages array for OpenAI
   * @param {Object} context - Conversation context
   * @param {Object} botConfig - Bot configuration
   * @param {Object} client - Client data
   * @returns {Array} Messages array
   */
  buildMessages(context, botConfig, client) {
    const messages = [];

    // System prompt with client variables
    const systemPrompt = this.replaceVariables(
      botConfig.systemPrompt,
      client
    );

    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Add conversation history (limit to last 10 messages to save tokens)
    const recentMessages = context.messages.slice(-10);
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    return messages;
  }

  /**
   * Execute function call from OpenAI
   * @param {Object} functionCall - Function call data from OpenAI
   * @param {Object} context - Conversation context
   * @param {Object} botConfig - Bot configuration
   * @param {Object} client - Client data
   * @returns {Promise<Object>} Execution result
   */
  async executeFunction(functionCall, context, botConfig, client) {
    const { name, arguments: argsString } = functionCall;

    try {
      // Parse arguments
      const args = typeof argsString === 'string' ? JSON.parse(argsString) : argsString;

      console.log(`🔧 Executing function: ${name}`, args);

      // Get function mapping from bot config
      const mapping = botConfig.getFunctionMapping(name);

      if (!mapping) {
        console.error(`❌ No mapping found for function: ${name}`);
        return { success: false, error: 'Function mapping not found' };
      }

      // Execute the mapped action
      let result;
      switch (mapping.type) {
        case 'create_task':
          result = await this.createTask(client, args, context);
          break;

        case 'schedule_followup':
          result = await this.scheduleFollowup(client, args, context);
          break;

        case 'update_lead_status':
          result = await this.updateLeadStatus(client, args, context);
          break;

        case 'send_notification':
          result = await this.sendNotification(client, args, context);
          break;

        case 'send_email':
          result = await this.sendEmail(client, args, context);
          break;

        case 'send_whatsapp':
          result = await this.sendWhatsApp(client, args, context);
          break;

        case 'handoff_to_human':
          result = await this.handoffToHuman(context, client, args.reason, args.urgency);
          break;

        case 'collect_information':
          result = await this.collectInformation(client, args, context);
          break;

        case 'provide_information':
          result = { success: true, message: 'Information provided in conversation' };
          break;

        default:
          result = { success: false, error: `Unknown action type: ${mapping.type}` };
      }

      // Record action in context
      context.triggeredActions.push({
        automationId: mapping.automationId,
        actionType: mapping.type,
        success: result.success,
        result: result
      });

      // Update bot stats
      botConfig.updateStats({ totalActionsTriggered: 1 });
      await botConfig.save();

      return result;

    } catch (error) {
      console.error(`❌ Error executing function ${name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // Action Implementations
  // ============================================================================

  /**
   * Create task for client
   */
  async createTask(client, args, context) {
    try {
      const task = await TaskManager.create({
        title: args.title || `Follow-up: ${client.personalInfo.fullName}`,
        description: args.notes || args.description || 'Task created by AI Bot',
        taskType: args.type || 'follow_up',
        priority: args.priority || 'medium',
        dueDate: args.date ? new Date(args.date) : undefined,
        relatedTo: {
          model: 'Client',
          id: client._id
        },
        metadata: {
          source: 'ai_bot',
          conversationId: context.sessionId
        }
      });

      console.log(`✅ Task created: ${task._id}`);

      return {
        success: true,
        message: 'Task created successfully',
        data: { taskId: task._id, title: task.title }
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule follow-up interaction
   */
  async scheduleFollowup(client, args, context) {
    try {
      const followupDate = args.date ? new Date(args.date) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      client.interactions.push({
        type: args.type || 'note',
        direction: 'outbound',
        subject: `Follow-up scheduled`,
        content: args.notes || 'Follow-up scheduled by AI Bot',
        nextFollowUp: followupDate,
        timestamp: new Date(),
        scheduledFor: followupDate,
        createdBy: null, // Bot created
        metadata: {
          source: 'ai_bot',
          conversationId: context.sessionId
        }
      });

      await client.save();

      console.log(`✅ Follow-up scheduled for ${followupDate}`);

      return {
        success: true,
        message: 'Follow-up scheduled successfully',
        data: { followupDate }
      };
    } catch (error) {
      console.error('Error scheduling followup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(client, args, context) {
    try {
      const oldStatus = client.status;
      client.status = args.newStatus;

      // Add interaction documenting status change
      client.interactions.push({
        type: 'note',
        direction: 'inbound',
        subject: `Status changed: ${oldStatus} → ${args.newStatus}`,
        content: args.reason || 'Status changed by AI Bot during conversation',
        timestamp: new Date(),
        createdBy: null,
        metadata: {
          source: 'ai_bot',
          conversationId: context.sessionId,
          oldStatus,
          newStatus: args.newStatus
        }
      });

      await client.save();

      console.log(`✅ Lead status updated: ${oldStatus} → ${args.newStatus}`);

      return {
        success: true,
        message: 'Lead status updated',
        data: { oldStatus, newStatus: args.newStatus }
      };
    } catch (error) {
      console.error('Error updating lead status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification
   */
  async sendNotification(client, args, context) {
    console.log(`🔔 Send notification action (placeholder): ${args.message}`);
    return {
      success: true,
      message: 'Notification sent (placeholder)',
      data: args
    };
  }

  /**
   * Send email
   */
  async sendEmail(client, args, context) {
    try {
      const result = await emailService.sendEmail(
        args.to || client.personalInfo.email,
        args.subject || 'Message from BizFlow',
        args.body || args.message,
        args.text
      );

      return {
        success: result.success,
        message: 'Email sent',
        data: { messageId: result.messageId }
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(client, args, context) {
    try {
      const result = await whatsappService.sendMessage(
        client.personalInfo.phone,
        args.message
      );

      return {
        success: result.success,
        message: 'WhatsApp sent',
        data: { messageId: result.messageId }
      };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handoff conversation to human
   */
  async handoffToHuman(context, client, reason = 'user_request', urgency = 'medium') {
    console.log(`👋 Handing off conversation ${context.sessionId} to human`);

    context.handoffToHuman(null, reason, null);

    // Create high-priority task for human agent
    await TaskManager.create({
      title: `🚨 Bot handoff: ${client.personalInfo.fullName}`,
      description: `AI Bot handed off conversation.\nReason: ${reason}\nUrgency: ${urgency}`,
      taskType: 'follow_up',
      priority: urgency === 'high' ? 'urgent' : 'high',
      relatedTo: {
        model: 'Client',
        id: client._id
      },
      metadata: {
        source: 'ai_bot_handoff',
        conversationId: context.sessionId,
        reason
      }
    });

    await context.save();

    return {
      success: true,
      message: 'Conversation handed off to human',
      data: { reason, urgency }
    };
  }

  /**
   * Collect information from user
   */
  async collectInformation(client, args, context) {
    // Store collected info in context
    context.context.variables = {
      ...context.context.variables,
      ...args
    };

    return {
      success: true,
      message: 'Information collected',
      data: args
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get or create conversation context
   */
  async getOrCreateContext(clientId, channel) {
    return ConversationContext.getOrCreate(clientId, channel);
  }

  /**
   * Get bot configuration for client
   */
  async getBotConfig(client) {
    let botConfig;

    // Check if client has custom bot config
    if (client.aiPreferences?.customBotConfigId) {
      botConfig = await AIBotConfig.findById(client.aiPreferences.customBotConfigId);
    }

    // Fall back to default bot
    if (!botConfig) {
      botConfig = await AIBotConfig.getBotForEvent('new_message', {
        leadSource: client.leadSource,
        status: client.status
      });
    }

    // Fall back to default bot
    if (!botConfig) {
      await AIBotConfig.ensureDefaultBot();
      botConfig = await AIBotConfig.getDefaultBot();
    }

    if (!botConfig) {
      throw new Error('No bot configuration available');
    }

    return botConfig;
  }

  /**
   * Send response via appropriate channel
   */
  async sendResponse(context, client, message, channel) {
    if (!message) return;

    switch (channel) {
      case 'whatsapp':
        try {
          await whatsappService.sendMessage(
            client.personalInfo.phone,
            message
          );
        } catch (error) {
          console.error('Error sending WhatsApp response:', error);
        }
        break;

      case 'email':
        try {
          await emailService.sendEmail(
            client.personalInfo.email,
            'Message from BizFlow AI Assistant',
            message,
            message
          );
        } catch (error) {
          console.error('Error sending email response:', error);
        }
        break;

      case 'chat':
        // For web chat, response is returned to frontend
        console.log('💬 Chat response ready (to be sent by frontend)');
        break;

      default:
        console.warn(`Unknown channel: ${channel}`);
    }
  }

  /**
   * Replace variables in text
   */
  replaceVariables(text, client) {
    if (!text || !client) return text;

    return text
      .replace(/{name}/g, client.personalInfo.fullName || 'לקוח יקר')
      .replace(/{firstName}/g, (client.personalInfo.fullName || '').split(' ')[0] || 'שלום')
      .replace(/{business}/g, client.businessInfo.businessName || '')
      .replace(/{email}/g, client.personalInfo.email || '')
      .replace(/{phone}/g, client.personalInfo.phone || '');
  }

  /**
   * Update bot statistics
   */
  async updateBotStats(botConfig, context) {
    try {
      botConfig.stats.totalMessages += 1;

      if (context.status === 'completed') {
        botConfig.stats.conversationsCompleted += 1;
      } else if (context.status === 'abandoned') {
        botConfig.stats.conversationsAbandoned += 1;
      } else if (context.status === 'handoff') {
        botConfig.stats.conversationsHandedOff += 1;
      }

      await botConfig.save();
    } catch (error) {
      console.error('Error updating bot stats:', error);
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(contextId) {
    const context = await ConversationContext.findById(contextId);
    if (context) {
      context.status = 'abandoned';
      await context.save();
    }
  }

  /**
   * Get active conversations for client
   */
  async getActiveConversations(clientId) {
    return ConversationContext.getActiveConversations(clientId);
  }
}

// Export singleton instance
module.exports = new AIBotEngine();
