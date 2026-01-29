const mongoose = require('mongoose');

/**
 * ConversationContext Model
 * Manages conversation state for AI bot interactions across channels (WhatsApp, chat, email)
 * Includes TTL index for automatic cleanup after 24 hours of inactivity
 */
const conversationContextSchema = new mongoose.Schema({
  // Client reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  // Communication channel
  channel: {
    type: String,
    enum: ['whatsapp', 'chat', 'email'],
    required: true,
    default: 'whatsapp'
  },

  // Unique session identifier
  sessionId: {
    type: String,
    required: true,
    unique: true
  },

  // Conversation status
  status: {
    type: String,
    enum: ['active', 'waiting', 'completed', 'abandoned', 'handoff'],
    default: 'active'
  },

  // Message history
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // OpenAI function call data (if any)
    functionCall: {
      name: String,
      arguments: Object
    },
    // Additional metadata
    metadata: {
      type: Object,
      default: {}
    }
  }],

  // Conversation context state
  context: {
    // Detected intent
    intent: {
      type: String,
      default: null
    },
    // Extracted entities from conversation
    entities: {
      type: Object,
      default: {}
    },
    // Confidence score (0-1)
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    // Current step in conversation flow
    currentStep: {
      type: Number,
      default: 0
    },
    // Actions pending execution
    pendingActions: {
      type: [Object],
      default: []
    },
    // User-provided variables (e.g., {name}, {business})
    variables: {
      type: Object,
      default: {}
    }
  },

  // Related automations triggered during conversation
  relatedAutomations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadNurturing'
  }],

  // Actions triggered during this conversation
  triggeredActions: [{
    automationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadNurturing'
    },
    actionType: String,
    executedAt: {
      type: Date,
      default: Date.now
    },
    success: {
      type: Boolean,
      default: false
    },
    result: Object
  }],

  // Activity tracking
  lastActivityAt: {
    type: Date,
    default: Date.now
  },

  // Expiration for TTL (Time To Live) - auto-delete after 24h
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },

  // Conversation metrics
  metrics: {
    messageCount: {
      type: Number,
      default: 0
    },
    userMessageCount: {
      type: Number,
      default: 0
    },
    avgResponseTime: {
      type: Number,
      default: 0
    },
    satisfactionScore: {
      type: Number,
      default: null,
      min: 1,
      max: 5
    }
  },

  // Handoff information (if conversation was handed to human)
  handoff: {
    handedOffAt: Date,
    handedOffBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
conversationContextSchema.index({ client: 1, status: 1 });
conversationContextSchema.index({ client: 1, channel: 1 });
conversationContextSchema.index({ sessionId: 1 });
conversationContextSchema.index({ lastActivityAt: 1 });

// TTL index - automatically delete documents after expiresAt date
conversationContextSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods

/**
 * Add a message to the conversation
 */
conversationContextSchema.methods.addMessage = function(role, content, functionCall = null, metadata = {}) {
  this.messages.push({
    role,
    content,
    functionCall,
    metadata,
    timestamp: new Date()
  });

  // Update metrics
  this.metrics.messageCount = this.messages.length;
  if (role === 'user') {
    this.metrics.userMessageCount += 1;
  }

  this.lastActivityAt = new Date();
};

/**
 * Update conversation context
 */
conversationContextSchema.methods.updateContext = function(updates) {
  this.context = {
    ...this.context,
    ...updates
  };
  this.lastActivityAt = new Date();
};

/**
 * Mark conversation as completed
 */
conversationContextSchema.methods.complete = function(reason = null) {
  this.status = 'completed';
  this.lastActivityAt = new Date();
  if (reason) {
    this.context.completionReason = reason;
  }
};

/**
 * Mark conversation as abandoned
 */
conversationContextSchema.methods.abandon = function(reason = null) {
  this.status = 'abandoned';
  this.lastActivityAt = new Date();
  if (reason) {
    this.context.abandonReason = reason;
  }
};

/**
 * Handoff conversation to human
 */
conversationContextSchema.methods.handoffToHuman = function(userId, reason, assignedTo = null) {
  this.status = 'handoff';
  this.handoff = {
    handedOffAt: new Date(),
    handedOffBy: userId,
    reason,
    assignedTo
  };
  this.lastActivityAt = new Date();
};

/**
 * Get conversation summary
 */
conversationContextSchema.methods.getSummary = function() {
  return {
    sessionId: this.sessionId,
    client: this.client,
    channel: this.channel,
    status: this.status,
    messageCount: this.metrics.messageCount,
    lastMessage: this.messages[this.messages.length - 1],
    intent: this.context.intent,
    createdAt: this.createdAt,
    lastActivityAt: this.lastActivityAt
  };
};

// Static methods

/**
 * Get or create conversation context
 */
conversationContextSchema.statics.getOrCreate = async function(clientId, channel = 'whatsapp') {
  // Check for active conversation
  let conversation = await this.findOne({
    client: clientId,
    channel,
    status: 'active'
  }).sort({ createdAt: -1 });

  if (!conversation) {
    // Create new conversation
    const sessionId = `${channel}_${clientId}_${Date.now()}`;
    conversation = await this.create({
      client: clientId,
      channel,
      sessionId,
      status: 'active'
    });
  }

  return conversation;
};

/**
 * Get active conversations for a client
 */
conversationContextSchema.statics.getActiveConversations = async function(clientId) {
  return this.find({
    client: clientId,
    status: 'active'
  }).sort({ lastActivityAt: -1 });
};

/**
 * Archive old conversations
 */
conversationContextSchema.statics.archiveOldConversations = async function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await this.updateMany(
    {
      lastActivityAt: { $lt: cutoffDate },
      status: { $in: ['active', 'waiting'] }
    },
    {
      $set: { status: 'abandoned' }
    }
  );

  return result;
};

/**
 * Get conversation statistics
 */
conversationContextSchema.statics.getStats = async function(filter = {}) {
  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        activeConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        abandonedConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
        },
        avgMessagesPerConversation: { $avg: '$metrics.messageCount' },
        avgSatisfaction: { $avg: '$metrics.satisfactionScore' }
      }
    }
  ]);

  return stats[0] || {
    totalConversations: 0,
    activeConversations: 0,
    completedConversations: 0,
    abandonedConversations: 0,
    avgMessagesPerConversation: 0,
    avgSatisfaction: 0
  };
};

const ConversationContext = mongoose.model('ConversationContext', conversationContextSchema);

module.exports = ConversationContext;
