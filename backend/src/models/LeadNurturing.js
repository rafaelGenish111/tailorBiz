// backend/src/models/LeadNurturing.js
const mongoose = require('mongoose');

/**
 * Lead Nurturing - תבניות ואוטומציות לטיפוח לידים
 */
const LeadNurturingSchema = new mongoose.Schema({
  // שם התבנית
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: String,

  // מתי להפעיל?
  trigger: {
    type: {
      type: String,
      enum: [
        'new_lead',              // ליד חדש נוצר
        'no_response',           // אין תגובה X ימים
        'status_change',         // שינוי סטטוס
        'engaged',               // ליד הפך ל-engaged
        'proposal_sent',         // הצעה נשלחה
        'interaction',           // אינטראקציה חדשה (שיחה, וואטסאפ, פגישה וכו')
        'time_based',            // טריגר זמן כללי (ימים מאז קשר אחרון וכו')
        'manual'                 // ידני
      ],
      required: true
    },
    // תנאים נוספים
    conditions: {
      // תנאי זמן כללי / לידים ללא קשר
      daysWithoutContact: Number,      // ימים ללא קשר (קיים היסטורית)
      daysSinceLastContact: Number,    // אלטרנטיבה ברורה יותר לשם

      // תנאים על הליד
      leadSource: [String],            // מקורות ליד ספציפיים
      minLeadScore: Number,            // ציון מינימלי
      statuses: [String],              // סטטוסים רלוונטיים
      statusIn: [String],              // שם נוסף/אלטרנטיבי לסטטוסים
      tags: [String],                  // תגיות

      // תנאים על אינטראקציה
      interactionTypes: [String],      // סוגי אינטראקציה רלוונטיים (call/email/whatsapp/meeting/note/task)
      directions: [String],            // inbound / outbound
      subjectContains: String,         // מחרוזת שמופיעה בנושא
      hasNextFollowUp: Boolean         // האם נדרש שתהיה אינטראקציה עם nextFollowUp
    }
  },

  // רצף פעולות
  sequence: [{
    // שלב ברצף
    step: { type: Number, required: true },

    // עיכוב מהשלב הקודם (בימים)
    delayDays: { type: Number, default: 0 },

    // סוג הפעולה
    actionType: {
      type: String,
      enum: [
        'send_whatsapp',         // שלח WhatsApp
        'create_task',           // צור משימה
        'send_email',            // שלח אימייל
        'change_status',         // שנה סטטוס (שם היסטורי)
        'update_lead_score',     // עדכון ציון ליד
        'update_client_status',  // עדכון סטטוס לקוח
        'schedule_followup',     // יצירת אינטראקציית follow-up עתידית
        'add_tag',               // הוסף תג
        'create_notification'    // צור התראה
      ],
      required: true
    },

    // תוכן הפעולה
    content: {
      // להודעת WhatsApp/Email
      message: String,
      templateName: String,

      // למשימה
      taskTitle: String,
      taskDescription: String,
      taskPriority: String,

      // לשינוי סטטוס
      newStatus: String,

      // לעדכון ציון
      scoreDelta: Number,        // שינוי יחסי (לדוגמה +10, -5)
      newScore: Number,          // קיבוע ציון חדש מוחלט

      // ליצירת follow-up מתוזמן
      followupType: String,      // call / whatsapp / note / task
      followupSubject: String,
      followupContent: String,

      // לתג
      tagName: String,

      // להתראה
      notificationTitle: String,
      notificationMessage: String
    },

    // האם להפסיק אם יש תגובה?
    stopIfResponse: { type: Boolean, default: true },

    // סטטוס ביצוע
    executed: { type: Boolean, default: false },
    executedAt: Date
  }],

  // האם פעיל?
  isActive: { type: Boolean, default: true },

  // סטטיסטיקות
  stats: {
    totalTriggered: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    totalStopped: { type: Number, default: 0 },
    averageStepsCompleted: { type: Number, default: 0 }
  },

  // מי יצר
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastTriggered: Date
  }
}, {
  timestamps: true
});

// אינדקסים
LeadNurturingSchema.index({ 'trigger.type': 1, isActive: 1 });

module.exports = mongoose.model('LeadNurturing', LeadNurturingSchema);


