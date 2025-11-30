// backend/src/models/TaskManager.js
const mongoose = require('mongoose');

/**
 * Task Manager - משימות מרכזיות (לא קשורות ללקוח ספציפי)
 */
const TaskManagerSchema = new mongoose.Schema({
  // פרטי המשימה
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  // סוג המשימה
  type: {
    type: String,
    enum: [
      'call',           // שיחה
      'meeting',        // פגישה
      'email',          // שליחת אימייל
      'follow_up',      // מעקב
      'proposal',       // הכנת הצעה
      'demo',           // הדגמה
      'reminder',       // תזכורת כללית
      'admin',          // משימה אדמיניסטרטיבית
      'personal',       // אישי
      'other'           // אחר
    ],
    default: 'other'
  },

  // עדיפות
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // סטטוס
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'waiting', 'completed', 'cancelled'],
    default: 'todo'
  },

  // תאריכים
  dueDate: Date,
  startDate: Date,
  endDate: Date,
  completedAt: Date,

  // זמן משוער/בפועל (בדקות)
  estimatedMinutes: Number,
  actualMinutes: Number,

  // קישור ללקוח (אופציונלי)
  relatedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },

  // קישור לפרויקט (אופציונלי)
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

  // הקצאה
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId
    // ref: 'User' - מודל User לא קיים במערכת
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId
    // ref: 'User' - מודל User לא קיים במערכת
  },

  // תגיות
  tags: [String],

  // תזכורות
  reminders: [{
    time: Date,
    method: {
      type: String,
      enum: ['notification', 'email', 'sms'],
      default: 'notification'
    },
    sent: { type: Boolean, default: false }
  }],

  // הערות ועדכונים
  notes: String,
  
  updates: [{
    content: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId }
    // ref: 'User' - מודל User לא קיים במערכת
  }],

  // קבצים מצורפים
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // חזרתיות (לאירועים חוזרים)
  isRecurring: { type: Boolean, default: false },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number, // כל כמה (לדוגמה: כל 2 שבועות)
    endDate: Date,
    daysOfWeek: [Number] // 0-6 (ראשון-שבת)
  },

  // צבע (לקיבוץ ויזואלי)
  color: {
    type: String,
    default: '#1976d2'
  },

  // מיקום (אם רלוונטי)
  location: String,

  // מטאדאטה
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 },
    lastViewedAt: Date
  }
}, {
  timestamps: true
});

// אינדקסים
TaskManagerSchema.index({ assignedTo: 1, status: 1 });
TaskManagerSchema.index({ dueDate: 1 });
TaskManagerSchema.index({ priority: 1, status: 1 });
TaskManagerSchema.index({ createdBy: 1 });
TaskManagerSchema.index({ tags: 1 });

// Virtual - האם המשימה באיחור
TaskManagerSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && 
         this.status !== 'cancelled' &&
         this.dueDate && 
         new Date() > new Date(this.dueDate);
});

// Virtual - זמן שנותר
TaskManagerSchema.virtual('timeUntilDue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return null;
  }
  
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = due - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} ימים`;
  if (hours > 0) return `${hours} שעות`;
  return 'בקרוב';
});

// Middleware
TaskManagerSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  
  // אם הושלם, רשום מתי
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('TaskManager', TaskManagerSchema);




