const mongoose = require('mongoose');

/**
 * AIBotConfig Model
 * Configuration for AI-powered conversation bots
 * Defines bot personality, supported intents (functions), triggers, and conversation rules
 */
const aiBotConfigSchema = new mongoose.Schema({
  // Bot identification
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true
  },

  // Bot personality & behavior
  systemPrompt: {
    type: String,
    required: true,
    default: 'You are a helpful assistant for BizFlow CRM. You help business owners manage their leads and clients. Be professional, friendly, and concise in Hebrew (RTL).'
  },

  // OpenAI settings
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 2
  },

  model: {
    type: String,
    default: 'gpt-4o-mini',
    enum: ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo']
  },

  maxTokens: {
    type: Number,
    default: 500,
    min: 50,
    max: 4000
  },

  // Supported functions (intents) with OpenAI function calling schema
  functions: [{
    // Function name (used by OpenAI)
    name: {
      type: String,
      required: true
    },

    // Function description for OpenAI
    description: {
      type: String,
      required: true
    },

    // JSON Schema for function parameters
    parameters: {
      type: Object,
      required: true,
      default: {
        type: 'object',
        properties: {},
        required: []
      }
    },

    // Action mapping - what to do when this intent is detected
    actionMapping: {
      type: {
        type: String,
        enum: [
          'create_task',
          'schedule_followup',
          'update_lead_status',
          'send_notification',
          'send_email',
          'send_whatsapp',
          'handoff_to_human',
          'collect_information',
          'provide_information'
        ],
        required: true
      },

      // Reference to automation or template
      automationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeadNurturing'
      },

      // Additional config for this action
      config: {
        type: Object,
        default: {}
      }
    },

    // Whether this function is enabled
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // Triggers - when to start this bot
  triggers: [{
    // Event that triggers this bot
    event: {
      type: String,
      enum: [
        'new_message',
        'new_lead',
        'no_response_24h',
        'keyword_detected',
        'status_change',
        'manual'
      ],
      required: true
    },

    // Conditions for this trigger
    conditions: {
      // Keywords to detect
      keywords: [String],

      // Lead source filter
      leadSources: [String],

      // Status filters
      statuses: [String],

      // Time-based conditions
      timeWindow: {
        start: String,  // HH:mm format
        end: String     // HH:mm format
      }
    },

    // Whether this trigger is enabled
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // Website chat configuration
  websiteChat: {
    // Welcome message when chat opens
    welcomeMessage: {
      type: String,
      default: 'שלום! 👋 אני העוזר הווירטואלי של TailorBiz. איך אוכל לעזור לך?'
    },

    // Bot display name in chat
    botName: {
      type: String,
      default: 'TailorBiz Assistant'
    },

    // Enable/disable the chat widget on the website
    enabled: {
      type: Boolean,
      default: true
    }
  },

  // Knowledge base - structured info the bot can reference
  knowledgeBase: [{
    topic: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // FAQ items - pre-defined Q&A pairs
  faqItems: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // Topics the bot should NOT discuss
  restrictedTopics: [{
    topic: {
      type: String,
      required: true,
      trim: true
    },
    responseMessage: {
      type: String,
      default: 'לא אוכל לענות על שאלות בנושא זה. אשמח להעביר אותך לנציג.'
    }
  }],

  // Conversation rules & limits
  rules: {
    // Max messages in a conversation
    maxConversationLength: {
      type: Number,
      default: 20,
      min: 5,
      max: 100
    },

    // Session timeout in minutes
    sessionTimeoutMinutes: {
      type: Number,
      default: 1440, // 24 hours
      min: 5,
      max: 10080  // 7 days
    },

    // Keywords that trigger handoff to human
    handoffToHumanKeywords: {
      type: [String],
      default: ['דבר עם אדם', 'רוצה לדבר עם אדם אמיתי', 'העבר אותי לאנושי', 'talk to human', 'speak to person']
    },

    // Keywords that stop the bot
    autoStopKeywords: {
      type: [String],
      default: ['עצור', 'תפסיק', 'stop', 'סגור', 'לא מעוניין']
    },

    // Auto-handoff after X failed attempts
    autoHandoffAfterFailures: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },

    // Collect feedback at end of conversation
    collectFeedback: {
      type: Boolean,
      default: true
    },

    // Allow bot to make autonomous decisions
    allowAutonomousActions: {
      type: Boolean,
      default: false
    }
  },

  // Statistics
  stats: {
    conversationsStarted: {
      type: Number,
      default: 0
    },

    conversationsCompleted: {
      type: Number,
      default: 0
    },

    conversationsAbandoned: {
      type: Number,
      default: 0
    },

    conversationsHandedOff: {
      type: Number,
      default: 0
    },

    avgSatisfaction: {
      type: Number,
      default: null,
      min: 1,
      max: 5
    },

    totalMessages: {
      type: Number,
      default: 0
    },

    totalIntentsDetected: {
      type: Number,
      default: 0
    },

    totalActionsTriggered: {
      type: Number,
      default: 0
    }
  },

  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Last updated by
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
aiBotConfigSchema.index({ isActive: 1 });
aiBotConfigSchema.index({ name: 1 });
aiBotConfigSchema.index({ 'triggers.event': 1 });

// Instance methods

/**
 * Get active functions for OpenAI
 */
aiBotConfigSchema.methods.getActiveFunctions = function () {
  return this.functions
    .filter(f => f.enabled)
    .map(f => ({
      name: f.name,
      description: f.description,
      parameters: f.parameters
    }));
};

/**
 * Update statistics
 */
aiBotConfigSchema.methods.updateStats = function (updates) {
  Object.keys(updates).forEach(key => {
    if (this.stats.hasOwnProperty(key)) {
      if (typeof this.stats[key] === 'number' && typeof updates[key] === 'number') {
        this.stats[key] += updates[key];
      } else {
        this.stats[key] = updates[key];
      }
    }
  });
};

/**
 * Check if bot should trigger for given event and conditions
 */
aiBotConfigSchema.methods.shouldTrigger = function (event, context = {}) {
  if (!this.isActive) return false;

  const matchingTrigger = this.triggers.find(t =>
    t.enabled && t.event === event
  );

  if (!matchingTrigger) return false;

  // Check conditions
  const conditions = matchingTrigger.conditions || {};

  // Keyword check
  if (conditions.keywords && conditions.keywords.length > 0 && context.message) {
    const messageText = context.message.toLowerCase();
    const hasKeyword = conditions.keywords.some(keyword =>
      messageText.includes(keyword.toLowerCase())
    );
    if (!hasKeyword) return false;
  }

  // Lead source check
  if (conditions.leadSources && conditions.leadSources.length > 0 && context.leadSource) {
    if (!conditions.leadSources.includes(context.leadSource)) return false;
  }

  // Status check
  if (conditions.statuses && conditions.statuses.length > 0 && context.status) {
    if (!conditions.statuses.includes(context.status)) return false;
  }

  // Time window check
  if (conditions.timeWindow && conditions.timeWindow.start && conditions.timeWindow.end) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (currentTime < conditions.timeWindow.start || currentTime > conditions.timeWindow.end) {
      return false;
    }
  }

  return true;
};

/**
 * Get function mapping by function name
 */
aiBotConfigSchema.methods.getFunctionMapping = function (functionName) {
  const func = this.functions.find(f => f.name === functionName && f.enabled);
  return func ? func.actionMapping : null;
};

/**
 * Check if handoff keyword detected
 */
aiBotConfigSchema.methods.isHandoffKeyword = function (message) {
  const messageText = message.toLowerCase().trim();
  return this.rules.handoffToHumanKeywords.some(keyword =>
    messageText.includes(keyword.toLowerCase())
  );
};

/**
 * Check if stop keyword detected
 */
aiBotConfigSchema.methods.isStopKeyword = function (message) {
  const messageText = message.toLowerCase().trim();
  return this.rules.autoStopKeywords.some(keyword =>
    messageText.includes(keyword.toLowerCase())
  );
};

// Static methods

/**
 * Get active bot configs
 */
aiBotConfigSchema.statics.getActiveBots = async function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Get bot config for specific event
 */
aiBotConfigSchema.statics.getBotForEvent = async function (event, context = {}) {
  const bots = await this.find({ isActive: true });

  for (const bot of bots) {
    if (bot.shouldTrigger(event, context)) {
      return bot;
    }
  }

  return null;
};

/**
 * Get default bot config
 */
aiBotConfigSchema.statics.getDefaultBot = async function () {
  return this.findOne({ name: 'Default Bot', isActive: true });
};

/**
 * Create default bot if doesn't exist
 */
aiBotConfigSchema.statics.ensureDefaultBot = async function () {
  const existingBot = await this.findOne({ name: 'Default Bot' });

  if (!existingBot) {
    return this.create({
      name: 'Default Bot',
      description: 'Default AI assistant for general conversations',
      isActive: true,
      systemPrompt: `אתה עוזר AI חכם של BizFlow CRM.
אתה עוזר לבעלי עסקים לנהל לידים ולקוחות.
היה מקצועי, ידידותי ותמציתי. השתמש בעברית (RTL).
אם אינך בטוח במשהו, אמור זאת בכנות והציע להעביר לנציג אנושי.`,
      functions: [
        {
          name: 'schedule_followup',
          description: 'Schedule a follow-up task or meeting with the lead',
          parameters: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'The date for the follow-up in YYYY-MM-DD format'
              },
              time: {
                type: 'string',
                description: 'The time for the follow-up in HH:MM format'
              },
              type: {
                type: 'string',
                enum: ['call', 'meeting', 'whatsapp', 'email'],
                description: 'Type of follow-up'
              },
              notes: {
                type: 'string',
                description: 'Additional notes for the follow-up'
              }
            },
            required: ['date', 'type']
          },
          actionMapping: {
            type: 'create_task',
            config: {
              priority: 'medium'
            }
          },
          enabled: true
        },
        {
          name: 'update_lead_status',
          description: 'Update the lead status based on conversation progress',
          parameters: {
            type: 'object',
            properties: {
              newStatus: {
                type: 'string',
                enum: ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'won', 'lost'],
                description: 'New status for the lead'
              },
              reason: {
                type: 'string',
                description: 'Reason for status change'
              }
            },
            required: ['newStatus']
          },
          actionMapping: {
            type: 'update_lead_status',
            config: {}
          },
          enabled: true
        },
        {
          name: 'handoff_to_human',
          description: 'Hand off the conversation to a human agent',
          parameters: {
            type: 'object',
            properties: {
              reason: {
                type: 'string',
                description: 'Reason for handoff'
              },
              urgency: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Urgency level'
              }
            },
            required: ['reason']
          },
          actionMapping: {
            type: 'handoff_to_human',
            config: {}
          },
          enabled: true
        }
      ],
      triggers: [
        {
          event: 'new_message',
          conditions: {},
          enabled: true
        },
        {
          event: 'new_lead',
          conditions: {
            leadSources: ['whatsapp', 'website_form', 'landing_page_campaign']
          },
          enabled: true
        }
      ]
    });
  }

  return existingBot;
};

const AIBotConfig = mongoose.model('AIBotConfig', aiBotConfigSchema);

module.exports = AIBotConfig;
