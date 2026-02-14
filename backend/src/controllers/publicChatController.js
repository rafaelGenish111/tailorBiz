const axios = require('axios');
const crypto = require('crypto');
const AIBotConfig = require('../models/AIBotConfig');
const Client = require('../models/Client');

/**
 * Public Chat Controller
 * Handles anonymous website chat sessions powered by AI
 * Uses in-memory session store (sessions auto-expire after 30 min)
 */

// In-memory session store: sessionId -> { messages[], botConfigId, createdAt, lastActivity, leadCollected }
const sessions = new Map();

// Clean up expired sessions every 5 minutes
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);
cleanupTimer.unref(); // Don't keep the process alive just for cleanup

/**
 * OpenAI function definition for collecting lead details
 */
const COLLECT_LEAD_FUNCTION = {
  name: 'collect_lead',
  description: 'Save contact details of a potential lead/customer who wants to be contacted. Call this when you have collected the person\'s name and phone number.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Full name of the lead (שם מלא)'
      },
      phone: {
        type: 'string',
        description: 'Phone number of the lead (מספר טלפון)'
      },
      email: {
        type: 'string',
        description: 'Email address (optional)'
      },
      company: {
        type: 'string',
        description: 'Business/company name (optional)'
      },
      notes: {
        type: 'string',
        description: 'Summary of what the lead is interested in, based on the conversation'
      }
    },
    required: ['name', 'phone']
  }
};

/**
 * Build a rich system prompt from the bot config, including knowledge base, FAQ, and restrictions
 */
function buildSystemPrompt(botConfig) {
  let prompt = botConfig.systemPrompt || '';

  // Add knowledge base
  const activeKB = (botConfig.knowledgeBase || []).filter(k => k.enabled);
  if (activeKB.length > 0) {
    prompt += '\n\n=== מאגר ידע ===\n';
    prompt += 'השתמש במידע הבא כדי לענות על שאלות:\n\n';
    activeKB.forEach(kb => {
      prompt += `## ${kb.topic}\n${kb.content}\n\n`;
    });
  }

  // Add FAQ
  const activeFAQ = (botConfig.faqItems || []).filter(f => f.enabled);
  if (activeFAQ.length > 0) {
    prompt += '\n=== שאלות נפוצות ===\n';
    prompt += 'אם נשאלת אחת מהשאלות הבאות, ענה בהתאם:\n\n';
    activeFAQ.forEach(faq => {
      prompt += `ש: ${faq.question}\nת: ${faq.answer}\n\n`;
    });
  }

  // Add restricted topics
  const restricted = botConfig.restrictedTopics || [];
  if (restricted.length > 0) {
    prompt += '\n=== נושאים מוגבלים ===\n';
    prompt += 'אסור לך לענות על שאלות בנושאים הבאים. במקום זאת, השתמש בתשובה המתאימה:\n\n';
    restricted.forEach(r => {
      prompt += `- נושא: ${r.topic} → תשובה: ${r.responseMessage}\n`;
    });
  }

  // Add lead collection instructions
  prompt += '\n\n=== איסוף פרטי לידים ===\n';
  prompt += 'כאשר המשתמש מביע עניין בשירותים או מבקש שיחזרו אליו, בקש ממנו שם מלא ומספר טלפון.\n';
  prompt += 'ברגע שקיבלת שם וטלפון, השתמש בפונקציה collect_lead כדי לשמור את הפרטים.\n';
  prompt += 'אל תבקש פרטים אם המשתמש רק שואל שאלות כלליות - רק כשהוא מביע עניין ממשי.\n';

  return prompt;
}

/**
 * Normalize Israeli phone number to digits only
 */
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972') && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

/**
 * Create or update a lead in the CRM
 */
async function saveLead({ name, phone, email, company, notes, sessionId }) {
  const phoneDigits = normalizePhone(phone);
  if (!phoneDigits) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    // Check for existing lead by phone
    let existing = await Client.findOne({ 'personalInfo.phone': phoneDigits });

    const interactionContent = [
      notes || '',
      '',
      '---',
      `שם: ${name}`,
      company ? `עסק: ${company}` : '',
      `טלפון: ${phoneDigits}`,
      email ? `אימייל: ${email}` : '',
      `מקור: שיחת צ'אט באתר`
    ].filter(Boolean).join('\n').trim();

    if (existing) {
      // Update existing lead
      if (name && !existing.personalInfo?.fullName) {
        existing.personalInfo.fullName = name;
      }
      if (email && !existing.personalInfo?.email) {
        existing.personalInfo.email = email;
      }
      if (company && (!existing.businessInfo?.businessName || existing.businessInfo.businessName === 'לא צוין')) {
        existing.businessInfo = existing.businessInfo || {};
        existing.businessInfo.businessName = company;
      }

      existing.tags = Array.from(new Set([...(existing.tags || []), 'צ\'אט באתר', 'chat_bot']));

      existing.interactions = existing.interactions || [];
      existing.interactions.push({
        type: 'note',
        direction: 'inbound',
        subject: '💬 פנייה מצ\'אט AI באתר',
        content: interactionContent,
        timestamp: new Date(),
        completed: true,
      });

      await existing.save();

      // Trigger automations asynchronously
      try {
        const triggerHandler = require('../services/triggerHandler');
        triggerHandler.handleNewLead(existing._id).catch(() => {});
      } catch (_) {}

      return { success: true, clientId: existing._id, updated: true };
    }

    // Create new lead
    const client = new Client({
      personalInfo: {
        fullName: name,
        phone: phoneDigits,
        email: email || undefined,
        whatsappPhone: phoneDigits,
        preferredContactMethod: email ? 'email' : 'phone',
      },
      businessInfo: {
        businessName: company || 'לא צוין',
      },
      leadSource: 'chat_bot',
      status: 'new_lead',
      tags: ['ליד חדש', 'צ\'אט באתר', 'chat_bot'],
      interactions: [
        {
          type: 'note',
          direction: 'inbound',
          subject: '💬 פנייה מצ\'אט AI באתר',
          content: interactionContent,
          timestamp: new Date(),
          completed: true,
        },
      ],
      metadata: {
        createdBy: null,
        assignedTo: null,
      },
    });

    await client.save();

    // Trigger automations asynchronously
    try {
      const triggerHandler = require('../services/triggerHandler');
      triggerHandler.handleNewLead(client._id).catch(() => {});
    } catch (_) {}

    return { success: true, clientId: client._id, created: true };
  } catch (error) {
    console.error('❌ Error saving lead from chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * POST /api/public/chat/init
 * Initialize a new chat session
 */
exports.initChat = async (req, res) => {
  try {
    // Get the default/active bot config
    let botConfig = await AIBotConfig.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!botConfig) {
      await AIBotConfig.ensureDefaultBot();
      botConfig = await AIBotConfig.getDefaultBot();
    }

    if (!botConfig || !botConfig.websiteChat?.enabled) {
      return res.status(200).json({
        success: true,
        sessionId: null,
        welcomeMessage: 'הצ\'אט אינו זמין כרגע. אנא צרו קשר דרך טופס יצירת הקשר.',
        enabled: false
      });
    }

    const sessionId = crypto.randomUUID();
    const welcomeMessage = botConfig.websiteChat?.welcomeMessage ||
      'שלום! 👋 איך אוכל לעזור לך?';

    sessions.set(sessionId, {
      messages: [{ role: 'assistant', content: welcomeMessage }],
      botConfigId: botConfig._id,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      leadCollected: false
    });

    // Update bot stats
    botConfig.stats.conversationsStarted += 1;
    await botConfig.save();

    return res.status(200).json({
      success: true,
      sessionId,
      welcomeMessage,
      botName: botConfig.websiteChat?.botName || 'Assistant',
      enabled: true
    });
  } catch (error) {
    console.error('❌ Chat init error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה באתחול הצ\'אט'
    });
  }
};

/**
 * POST /api/public/chat/message
 * Send a message and get AI response
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session expired or not found. Please refresh the chat.'
      });
    }

    // Get bot config
    const botConfig = await AIBotConfig.findById(session.botConfigId);
    if (!botConfig) {
      return res.status(500).json({
        success: false,
        message: 'Bot configuration not found'
      });
    }

    // Check stop keywords
    if (botConfig.isStopKeyword(message)) {
      sessions.delete(sessionId);
      return res.status(200).json({
        success: true,
        message: 'תודה שפנית אלינו! אם תצטרך עזרה נוספת, אנחנו כאן.',
        conversationEnded: true
      });
    }

    // Check handoff keywords
    if (botConfig.isHandoffKeyword(message)) {
      sessions.delete(sessionId);
      return res.status(200).json({
        success: true,
        message: 'מעביר אותך לנציג אנושי. ניתן גם ליצור קשר דרך טופס יצירת הקשר או בטלפון.',
        conversationEnded: true
      });
    }

    // Add user message to session
    session.messages.push({ role: 'user', content: message.trim() });
    session.lastActivity = Date.now();

    // Check conversation length limit
    const maxLength = botConfig.rules?.maxConversationLength || 20;
    if (session.messages.length > maxLength * 2) {
      return res.status(200).json({
        success: true,
        message: 'השיחה הגיעה לאורך מקסימלי. לפרטים נוספים ניתן ליצור קשר דרך טופס יצירת הקשר.',
        conversationEnded: true
      });
    }

    // Build system prompt with knowledge base, FAQ, and restrictions
    const systemPrompt = buildSystemPrompt(botConfig);

    // Build messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...session.messages.slice(-10) // Last 10 messages for context
    ];

    // Call OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    // Include lead collection function in the call
    const functions = [COLLECT_LEAD_FUNCTION];

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: botConfig.model || 'gpt-4o-mini',
        messages: openaiMessages,
        functions,
        function_call: 'auto',
        temperature: botConfig.temperature ?? 0.7,
        max_tokens: botConfig.maxTokens || 500
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const choice = openaiResponse.data.choices[0]?.message;
    let assistantMessage = choice?.content || '';

    // Handle function call - the AI wants to save a lead
    if (choice?.function_call?.name === 'collect_lead') {
      try {
        const args = JSON.parse(choice.function_call.arguments);
        console.log('📋 Bot collecting lead:', args);

        const result = await saveLead({
          name: args.name,
          phone: args.phone,
          email: args.email,
          company: args.company,
          notes: args.notes,
          sessionId
        });

        session.leadCollected = true;

        // Send the function result back to OpenAI for a human-friendly response
        openaiMessages.push({
          role: 'assistant',
          content: null,
          function_call: choice.function_call
        });
        openaiMessages.push({
          role: 'function',
          name: 'collect_lead',
          content: JSON.stringify({
            success: result.success,
            message: result.success ? 'הפרטים נשמרו בהצלחה' : 'שגיאה בשמירת הפרטים'
          })
        });

        // Get a follow-up message from the AI
        const followUpResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: botConfig.model || 'gpt-4o-mini',
            messages: openaiMessages,
            temperature: botConfig.temperature ?? 0.7,
            max_tokens: botConfig.maxTokens || 500
          },
          {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        assistantMessage = followUpResponse.data.choices[0]?.message?.content ||
          'תודה! קיבלתי את הפרטים שלך. נחזור אליך בהקדם.';

      } catch (fnError) {
        console.error('❌ Error handling collect_lead function:', fnError);
        assistantMessage = 'תודה על הפרטים! נחזור אליך בהקדם.';
      }
    }

    if (!assistantMessage) {
      assistantMessage = 'מצטער, לא הצלחתי לעבד את השאלה. נסה שוב.';
    }

    // Add assistant response to session
    session.messages.push({ role: 'assistant', content: assistantMessage });

    // Update bot stats
    botConfig.stats.totalMessages += 1;
    await botConfig.save();

    return res.status(200).json({
      success: true,
      message: assistantMessage
    });

  } catch (error) {
    console.error('❌ Chat message error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'מצטער, אירעה שגיאה. אנא נסה שוב.'
    });
  }
};
