const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  type: {
    type: String,
    enum: [
      'holiday',           // חג
      'seasonal',          // עונתי
      'product_launch',    // השקת מוצר
      'retention',         // שימור לקוחות
      'acquisition',       // רכישת לקוחות חדשים
      'event',            // אירוע
      'content',          // תוכן
      'networking'        // נטוורקינג
    ],
    required: true
  },
  
  status: {
    type: String,
    enum: ['planning', 'preparing', 'active', 'paused', 'completed', 'cancelled'],
    default: 'planning'
  },
  
  // תאריכים
  targetDate: {
    type: Date,
    required: true,
    index: true
  },
  
  preparationDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  
  startDate: Date,
  endDate: Date,
  
  // ערוצים
  channels: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'facebook', 'instagram', 'google_ads', 'linkedin', 'website']
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft'
    },
    budget: {
      type: Number,
      default: 0
    },
    content: String,
    scheduledDate: Date,
    sentDate: Date,
    metrics: {
      sent: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      converted: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }
    }
  }],
  
  // קהל יעד
  targetAudience: {
    segmentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerSegment'
    }],
    totalSize: {
      type: Number,
      default: 0
    },
    filters: mongoose.Schema.Types.Mixed
  },
  
  // תקציב
  budget: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'ILS'
    }
  },
  
  // יעדים
  goals: [{
    metric: {
      type: String,
      enum: ['leads', 'sales', 'engagement', 'awareness', 'traffic', 'conversions']
    },
    target: Number,
    actual: {
      type: Number,
      default: 0
    },
    unit: String
  }],
  
  // אוטומציה
  automation: {
    enabled: {
      type: Boolean,
      default: false
    },
    triggers: [mongoose.Schema.Types.Mixed],
    actions: [mongoose.Schema.Types.Mixed]
  },
  
  // משימות קשורות
  tasks: [{
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    status: String,
    dueDate: Date
  }],
  
  // תוכן
  content: {
    headline: String,
    body: String,
    images: [String],
    cta: String,
    landingPage: String
  },
  
  // ניתוח
  analytics: {
    roi: {
      type: Number,
      default: 0
    },
    costPerLead: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    insights: [String],
    recommendations: [String],
    lastCalculated: Date
  },
  
  // מטא-דאטה
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  notes: String,
  tags: [String]
  
}, {
  timestamps: true
});

// Indexes לביצועים
marketingCampaignSchema.index({ status: 1, targetDate: 1 });
marketingCampaignSchema.index({ createdBy: 1, status: 1 });
marketingCampaignSchema.index({ type: 1, status: 1 });

// Virtual לחישוב ימי הכנה נותרים
marketingCampaignSchema.virtual('daysUntilPreparation').get(function() {
  if (!this.targetDate || !this.preparationDays) return null;
  const preparationStartDate = new Date(this.targetDate);
  preparationStartDate.setDate(preparationStartDate.getDate() - this.preparationDays);
  const today = new Date();
  const diffTime = preparationStartDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual לחישוב ימים עד הקמפיין
marketingCampaignSchema.virtual('daysUntilTarget').get(function() {
  if (!this.targetDate) return null;
  const today = new Date();
  const diffTime = this.targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method לחישוב ROI
marketingCampaignSchema.methods.calculateROI = function() {
  if (!this.budget.spent || this.budget.spent === 0) {
    this.analytics.roi = 0;
    return 0;
  }
  
  // חישוב הכנסה מהמרות (נניח ערך ממוצע למרה)
  const avgConversionValue = 100; // ניתן להתאים
  const totalRevenue = this.channels.reduce((sum, channel) => {
    return sum + (channel.metrics.converted * avgConversionValue);
  }, 0);
  
  const roi = ((totalRevenue - this.budget.spent) / this.budget.spent) * 100;
  this.analytics.roi = Math.round(roi * 100) / 100;
  this.analytics.lastCalculated = new Date();
  
  return this.analytics.roi;
};

// Method לחישוב Cost Per Lead
marketingCampaignSchema.methods.calculateCostPerLead = function() {
  const totalLeads = this.channels.reduce((sum, channel) => {
    return sum + (channel.metrics.clicked || 0);
  }, 0);
  
  if (totalLeads === 0) {
    this.analytics.costPerLead = 0;
    return 0;
  }
  
  this.analytics.costPerLead = Math.round((this.budget.spent / totalLeads) * 100) / 100;
  return this.analytics.costPerLead;
};

// Method לחישוב Conversion Rate
marketingCampaignSchema.methods.calculateConversionRate = function() {
  const totalSent = this.channels.reduce((sum, channel) => {
    return sum + (channel.metrics.sent || 0);
  }, 0);
  
  const totalConverted = this.channels.reduce((sum, channel) => {
    return sum + (channel.metrics.converted || 0);
  }, 0);
  
  if (totalSent === 0) {
    this.analytics.conversionRate = 0;
    return 0;
  }
  
  this.analytics.conversionRate = Math.round((totalConverted / totalSent) * 10000) / 100;
  return this.analytics.conversionRate;
};

// Middleware - חישוב אוטומטי לפני שמירה
marketingCampaignSchema.pre('save', function(next) {
  if (this.isModified('channels') || this.isModified('budget')) {
    this.calculateROI();
    this.calculateCostPerLead();
    this.calculateConversionRate();
  }
  next();
});

const MarketingCampaign = mongoose.model('MarketingCampaign', marketingCampaignSchema);

module.exports = MarketingCampaign;



