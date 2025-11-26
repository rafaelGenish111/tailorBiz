const mongoose = require('mongoose');

const marketingAutomationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: String,
  
  type: {
    type: String,
    enum: [
      'campaign_trigger',      // הפעלת קמפיין
      'lead_nurturing',        // טיפוח לידים
      'customer_reengagement', // החזרת לקוחות
      'task_creation',         // יצירת משימות
      'notification',          // התראות
      'calendar_event'         // אירוע ביומן
    ],
    required: true
  },
  
  // תנאי הפעלה
  trigger: {
    type: {
      type: String,
      enum: [
        'date_reached',        // הגיע תאריך
        'days_before_date',    // X ימים לפני תאריך
        'customer_action',     // פעולת לקוח
        'campaign_status',     // שינוי סטטוס קמפיין
        'lead_stage_change',   // שינוי שלב בליד
        'budget_threshold',    // סף תקציב
        'manual'              // ידני
      ]
    },
    conditions: mongoose.Schema.Types.Mixed,
    schedule: {
      frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly', 'custom']
      },
      time: String,
      daysOfWeek: [Number],
      dayOfMonth: Number
    }
  },
  
  // פעולות
  actions: [{
    type: {
      type: String,
      enum: [
        'send_email',
        'send_sms',
        'send_whatsapp',
        'create_task',
        'create_calendar_event',
        'send_notification',
        'update_crm',
        'tag_customer',
        'move_lead_stage',
        'start_campaign',
        'webhook'
      ]
    },
    config: mongoose.Schema.Types.Mixed,
    delay: {
      type: Number,
      default: 0,
      description: 'Delay in minutes before executing this action'
    },
    order: {
      type: Number,
      required: true
    }
  }],
  
  // קמפיין קשור
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketingCampaign'
  },
  
  // סטטוס
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastRun: Date,
  nextRun: Date,
  
  // סטטיסטיקות
  stats: {
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulRuns: {
      type: Number,
      default: 0
    },
    failedRuns: {
      type: Number,
      default: 0
    },
    lastError: String,
    lastSuccess: Date
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  logs: [{
    executedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial']
    },
    message: String,
    details: mongoose.Schema.Types.Mixed
  }]
  
}, {
  timestamps: true
});

// Indexes
marketingAutomationSchema.index({ isActive: 1, nextRun: 1 });
marketingAutomationSchema.index({ type: 1, isActive: 1 });
marketingAutomationSchema.index({ campaignId: 1 });

// Method לחישוב הרצה הבאה
marketingAutomationSchema.methods.calculateNextRun = function() {
  if (!this.trigger.schedule || !this.isActive) {
    this.nextRun = null;
    return null;
  }
  
  const now = new Date();
  let nextRun = new Date(now);
  
  switch (this.trigger.schedule.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case 'once':
      this.nextRun = null;
      return null;
    default:
      this.nextRun = null;
      return null;
  }
  
  this.nextRun = nextRun;
  return nextRun;
};

// Method להוספת לוג
marketingAutomationSchema.methods.addLog = async function(status, message, details = {}) {
  this.logs.push({
    executedAt: new Date(),
    status,
    message,
    details
  });
  
  // שמור רק 100 לוגים אחרונים
  if (this.logs.length > 100) {
    this.logs = this.logs.slice(-100);
  }
  
  // עדכן סטטיסטיקות
  this.stats.totalRuns++;
  if (status === 'success') {
    this.stats.successfulRuns++;
    this.stats.lastSuccess = new Date();
  } else if (status === 'failed') {
    this.stats.failedRuns++;
    this.stats.lastError = message;
  }
  
  this.lastRun = new Date();
  this.calculateNextRun();
  
  await this.save();
};

const MarketingAutomation = mongoose.model('MarketingAutomation', marketingAutomationSchema);

module.exports = MarketingAutomation;

