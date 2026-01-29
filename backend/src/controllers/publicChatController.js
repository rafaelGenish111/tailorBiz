/**
 * Public Chat Controller
 *
 * מטפל בבקשות צ'אט ציבוריות מהאתר (לא דורש אימות)
 */

const Client = require('../models/Client');
const ConversationContext = require('../models/ConversationContext');
const aiBotEngine = require('../services/aiBotEngine');

/**
 * Send message to bot (public endpoint - no auth required)
 * POST /api/public/chat/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, clientInfo } = req.body;

    // Validation
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Find or create client based on session
    let client = await Client.findOne({
      'aiPreferences.webChatSessionId': sessionId
    });

    if (!client && clientInfo) {
      // Create new client if this is the first message and we have client info
      const timestamp = Date.now();
      client = await Client.create({
        fullName: clientInfo.name || 'Website Visitor',
        personalInfo: {
          fullName: clientInfo.name || 'Website Visitor',
          email: clientInfo.email || `visitor-${timestamp}@webchat.temp`,
          phone: clientInfo.phone || `050${String(timestamp).slice(-7)}`
        },
        businessInfo: {
          businessName: clientInfo.businessName || 'Unknown',
          businessType: clientInfo.businessType || 'other'
        },
        leadSource: 'website_chat',
        source: 'website_chat',
        status: 'new_lead',
        aiPreferences: {
          botEnabled: true,
          preferredLanguage: clientInfo.language || 'he',
          communicationStyle: 'professional',
          webChatSessionId: sessionId
        }
      });
    } else if (!client) {
      // No client found and no client info provided - create anonymous visitor
      const timestamp = Date.now();
      client = await Client.create({
        fullName: 'Anonymous Visitor',
        personalInfo: {
          fullName: 'Anonymous Visitor',
          email: `visitor-${timestamp}@webchat.temp`,
          phone: `050${String(timestamp).slice(-7)}`
        },
        businessInfo: {
          businessName: 'Unknown',
          businessType: 'other'
        },
        leadSource: 'website_chat',
        source: 'website_chat',
        status: 'new_lead',
        aiPreferences: {
          botEnabled: true,
          preferredLanguage: 'he',
          communicationStyle: 'professional',
          webChatSessionId: sessionId
        }
      });
    }

    // Send message to bot
    const response = await aiBotEngine.handleMessage(client._id, message, 'chat');

    // Return response
    res.json({
      success: true,
      message: response.message,
      conversationId: response.conversationId,
      clientId: client._id,
      actions: response.actionResults || []
    });

  } catch (error) {
    console.error('Error in public chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get conversation history (public endpoint)
 * GET /api/public/chat/history/:sessionId
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Find client by session ID
    const client = await Client.findOne({
      'aiPreferences.webChatSessionId': sessionId
    });

    if (!client) {
      return res.json({
        success: true,
        messages: [],
        conversationId: null
      });
    }

    // Get active conversation
    const conversation = await ConversationContext.findOne({
      client: client._id,
      channel: 'chat',
      status: { $in: ['active', 'waiting'] }
    }).sort({ lastActivityAt: -1 });

    if (!conversation) {
      return res.json({
        success: true,
        messages: [],
        conversationId: null
      });
    }

    // Return messages (without system messages)
    const messages = conversation.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

    res.json({
      success: true,
      messages,
      conversationId: conversation.sessionId,
      status: conversation.status
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history'
    });
  }
};

/**
 * Initialize chat session (public endpoint)
 * POST /api/public/chat/init
 */
exports.initSession = async (req, res) => {
  try {
    const { clientInfo } = req.body;

    // Generate unique session ID
    const sessionId = `webchat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      sessionId,
      botName: 'BizFlow Assistant',
      welcomeMessage: 'שלום! 👋 אני העוזר הווירטואלי של BizFlow. איך אוכל לעזור לך היום?'
    });

  } catch (error) {
    console.error('Error initializing chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize chat session'
    });
  }
};

/**
 * End chat session (public endpoint)
 * POST /api/public/chat/end/:sessionId
 */
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find client
    const client = await Client.findOne({
      'aiPreferences.webChatSessionId': sessionId
    });

    if (client) {
      // Find and complete active conversations
      await ConversationContext.updateMany(
        {
          client: client._id,
          channel: 'chat',
          status: 'active'
        },
        {
          status: 'completed',
          'context.endReason': 'user_ended'
        }
      );
    }

    res.json({
      success: true,
      message: 'Chat session ended'
    });

  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end chat session'
    });
  }
};
