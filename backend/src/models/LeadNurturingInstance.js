// backend/src/models/LeadNurturingInstance.js
const mongoose = require('mongoose');

/**
 * Lead Nurturing Instance - מופע פעיל של רצף טיפוח
 */
const LeadNurturingInstanceSchema = new mongoose.Schema({
  // קישור לתבנית
  nurturingTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadNurturing',
    required: true
  },

  // הליד שמטופח
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  // סטטוס הרצף
  status: {
    type: String,
    enum: ['active', 'completed', 'stopped', 'paused'],
    default: 'active'
  },

  // באיזה שלב אנחנו?
  currentStep: { type: Number, default: 0 },

  // מתי התחלנו?
  startedAt: { type: Date, default: Date.now },

  // מתי השלב הבא?
  nextActionAt: Date,

  // היסטוריית ביצוע
  executionHistory: [{
    step: Number,
    actionType: String,
    executedAt: { type: Date, default: Date.now },
    success: Boolean,
    response: String,
    error: String
  }],

  // למה הפסקנו (אם הפסקנו)?
  stopReason: String,
  stoppedAt: Date,

  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// אינדקסים
LeadNurturingInstanceSchema.index({ client: 1, status: 1 });
LeadNurturingInstanceSchema.index({ nextActionAt: 1, status: 1 });
LeadNurturingInstanceSchema.index({ nurturingTemplate: 1 });

module.exports = mongoose.model('LeadNurturingInstance', LeadNurturingInstanceSchema);









