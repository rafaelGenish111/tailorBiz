const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // פרטים אישיים (נלקחים משאלון האפיון)
  personalInfo: {
    fullName: {
      type: String,
      required: [true, 'שם מלא הוא שדה חובה'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'מספר טלפון הוא שדה חובה'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'כתובת אימייל לא תקינה']
    },
    whatsappPhone: {
      type: String,
      trim: true
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'whatsapp', 'email'],
      default: 'whatsapp'
    }
  },

  // פרטי העסק (נלקחים משאלון האפיון)
  businessInfo: {
    businessName: {
      type: String,
      required: [true, 'שם העסק הוא שדה חובה'],
      trim: true
    },
    businessType: {
      type: String,
      trim: true
    },
    numberOfEmployees: {
      type: Number,
      min: 0
    },
    industry: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    // שדות מידע עסקי מורחבים
    description: {
      type: String,
      trim: true
    },
    yearsInBusiness: {
      type: Number,
      min: 0
    },
    revenueRange: {
      type: String,
      trim: true
    }
  },

  // סטטוס הליד/לקוח
  status: {
    type: String,
    enum: [
      'new_lead',          // New Lead
      'contacted',         // Contacted
      'engaged',           // Engaged
      'meeting_set',       // Meeting Booked
      'proposal_sent',     // Proposal Sent
      'won',               // Won
      'lost'               // Lost
    ],
    default: 'new_lead'
  },

  // סיבת הפסד (אם הסטטוס lost)
  lostReason: {
    type: String,
    enum: ['מחיר גבוה מדי', 'בחר ספק אחר', 'לא מעוניין יותר', 'תזמון לא מתאים', 'אחר']
  },
  lostReasonNotes: String,

  // מקור הליד
  leadSource: {
    type: String,
    enum: ['whatsapp', 'website_form', 'referral', 'cold_call', 'social_media', 'linkedin', 'facebook', 'google_ads', 'landing_page_campaign', 'other'],
    required: true
  },

  // מפנה (יועץ/רו"ח וכו') - אינו הלקוח עצמו אלא מי שמפנה לידים
  referrer: {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferrerPartner',
    },
    referrerNameSnapshot: {
      type: String,
      trim: true,
    },
  },

  // ציון איכות ליד (Lead Scoring) - מחושב אוטומטית
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // תגיות לסינון וקיבוץ
  tags: [{
    type: String,
    trim: true
  }],

  // מעקב אינטראקציות
  interactions: [{
    type: {
      type: String,
      enum: ['call', 'email', 'whatsapp', 'meeting', 'note', 'task', 'sms'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      default: 'outbound'
    },
    subject: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{
      filename: String,
      url: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    nextFollowUp: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],

  // שיחות WhatsApp (אינטגרציה)
  whatsappConversations: [{
    conversationId: String,
    lastMessageDate: Date,
    lastMessagePreview: String,
    lastMessageFrom: {
      type: String,
      enum: ['client', 'us']
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    archived: {
      type: Boolean,
      default: false
    }
  }],

  // NEW: AI Bot Conversation History
  conversationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConversationContext'
  }],

  // NEW: AI Bot Preferences for this client
  aiPreferences: {
    // Whether bot is enabled for this client
    botEnabled: {
      type: Boolean,
      default: true
    },
    // Preferred language for bot communication
    preferredLanguage: {
      type: String,
      default: 'he',
      enum: ['he', 'en', 'ar']
    },
    // Communication style preference
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'professional'],
      default: 'professional'
    },
    // Custom bot config for this specific client (if needed)
    customBotConfigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIBotConfig'
    },
    // Web chat session ID for website chat widget
    webChatSessionId: {
      type: String,
      sparse: true // Allow multiple nulls but unique non-null values
    }
  },

  // משימות ותזכורות
  tasks: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    taskType: {
      type: String,
      enum: ['call', 'meeting', 'email', 'follow_up', 'demo', 'proposal', 'other'],
      default: 'other'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // הערות כלליות
  generalNotes: String,

  // קבצים מצורפים כלליים
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String
  }],

  // מטאדאטה
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastContactedAt: Date,
    lastInteractionType: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // סטטיסטיקות
    stats: {
      totalInteractions: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalPaid: { type: Number, default: 0 },
      outstandingBalance: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// אינדקסים לחיפוש מהיר
// הערה: personalInfo.phone כבר יש לו unique: true שיוצר אינדקס אוטומטית
ClientSchema.index({ 'personalInfo.email': 1 });
ClientSchema.index({ 'personalInfo.whatsappPhone': 1 });
ClientSchema.index({ 'businessInfo.businessName': 'text', 'personalInfo.fullName': 'text' });
ClientSchema.index({ status: 1 });
ClientSchema.index({ leadSource: 1 });
ClientSchema.index({ tags: 1 });
ClientSchema.index({ 'referrer.referrerId': 1 });
ClientSchema.index({ leadScore: -1 });
ClientSchema.index({ 'metadata.createdAt': -1 });
ClientSchema.index({ 'metadata.lastContactedAt': -1 });

// Virtual לשם מלא של הלקוח
ClientSchema.virtual('fullDisplayName').get(function () {
  return `${this.personalInfo.fullName} - ${this.businessInfo.businessName}`;
});

// Virtual לקישור לפרויקטים (Project-centric architecture)
ClientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'clientId'
});

// Helper methods לבדיקת סוג הלקוח
ClientSchema.methods.isLead = function () {
  const leadStatuses = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'];
  return leadStatuses.includes(this.status);
};

ClientSchema.methods.isActiveClient = function () {
  const clientStatuses = ['won'];
  return clientStatuses.includes(this.status);
};

// פונקציה לחישוב Lead Score אוטומטית
ClientSchema.methods.calculateLeadScore = function () {
  let score = 0;

  // מקור הליד
  const sourceScores = {
    'referral': 25,
    'website_form': 20,
    'landing_page_campaign': 22,
    'linkedin': 18,
    'whatsapp': 15,
    'facebook': 12,
    'google_ads': 12,
    'social_media': 10,
    'cold_call': 5,
    'other': 5
  };
  score += sourceScores[this.leadSource] || 0;

  // רמת מעורבות (אינטראקציות)
  const interactionScore = Math.min(this.interactions.length * 2, 20);
  score += interactionScore;

  // יש אימייל
  if (this.personalInfo.email) {
    score += 5;
  }

  // מידע עסקי מלא
  if (this.businessInfo.website) {
    score += 3;
  }

  // סטטוס מתקדם
  const statusScores = {
    'new_lead': 0,
    'contacted': 10,
    'engaged': 20,
    'meeting_set': 30,
    'proposal_sent': 40,
    'won': 50
  };
  score += statusScores[this.status] || 0;

  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// עדכון סטטיסטיקות
ClientSchema.methods.updateStats = function () {
  this.metadata.stats.totalInteractions = this.interactions.length;
};

// פונקציה לקבלת הפעולה הבאה המומלצת
ClientSchema.methods.getNextAction = function () {
  // אם יש משימה פעילה עם תאריך יעד קרוב
  const upcomingTasks = this.tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (upcomingTasks.length > 0 && upcomingTasks[0].dueDate) {
    return {
      action: upcomingTasks[0].title,
      dueDate: upcomingTasks[0].dueDate,
      priority: upcomingTasks[0].priority
    };
  }

  // המלצות לפי סטטוס
  const recommendations = {
    'new_lead': { action: 'צור קשר ראשוני', priority: 'high' },
    'contacted': { action: 'העמק שיחה ואפיין צורך', priority: 'high' },
    'engaged': { action: 'קבע פגישה', priority: 'high' },
    'meeting_set': { action: 'הכן לפגישה / בצע פגישה', priority: 'medium' },
    'proposal_sent': { action: 'עקוב אחרי ההצעה', priority: 'high' }
  };

  return recommendations[this.status] || { action: 'עדכן סטטוס', priority: 'low' };
};

// Middleware - עדכון אוטומטי לפני שמירה
ClientSchema.pre('save', function (next) {
  // עדכון תאריך עדכון
  this.metadata.updatedAt = new Date();

  // חישוב Lead Score
  this.calculateLeadScore();

  // עדכון סטטיסטיקות
  this.updateStats();

  // עדכון תאריך קשר אחרון
  if (this.interactions.length > 0) {
    const sortedInteractions = [...this.interactions].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    this.metadata.lastContactedAt = sortedInteractions[0].timestamp;
    this.metadata.lastInteractionType = sortedInteractions[0].type;
  }

  next();
});

// פונקציה סטטית לחיפוש לקוחות
ClientSchema.statics.searchClients = function (searchTerm) {
  return this.find({
    $or: [
      { 'personalInfo.fullName': { $regex: searchTerm, $options: 'i' } },
      { 'businessInfo.businessName': { $regex: searchTerm, $options: 'i' } },
      { 'personalInfo.phone': { $regex: searchTerm, $options: 'i' } },
      { 'personalInfo.email': { $regex: searchTerm, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('Client', ClientSchema);

