const mongoose = require('mongoose');

const marketingAnalyticsSchema = new mongoose.Schema({
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true
    }
  },
  
  overview: {
    totalCampaigns: {
      type: Number,
      default: 0
    },
    activeCampaigns: {
      type: Number,
      default: 0
    },
    completedCampaigns: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    totalLeads: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    avgROI: {
      type: Number,
      default: 0
    },
    avgCostPerLead: {
      type: Number,
      default: 0
    },
    avgConversionRate: {
      type: Number,
      default: 0
    }
  },
  
  channels: [{
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketingChannel'
    },
    name: String,
    type: String,
    spent: {
      type: Number,
      default: 0
    },
    leads: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    roi: {
      type: Number,
      default: 0
    },
    performance: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor', 'very_poor']
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    }
  }],
  
  campaigns: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketingCampaign'
    },
    name: String,
    type: String,
    status: String,
    spent: Number,
    leads: Number,
    conversions: Number,
    roi: Number,
    performance: mongoose.Schema.Types.Mixed
  }],
  
  // תובנות AI
  insights: [{
    type: {
      type: String,
      enum: ['opportunity', 'warning', 'recommendation', 'info']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    category: {
      type: String,
      enum: ['budget', 'performance', 'audience', 'timing', 'content', 'channel']
    },
    title: String,
    description: String,
    actionItems: [String],
    aiGenerated: {
      type: Boolean,
      default: false
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  
  // השוואות
  comparison: {
    previousPeriod: {
      totalSpent: Number,
      totalLeads: Number,
      totalConversions: Number,
      avgROI: Number
    },
    changes: {
      spentChange: Number,
      leadsChange: Number,
      conversionsChange: Number,
      roiChange: Number
    },
    trend: {
      type: String,
      enum: ['improving', 'declining', 'stable']
    }
  },
  
  // ניתוח פילוח
  segmentation: {
    bySource: [mongoose.Schema.Types.Mixed],
    byAudience: [mongoose.Schema.Types.Mixed],
    byTime: [mongoose.Schema.Types.Mixed]
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Indexes
marketingAnalyticsSchema.index({ 'period.start': 1, 'period.end': 1 });
marketingAnalyticsSchema.index({ 'period.type': 1, generatedAt: -1 });

// Static method ליצירת דוח חדש
marketingAnalyticsSchema.statics.generateReport = async function(startDate, endDate, periodType, userId) {
  const MarketingCampaign = mongoose.model('MarketingCampaign');
  const MarketingChannel = mongoose.model('MarketingChannel');
  
  // שלוף קמפיינים בתקופה
  const campaigns = await MarketingCampaign.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // שלוף ערוצים
  const channels = await MarketingChannel.find({ isActive: true });
  
  // חשב נתונים כלליים
  const overview = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalSpent: campaigns.reduce((sum, c) => sum + c.budget.spent, 0),
    totalLeads: campaigns.reduce((sum, c) => {
      return sum + c.channels.reduce((s, ch) => s + (ch.metrics.clicked || 0), 0);
    }, 0),
    totalConversions: campaigns.reduce((sum, c) => {
      return sum + c.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0);
    }, 0)
  };
  
  // חשב ממוצעים
  if (campaigns.length > 0) {
    overview.avgROI = campaigns.reduce((sum, c) => sum + (c.analytics.roi || 0), 0) / campaigns.length;
    overview.avgCostPerLead = overview.totalLeads > 0 ? overview.totalSpent / overview.totalLeads : 0;
    overview.avgConversionRate = overview.totalLeads > 0 ? (overview.totalConversions / overview.totalLeads) * 100 : 0;
  }
  
  // צור דוח
  const report = new this({
    period: {
      start: startDate,
      end: endDate,
      type: periodType
    },
    overview,
    channels: channels.map(ch => ({
      channelId: ch._id,
      name: ch.name,
      type: ch.type,
      spent: ch.budget.spent,
      leads: ch.performance.clicks,
      conversions: ch.performance.conversions,
      roi: ch.performance.roi,
      performance: this.categorizePerformance(ch.performance.roi),
      trend: 'stable'
    })),
    campaigns: campaigns.map(c => ({
      campaignId: c._id,
      name: c.name,
      type: c.type,
      status: c.status,
      spent: c.budget.spent,
      leads: c.channels.reduce((s, ch) => s + (ch.metrics.clicked || 0), 0),
      conversions: c.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0),
      roi: c.analytics.roi
    })),
    generatedBy: userId
  });
  
  await report.save();
  return report;
};

// Helper לקביעת רמת ביצועים
marketingAnalyticsSchema.statics.categorizePerformance = function(roi) {
  if (roi >= 100) return 'excellent';
  if (roi >= 50) return 'good';
  if (roi >= 20) return 'average';
  if (roi >= 0) return 'poor';
  return 'very_poor';
};

const MarketingAnalytics = mongoose.model('MarketingAnalytics', marketingAnalyticsSchema);

module.exports = MarketingAnalytics;









