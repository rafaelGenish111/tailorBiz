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

  // שאלון אפיון מלא
  assessmentForm: {
    filledAt: Date,

    // שאלה 1-2: היכרות בסיסית
    basicInfo: {
      businessDescription: String,
      numberOfEmployees: Number
    },

    // שאלה 3: המצב הקיים
    currentSystems: {
      managementMethod: String, // איך מנהלים היום
      existingSystem: String, // מערכת קיימת
      whatWorksWell: String,
      whatDoesntWork: String
    },

    // שאלה 4: נקודות כאב
    painPoints: {
      timeWasters: [String], // איפה נוצר בזבוז זמן
      customerLoss: String, // מצבים של איבוד לקוחות
      processesToAutomate: [String] // תהליכים לאוטומציה
    },

    // שאלה 5: תהליכים לשיפור
    processesToImprove: {
      queueManagement: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      customerTracking: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      billingPayments: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      inventory: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      communication: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      production: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      fieldTeams: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      documents: {
        needed: Boolean,
        priority: { type: Number, min: 1, max: 5 },
        notes: String
      },
      mostUrgent: String // מה הכי דחוף לפתור
    },

    // שאלה 6: מטרות ויעדים
    goalsAndObjectives: {
      desiredOutcomes: [String], // מה היית רוצה שיקרה
      successCriteria: [String], // מה ייחשב הצלחה
      expectedTimeSaving: String
    },

    // שאלה 7: דרישות מיוחדות
    specialRequirements: {
      externalIntegrations: [String], // כלים חיצוניים להתחבר
      uniqueProcesses: [String] // תהליכים ייחודיים
    },

    // שאלה 8: תקציב וזמנים
    budgetAndTimeline: {
      budgetRange: {
        type: String,
        enum: ['עד 10,000', '10,000-20,000', '20,000-40,000', '40,000-60,000', '60,000+', 'לא בטוח']
      },
      desiredImplementationDate: Date,
      urgencyLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      }
    },

    // שאלה 9: סיכום והמשך
    nextSteps: {
      proposalPresentation: Boolean, // נקבע פגישת הצגה?
      preferredMeetingDate: Date,
      additionalNotes: String
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
    enum: ['whatsapp', 'website_form', 'referral', 'cold_call', 'social_media', 'linkedin', 'facebook', 'google_ads', 'other'],
    required: true
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

  // הזמנות/פרויקטים
  orders: [{
    orderNumber: {
      type: String
      // הוסר unique כדי למנוע שגיאת duplicate key עם null values
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    description: String,
    services: [{
      serviceName: String,
      description: String,
      price: Number,
      estimatedHours: Number
    }],
    totalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'in_progress', 'testing', 'completed', 'cancelled', 'on_hold'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    startDate: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    milestones: [{
      title: String,
      description: String,
      dueDate: Date,
      completed: Boolean,
      completedDate: Date,
      percentComplete: { type: Number, min: 0, max: 100, default: 0 }
    }],
    notes: String,
    attachments: [{
      filename: String,
      url: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }],

  // לוח תשלומים
  paymentPlan: {
    totalAmount: Number,
    currency: {
      type: String,
      default: 'ILS'
    },
    paymentStructure: {
      type: String,
      enum: ['one_time', 'installments', 'milestone_based', 'monthly_subscription'],
      default: 'installments'
    },
    installments: [{
      installmentNumber: Number,
      description: String,
      amount: Number,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled', 'partial'],
        default: 'pending'
      },
      paidAmount: { type: Number, default: 0 },
      paidDate: Date,
      paymentMethod: {
        type: String,
        enum: ['העברה בנקאית', 'אשראי', 'מזומן', 'צ\'ק', 'PayPal', 'bit', 'אחר']
      },
      transactionId: String,
      invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
      },
      notes: String,
      reminderSent: { type: Boolean, default: false },
      lastReminderDate: Date
    }]
  },

  // הצעת מחיר ופרטי סגירה
  proposal: {
    initialPrice: Number, // סכום הצעת המחיר הראשונית
    finalPrice: Number,   // הסכום שנסגר בפועל
    currency: {
      type: String,
      default: 'ILS'
    },
    paymentTerms: String,   // תנאי תשלום
    contractNotes: String,  // הערות על החוזה / תנאים נוספים
    signedAt: Date          // תאריך חתימת ההסכם (אם יש)
  },

  // חוזה
  contract: {
    signed: { type: Boolean, default: false },
    signedAt: Date,
    fileUrl: String, // URL לקובץ החוזה
    notes: String
  },

  // חשבוניות
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
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
ClientSchema.index({ leadScore: -1 });
ClientSchema.index({ 'metadata.createdAt': -1 });
ClientSchema.index({ 'metadata.lastContactedAt': -1 });

// Virtual לשם מלא של הלקוח
ClientSchema.virtual('fullDisplayName').get(function () {
  return `${this.personalInfo.fullName} - ${this.businessInfo.businessName}`;
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
    'linkedin': 18,
    'whatsapp': 15,
    'facebook': 12,
    'google_ads': 12,
    'social_media': 10,
    'cold_call': 5,
    'other': 5
  };
  score += sourceScores[this.leadSource] || 0;

  // רמת תקציב
  if (this.assessmentForm?.budgetAndTimeline?.budgetRange) {
    const budgetScores = {
      '60,000+': 25,
      '40,000-60,000': 20,
      '20,000-40,000': 15,
      '10,000-20,000': 10,
      'עד 10,000': 5,
      'לא בטוח': 3
    };
    score += budgetScores[this.assessmentForm.budgetAndTimeline.budgetRange] || 0;
  }

  // דחיפות
  const urgencyScores = {
    'urgent': 20,
    'high': 15,
    'medium': 10,
    'low': 5
  };
  score += urgencyScores[this.assessmentForm?.budgetAndTimeline?.urgencyLevel] || 0;

  // מספר תהליכים לשיפור
  if (this.assessmentForm?.processesToImprove) {
    const processes = this.assessmentForm.processesToImprove;
    const processCount = Object.values(processes)
      .filter(p => typeof p === 'object' && p.needed === true).length;
    score += Math.min(processCount * 4, 20);
  }

  // שאלון אפיון מולא
  if (this.assessmentForm?.filledAt) {
    score += 10;
  }

  // רמת מעורבות (אינטראקציות)
  const interactionScore = Math.min(this.interactions.length * 2, 15);
  score += interactionScore;

  // יש אימייל
  if (this.personalInfo.email) {
    score += 5;
  }

  // מידע עסקי מלא
  if (this.businessInfo.website) {
    score += 3;
  }

  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// עדכון סטטיסטיקות
ClientSchema.methods.updateStats = function () {
  this.metadata.stats.totalInteractions = this.interactions.length;
  this.metadata.stats.totalOrders = this.orders.length;

  // חישוב הכנסות
  const totalRevenue = this.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  this.metadata.stats.totalRevenue = totalRevenue;

  // חישוב תשלומים
  const totalPaid = this.paymentPlan?.installments
    ?.filter(i => i.status === 'paid')
    .reduce((sum, inst) => sum + (inst.paidAmount || inst.amount || 0), 0) || 0;
  this.metadata.stats.totalPaid = totalPaid;

  this.metadata.stats.outstandingBalance = totalRevenue - totalPaid;
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

