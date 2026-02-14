const AIBotConfig = require('../models/AIBotConfig');

/**
 * Admin Bot Config Controller
 * CRUD operations for managing AI bot configuration
 */

/**
 * GET /api/admin/bot-config
 * Get the active bot configuration (singleton-ish — returns the first active)
 */
exports.getConfig = async (req, res) => {
  try {
    let config = await AIBotConfig.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!config) {
      config = await AIBotConfig.ensureDefaultBot();
    }

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('❌ Error getting bot config:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת הגדרות הבוט' });
  }
};

/**
 * PUT /api/admin/bot-config
 * Update the bot configuration
 */
exports.updateConfig = async (req, res) => {
  try {
    let config = await AIBotConfig.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!config) {
      config = await AIBotConfig.ensureDefaultBot();
    }

    const {
      name,
      description,
      isActive,
      systemPrompt,
      temperature,
      model,
      maxTokens,
      websiteChat,
      knowledgeBase,
      faqItems,
      restrictedTopics,
      rules
    } = req.body;

    if (name !== undefined) config.name = name;
    if (description !== undefined) config.description = description;
    if (isActive !== undefined) config.isActive = isActive;
    if (systemPrompt !== undefined) config.systemPrompt = systemPrompt;
    if (temperature !== undefined) config.temperature = temperature;
    if (model !== undefined) config.model = model;
    if (maxTokens !== undefined) config.maxTokens = maxTokens;

    if (websiteChat !== undefined) {
      config.websiteChat = { ...config.websiteChat?.toObject?.() || {}, ...websiteChat };
    }

    if (knowledgeBase !== undefined) config.knowledgeBase = knowledgeBase;
    if (faqItems !== undefined) config.faqItems = faqItems;
    if (restrictedTopics !== undefined) config.restrictedTopics = restrictedTopics;

    if (rules !== undefined) {
      config.rules = { ...config.rules?.toObject?.() || {}, ...rules };
    }

    config.updatedBy = req.user?._id;
    await config.save();

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('❌ Error updating bot config:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון הגדרות הבוט' });
  }
};

/**
 * GET /api/admin/bot-config/stats
 * Get bot conversation statistics
 */
exports.getStats = async (req, res) => {
  try {
    const config = await AIBotConfig.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!config) {
      return res.status(200).json({ success: true, data: { stats: {} } });
    }

    return res.status(200).json({ success: true, data: { stats: config.stats } });
  } catch (error) {
    console.error('❌ Error getting bot stats:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת סטטיסטיקות' });
  }
};
