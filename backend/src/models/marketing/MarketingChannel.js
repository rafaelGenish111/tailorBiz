const mongoose = require('mongoose');

const marketingChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['social_media', 'paid_ads', 'email', 'sms', 'whatsapp', 'content', 'networking', 'partnerships'],
    required: true
  },
  
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'google', 'tiktok', 'email_service', 'sms_service', 'whatsapp_business', 'other']
  },
  
  // חיבורים ו-API
  integration: {
    connected: {
      type: Boolean,
      default: false
    },
    apiKey: String,
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    accountId: String,
    lastSync: Date
  },
  
  // תקציב
  budget: {
    monthly: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  
  // ביצועים
  performance: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    cost: {
      type: Number,
      default: 0
    },
    roi: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  
  // הגדרות
  settings: mongoose.Schema.Types.Mixed,
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: String
  
}, {
  timestamps: true
});

// Indexes
marketingChannelSchema.index({ type: 1, isActive: 1 });
marketingChannelSchema.index({ 'integration.connected': 1 });

// Method לחישוב CTR
marketingChannelSchema.methods.calculateCTR = function() {
  if (this.performance.impressions === 0) {
    this.performance.ctr = 0;
    return 0;
  }
  
  this.performance.ctr = Math.round((this.performance.clicks / this.performance.impressions) * 10000) / 100;
  return this.performance.ctr;
};

// Method לחישוב ROI
marketingChannelSchema.methods.calculateROI = function() {
  if (this.performance.cost === 0) {
    this.performance.roi = 0;
    return 0;
  }
  
  const avgConversionValue = 100;
  const revenue = this.performance.conversions * avgConversionValue;
  
  this.performance.roi = Math.round(((revenue - this.performance.cost) / this.performance.cost) * 10000) / 100;
  return this.performance.roi;
};

// Method לעדכון תקציב נותר
marketingChannelSchema.methods.updateRemainingBudget = function() {
  this.budget.remaining = this.budget.monthly - this.budget.spent;
  return this.budget.remaining;
};

const MarketingChannel = mongoose.model('MarketingChannel', marketingChannelSchema);

module.exports = MarketingChannel;

