// backend/models/TimeEntry.js
const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // בשניות
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  taskType: {
    type: String,
    enum: ['general', 'meeting', 'development', 'support', 'planning', 'other'],
    default: 'general'
  },
  isRunning: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// אינדקס מורכב לשאילתות מהירות
timeEntrySchema.index({ clientId: 1, startTime: -1 });
timeEntrySchema.index({ userId: 1, isRunning: 1 });

// חישוב משך הזמן לפני שמירה
timeEntrySchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// סטטיסטיקות לכל לקוח
timeEntrySchema.statics.getClientStats = async function(clientId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return { totalTime: 0, totalSessions: 0, avgSessionTime: 0 };
    }
    
    const stats = await this.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$duration' },
          totalSessions: { $sum: 1 },
          avgSessionTime: { $avg: '$duration' }
        }
      }
    ]);
    
    return stats[0] || { totalTime: 0, totalSessions: 0, avgSessionTime: 0 };
  } catch (error) {
    console.error('Error getting client stats:', error);
    return { totalTime: 0, totalSessions: 0, avgSessionTime: 0 };
  }
};

// סטטיסטיקות לפי סוג משימה
timeEntrySchema.statics.getClientStatsByTask = async function(clientId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return [];
    }
    
    return await this.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: '$taskType',
          totalTime: { $sum: '$duration' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalTime: -1 } }
    ]);
  } catch (error) {
    console.error('Error getting client stats by task:', error);
    return [];
  }
};

module.exports = mongoose.model('TimeEntry', timeEntrySchema);




