// backend/src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // סוג ההתראה
  type: {
    type: String,
    enum: [
      'task_reminder',      // תזכורת למשימה
      'task_assigned',      // משימה הוקצתה לך
      'task_overdue',       // משימה באיחור
      'payment_reminder',   // תזכורת תשלום
      'payment_overdue',    // תשלום באיחור
      'meeting_reminder',   // תזכורת פגישה
      'new_lead',          // ליד חדש
      'client_update',     // עדכון לקוח
      'follow_up',         // Follow-up נדרש
      'system',            // התראת מערכת
      'achievement'        // הישג (gamification)
    ],
    required: true
  },

  // כותרת והודעה
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // למי ההתראה
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // קישורים רלוונטיים
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskManager'
  },

  relatedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },

  // עדיפות
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // סטטוס
  read: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  // פעולה מומלצת
  actionUrl: String,
  actionText: String,

  // אייקון וצבע
  icon: String,
  color: String,

  // תאריך
  createdAt: {
    type: Date,
    default: Date.now
  },

  // פג תוקף (למחיקה אוטומטית)
  expiresAt: Date
}, {
  timestamps: true
});

// אינדקסים
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL Index

module.exports = mongoose.model('Notification', NotificationSchema);










