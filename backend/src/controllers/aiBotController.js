const AIBotConfig = require('../models/AIBotConfig');
const ConversationContext = require('../models/ConversationContext');
const Client = require('../models/Client');
const aiBotEngine = require('../services/aiBotEngine');

/**
 * aiBotController
 *
 * Controller לניהול AI Bot configs ושיחות
 */

/**
 * יצירת bot config חדש
 * POST /api/ai-bots/bot-configs
 */
exports.createBotConfig = async (req, res) => {
  try {
    const {
      name,
      description,
      isActive,
      systemPrompt,
      temperature,
      model,
      maxTokens,
      functions,
      triggers,
      rules
    } = req.body;

    // יצירת bot config חדש
    const botConfig = await AIBotConfig.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      systemPrompt,
      temperature,
      model,
      maxTokens,
      functions,
      triggers,
      rules,
      createdBy: req.user?._id
    });

    console.log(`✅ Bot config created: ${botConfig.name} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: botConfig
    });
  } catch (error) {
    console.error('❌ Error creating bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת כל ה-bot configs
 * GET /api/ai-bots/bot-configs
 */
exports.getBotConfigs = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const botConfigs = await AIBotConfig.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email fullName')
      .populate('updatedBy', 'email fullName');

    res.json({
      success: true,
      count: botConfigs.length,
      data: botConfigs
    });
  } catch (error) {
    console.error('❌ Error getting bot configs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת bot config לפי ID
 * GET /api/ai-bots/bot-configs/:id
 */
exports.getBotConfigById = async (req, res) => {
  try {
    const { id } = req.params;

    const botConfig = await AIBotConfig.findById(id)
      .populate('createdBy', 'email fullName')
      .populate('updatedBy', 'email fullName');

    if (!botConfig) {
      return res.status(404).json({
        success: false,
        error: 'Bot config not found'
      });
    }

    res.json({
      success: true,
      data: botConfig
    });
  } catch (error) {
    console.error('❌ Error getting bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * עדכון bot config
 * PUT /api/ai-bots/bot-configs/:id
 */
exports.updateBotConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // הוספת updatedBy
    updates.updatedBy = req.user?._id;

    const botConfig = await AIBotConfig.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!botConfig) {
      return res.status(404).json({
        success: false,
        error: 'Bot config not found'
      });
    }

    console.log(`✅ Bot config updated: ${botConfig.name} by ${req.user?.email}`);

    res.json({
      success: true,
      data: botConfig
    });
  } catch (error) {
    console.error('❌ Error updating bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * מחיקת bot config
 * DELETE /api/ai-bots/bot-configs/:id
 */
exports.deleteBotConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const botConfig = await AIBotConfig.findByIdAndDelete(id);

    if (!botConfig) {
      return res.status(404).json({
        success: false,
        error: 'Bot config not found'
      });
    }

    console.log(`✅ Bot config deleted: ${botConfig.name} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Bot config deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * הפעלה/כיבוי של bot config
 * PATCH /api/ai-bots/bot-configs/:id/toggle
 */
exports.toggleBotConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const botConfig = await AIBotConfig.findById(id);

    if (!botConfig) {
      return res.status(404).json({
        success: false,
        error: 'Bot config not found'
      });
    }

    botConfig.isActive = !botConfig.isActive;
    botConfig.updatedBy = req.user?._id;
    await botConfig.save();

    console.log(`✅ Bot config toggled: ${botConfig.name} -> ${botConfig.isActive ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      data: botConfig
    });
  } catch (error) {
    console.error('❌ Error toggling bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * בדיקת bot conversation (test mode)
 * POST /api/ai-bots/conversations/test
 */
exports.testBotConversation = async (req, res) => {
  try {
    const { clientId, message, channel = 'whatsapp' } = req.body;

    if (!clientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'clientId and message are required'
      });
    }

    // בדיקת קיום הלקוח
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // הרצת ה-bot
    const response = await aiBotEngine.handleMessage(clientId, message, channel);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('❌ Error testing bot conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת שיחות של לקוח
 * GET /api/ai-bots/conversations/:clientId
 */
exports.getClientConversations = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, channel, limit = 10 } = req.query;

    const query = { client: clientId };

    if (status) {
      query.status = status;
    }

    if (channel) {
      query.channel = channel;
    }

    const conversations = await ConversationContext.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('client', 'fullName personalInfo.phone personalInfo.email');

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('❌ Error getting client conversations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת הודעות של שיחה
 * GET /api/ai-bots/conversations/:id/messages
 */
exports.getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await ConversationContext.findById(id)
      .populate('client', 'fullName personalInfo.phone personalInfo.email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: {
        conversation: conversation.getSummary(),
        messages: conversation.messages
      }
    });
  } catch (error) {
    console.error('❌ Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * העברה לנציג אנושי (handoff)
 * POST /api/ai-bots/conversations/:id/handoff
 */
exports.handoffToHuman = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, assignedTo } = req.body;

    const conversation = await ConversationContext.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // העברה לנציג
    conversation.handoffToHuman(req.user?._id, reason, assignedTo);
    await conversation.save();

    console.log(`✅ Conversation handed off: ${conversation.sessionId} by ${req.user?.email}`);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('❌ Error handing off conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * ארכוב שיחה
 * DELETE /api/ai-bots/conversations/:id
 */
exports.archiveConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await ConversationContext.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    conversation.complete('Archived by user');
    await conversation.save();

    console.log(`✅ Conversation archived: ${conversation.sessionId} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('❌ Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת סטטיסטיקות של bot
 * GET /api/ai-bots/stats
 */
exports.getBotStats = async (req, res) => {
  try {
    const { botConfigId, startDate, endDate } = req.query;

    // בניית query לסטטיסטיקות
    const filter = {};

    if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    }

    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    }

    // קבלת סטטיסטיקות מ-ConversationContext
    const conversationStats = await ConversationContext.getStats(filter);

    // קבלת סטטיסטיקות מ-bot configs
    const botStats = await AIBotConfig.find({ isActive: true }).select('name stats');

    res.json({
      success: true,
      data: {
        conversations: conversationStats,
        bots: botStats
      }
    });
  } catch (error) {
    console.error('❌ Error getting bot stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * קבלת default bot config
 * GET /api/ai-bots/bot-configs/default
 */
exports.getDefaultBotConfig = async (req, res) => {
  try {
    let defaultBot = await AIBotConfig.getDefaultBot();

    // אם אין bot ברירת מחדל, ניצור אחד
    if (!defaultBot) {
      defaultBot = await AIBotConfig.ensureDefaultBot();
    }

    res.json({
      success: true,
      data: defaultBot
    });
  } catch (error) {
    console.error('❌ Error getting default bot config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * יצירת bot ברירת מחדל אם לא קיים
 * POST /api/ai-bots/bot-configs/ensure-default
 */
exports.ensureDefaultBot = async (req, res) => {
  try {
    const defaultBot = await AIBotConfig.ensureDefaultBot();

    res.json({
      success: true,
      data: defaultBot,
      message: defaultBot.createdAt === defaultBot.updatedAt
        ? 'Default bot created'
        : 'Default bot already exists'
    });
  } catch (error) {
    console.error('❌ Error ensuring default bot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * עדכון סטטיסטיקות של bot
 * PATCH /api/ai-bots/bot-configs/:id/stats
 */
exports.updateBotStats = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const botConfig = await AIBotConfig.findById(id);

    if (!botConfig) {
      return res.status(404).json({
        success: false,
        error: 'Bot config not found'
      });
    }

    botConfig.updateStats(updates);
    await botConfig.save();

    res.json({
      success: true,
      data: botConfig
    });
  } catch (error) {
    console.error('❌ Error updating bot stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
