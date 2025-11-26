const MarketingAnalytics = require('../../models/marketing/MarketingAnalytics');
const MarketingCampaign = require('../../models/marketing/MarketingCampaign');
const MarketingChannel = require('../../models/marketing/MarketingChannel');
const { generateInsights } = require('../../services/marketing/aiService');

// @desc    Get all analytics reports
// @route   GET /api/marketing/analytics
// @access  Private
exports.getAnalyticsReports = async (req, res) => {
  try {
    const { periodType, startDate, endDate } = req.query;
    
    const filter = {};
    if (periodType) filter['period.type'] = periodType;
    if (startDate) filter['period.start'] = { $gte: new Date(startDate) };
    if (endDate) filter['period.end'] = { $lte: new Date(endDate) };
    
    const reports = await MarketingAnalytics.find(filter)
      .sort({ generatedAt: -1 })
      .populate('generatedBy', 'name email')
      .limit(50);
    
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
    
  } catch (error) {
    console.error('Error in getAnalyticsReports:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת דוחות אנליטיקה',
      error: error.message
    });
  }
};

// @desc    Get single analytics report
// @route   GET /api/marketing/analytics/:id
// @access  Private
exports.getAnalyticsReport = async (req, res) => {
  try {
    const report = await MarketingAnalytics.findById(req.params.id)
      .populate('generatedBy', 'name email')
      .populate('channels.channelId')
      .populate('campaigns.campaignId');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'דוח לא נמצא'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Error in getAnalyticsReport:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת דוח',
      error: error.message
    });
  }
};

// @desc    Generate new analytics report
// @route   POST /api/marketing/analytics/generate
// @access  Private
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, periodType = 'custom' } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'נדרש תאריך התחלה וסיום'
      });
    }
    
    const userId = req.user._id || req.user.id;
    
    const report = await MarketingAnalytics.generateReport(
      new Date(startDate),
      new Date(endDate),
      periodType,
      userId
    );
    
    res.status(201).json({
      success: true,
      message: 'דוח נוצר בהצלחה',
      data: report
    });
    
  } catch (error) {
    console.error('Error in generateReport:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת דוח',
      error: error.message
    });
  }
};

// @desc    Get marketing overview
// @route   GET /api/marketing/analytics/overview
// @access  Private
exports.getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get campaigns in period
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: start, $lte: end }
    });
    
    // Get channels
    const channels = await MarketingChannel.find({ isActive: true });
    
    // Calculate overview metrics
    const overview = {
      period: { start, end },
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        planning: campaigns.filter(c => c.status === 'planning').length
      },
      financial: {
        totalBudget: campaigns.reduce((sum, c) => sum + c.budget.total, 0),
        totalSpent: campaigns.reduce((sum, c) => sum + c.budget.spent, 0),
        remaining: 0
      },
      performance: {
        totalLeads: 0,
        totalConversions: 0,
        avgROI: 0,
        avgCostPerLead: 0,
        avgConversionRate: 0
      },
      channels: {
        total: channels.length,
        connected: channels.filter(c => c.integration.connected).length,
        totalSpent: channels.reduce((sum, c) => sum + c.budget.spent, 0)
      }
    };
    
    // Calculate performance metrics
    campaigns.forEach(campaign => {
      campaign.channels.forEach(channel => {
        overview.performance.totalLeads += channel.metrics.clicked || 0;
        overview.performance.totalConversions += channel.metrics.converted || 0;
      });
    });
    
    // Calculate averages
    if (campaigns.length > 0) {
      overview.performance.avgROI = campaigns.reduce((sum, c) => sum + (c.analytics.roi || 0), 0) / campaigns.length;
      overview.performance.avgCostPerLead = overview.performance.totalLeads > 0 
        ? overview.financial.totalSpent / overview.performance.totalLeads 
        : 0;
      overview.performance.avgConversionRate = overview.performance.totalLeads > 0
        ? (overview.performance.totalConversions / overview.performance.totalLeads * 100)
        : 0;
    }
    
    overview.financial.remaining = overview.financial.totalBudget - overview.financial.totalSpent;
    
    // Round numbers
    overview.performance.avgROI = Math.round(overview.performance.avgROI * 100) / 100;
    overview.performance.avgCostPerLead = Math.round(overview.performance.avgCostPerLead * 100) / 100;
    overview.performance.avgConversionRate = Math.round(overview.performance.avgConversionRate * 100) / 100;
    
    res.json({
      success: true,
      data: overview
    });
    
  } catch (error) {
    console.error('Error in getOverview:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סקירה כללית',
      error: error.message
    });
  }
};

// @desc    Get campaigns performance
// @route   GET /api/marketing/analytics/campaigns
// @access  Private
exports.getCampaignsPerformance = async (req, res) => {
  try {
    const { startDate, endDate, sortBy = 'roi', sortOrder = 'desc' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('createdBy', 'name email');
    
    // Calculate performance for each campaign
    const performance = campaigns.map(campaign => {
      const totalLeads = campaign.channels.reduce((sum, ch) => sum + (ch.metrics.clicked || 0), 0);
      const totalConversions = campaign.channels.reduce((sum, ch) => sum + (ch.metrics.converted || 0), 0);
      const totalSent = campaign.channels.reduce((sum, ch) => sum + (ch.metrics.sent || 0), 0);
      
      return {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        targetDate: campaign.targetDate,
        budget: campaign.budget,
        leads: totalLeads,
        conversions: totalConversions,
        sent: totalSent,
        roi: campaign.analytics.roi,
        costPerLead: campaign.analytics.costPerLead,
        conversionRate: campaign.analytics.conversionRate,
        performance: categorizePerformance(campaign.analytics.roi),
        createdBy: campaign.createdBy
      };
    });
    
    // Sort
    performance.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] - b[sortBy];
      }
      return b[sortBy] - a[sortBy];
    });
    
    res.json({
      success: true,
      count: performance.length,
      data: performance
    });
    
  } catch (error) {
    console.error('Error in getCampaignsPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ביצועי קמפיינים',
      error: error.message
    });
  }
};

// @desc    Get channels performance
// @route   GET /api/marketing/analytics/channels
// @access  Private
exports.getChannelsPerformance = async (req, res) => {
  try {
    const channels = await MarketingChannel.find({ isActive: true });
    
    const performance = channels.map(channel => {
      // Update calculations
      channel.calculateCTR();
      channel.calculateROI();
      channel.updateRemainingBudget();
      
      return {
        id: channel._id,
        name: channel.name,
        type: channel.type,
        platform: channel.platform,
        budget: channel.budget,
        performance: {
          impressions: channel.performance.impressions,
          clicks: channel.performance.clicks,
          conversions: channel.performance.conversions,
          ctr: channel.performance.ctr,
          roi: channel.performance.roi,
          cost: channel.performance.cost
        },
        efficiency: {
          costPerClick: channel.performance.clicks > 0 
            ? (channel.performance.cost / channel.performance.clicks).toFixed(2) 
            : 0,
          costPerConversion: channel.performance.conversions > 0 
            ? (channel.performance.cost / channel.performance.conversions).toFixed(2) 
            : 0
        },
        performance_category: categorizePerformance(channel.performance.roi),
        integration: {
          connected: channel.integration.connected,
          lastSync: channel.integration.lastSync
        }
      };
    });
    
    // Sort by ROI
    performance.sort((a, b) => b.performance.roi - a.performance.roi);
    
    res.json({
      success: true,
      count: performance.length,
      data: performance
    });
    
  } catch (error) {
    console.error('Error in getChannelsPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ביצועי ערוצים',
      error: error.message
    });
  }
};

// @desc    Get ROI analysis
// @route   GET /api/marketing/analytics/roi
// @access  Private
exports.getROIAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['active', 'completed'] }
    });
    
    const channels = await MarketingChannel.find({ isActive: true });
    
    // Calculate total investment and returns
    const totalInvestment = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);
    const avgConversionValue = 100; // TODO: Make this configurable
    
    const totalRevenue = campaigns.reduce((sum, campaign) => {
      const conversions = campaign.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0);
      return sum + (conversions * avgConversionValue);
    }, 0);
    
    const totalROI = totalInvestment > 0 
      ? ((totalRevenue - totalInvestment) / totalInvestment * 100) 
      : 0;
    
    // ROI by campaign type
    const roiByType = {};
    campaigns.forEach(campaign => {
      if (!roiByType[campaign.type]) {
        roiByType[campaign.type] = {
          type: campaign.type,
          totalSpent: 0,
          totalRevenue: 0,
          roi: 0,
          count: 0
        };
      }
      
      const conversions = campaign.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0);
      const revenue = conversions * avgConversionValue;
      
      roiByType[campaign.type].totalSpent += campaign.budget.spent;
      roiByType[campaign.type].totalRevenue += revenue;
      roiByType[campaign.type].count++;
    });
    
    // Calculate ROI for each type
    Object.values(roiByType).forEach(type => {
      type.roi = type.totalSpent > 0 
        ? ((type.totalRevenue - type.totalSpent) / type.totalSpent * 100).toFixed(2)
        : 0;
    });
    
    // ROI by channel
    const roiByChannel = channels.map(channel => ({
      name: channel.name,
      type: channel.type,
      spent: channel.performance.cost,
      revenue: channel.performance.conversions * avgConversionValue,
      roi: channel.performance.roi
    }));
    
    // ROI trend over time (monthly)
    const roiTrend = calculateROITrend(campaigns, start, end);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalInvestment,
          totalRevenue,
          totalROI: Math.round(totalROI * 100) / 100,
          netProfit: totalRevenue - totalInvestment
        },
        byType: Object.values(roiByType),
        byChannel: roiByChannel,
        trend: roiTrend
      }
    });
    
  } catch (error) {
    console.error('Error in getROIAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בניתוח ROI',
      error: error.message
    });
  }
};

// @desc    Generate AI insights
// @route   GET /api/marketing/analytics/insights
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get data
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: start, $lte: end }
    });
    
    const channels = await MarketingChannel.find({ isActive: true });
    
    // Prepare data for AI
    const analyticsData = {
      overview: {
        totalCampaigns: campaigns.length,
        totalSpent: campaigns.reduce((sum, c) => sum + (c.budget.spent || 0), 0),
        totalLeads: campaigns.reduce((sum, c) => {
          return sum + c.channels.reduce((s, ch) => s + (ch.metrics.clicked || 0), 0);
        }, 0),
        totalConversions: campaigns.reduce((sum, c) => {
          return sum + c.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0);
        }, 0),
        avgROI: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.analytics.roi || 0), 0) / campaigns.length : 0,
        avgCostPerLead: 0,
        avgConversionRate: 0
      },
      campaigns: campaigns.map(c => ({
        name: c.name,
        type: c.type,
        status: c.status,
        budget: c.budget,
        analytics: c.analytics,
        channels: c.channels.map(ch => ({
          type: ch.type,
          metrics: ch.metrics
        }))
      })),
      channels: channels.map(ch => ({
        name: ch.name,
        type: ch.type,
        budget: ch.budget,
        performance: ch.performance
      }))
    };
    
    // Calculate averages
    if (analyticsData.overview.totalLeads > 0) {
      analyticsData.overview.avgCostPerLead = analyticsData.overview.totalSpent / analyticsData.overview.totalLeads;
      analyticsData.overview.avgConversionRate = (analyticsData.overview.totalConversions / analyticsData.overview.totalLeads) * 100;
    }
    
    // Generate AI insights
    const aiInsights = await generateInsights(analyticsData);
    
    // Manual insights (rule-based)
    const manualInsights = generateManualInsights(campaigns, channels);
    
    // Combine insights
    const allInsights = [...aiInsights, ...manualInsights];
    
    // Sort by priority
    allInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    res.json({
      success: true,
      count: allInsights.length,
      data: allInsights
    });
    
  } catch (error) {
    console.error('Error in getInsights:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת תובנות',
      error: error.message
    });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/marketing/analytics/dashboard
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const endDate = new Date();
    
    // Get active campaigns
    const activeCampaigns = await MarketingCampaign.countDocuments({
      status: 'active'
    });
    
    // Get upcoming campaigns
    const upcomingCampaigns = await MarketingCampaign.countDocuments({
      targetDate: { $gte: new Date() },
      status: { $in: ['planning', 'preparing'] }
    });
    
    // Get campaigns in period
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate totals
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget.spent || 0), 0);
    const totalLeads = campaigns.reduce((sum, c) => {
      return sum + c.channels.reduce((s, ch) => s + (ch.metrics.clicked || 0), 0);
    }, 0);
    const totalConversions = campaigns.reduce((sum, c) => {
      return sum + c.channels.reduce((s, ch) => s + (ch.metrics.converted || 0), 0);
    }, 0);
    
    // Get active channels
    const activeChannels = await MarketingChannel.countDocuments({ isActive: true });
    
    // Get recent reports
    const recentReports = await MarketingAnalytics.find()
      .sort({ generatedAt: -1 })
      .limit(5)
      .select('period overview generatedAt');
    
    const overview = {
      activeCampaigns,
      upcomingCampaigns,
      activeChannels,
      period: {
        start: startDate,
        end: endDate,
        days: parseInt(days)
      },
      metrics: {
        totalSpent,
        totalLeads,
        totalConversions,
        avgCostPerLead: totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 0,
        conversionRate: totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(2) : 0
      },
      recentReports
    };
    
    res.json({
      success: true,
      data: overview
    });
    
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סקירת דשבורד',
      error: error.message
    });
  }
};

// @desc    Delete analytics report
// @route   DELETE /api/marketing/analytics/:id
// @access  Private
exports.deleteAnalyticsReport = async (req, res) => {
  try {
    const report = await MarketingAnalytics.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'דוח לא נמצא'
      });
    }
    
    await report.deleteOne();
    
    res.json({
      success: true,
      message: 'דוח נמחק בהצלחה'
    });
    
  } catch (error) {
    console.error('Error in deleteAnalyticsReport:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת דוח',
      error: error.message
    });
  }
};

// @desc    Export analytics data
// @route   POST /api/marketing/analytics/export
// @access  Private
exports.exportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.body;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const campaigns = await MarketingCampaign.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('createdBy', 'name email');
    
    const channels = await MarketingChannel.find({ isActive: true });
    
    const exportData = {
      period: { start, end },
      campaigns: campaigns.map(c => ({
        name: c.name,
        type: c.type,
        status: c.status,
        budget: c.budget,
        analytics: c.analytics,
        channels: c.channels
      })),
      channels: channels.map(ch => ({
        name: ch.name,
        type: ch.type,
        budget: ch.budget,
        performance: ch.performance
      })),
      exportedAt: new Date(),
      exportedBy: req.user.name || req.user.email || 'Unknown'
    };
    
    if (format === 'csv') {
      // TODO: Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
    }
    
    res.json({
      success: true,
      data: exportData
    });
    
  } catch (error) {
    console.error('Error in exportAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בייצוא נתונים',
      error: error.message
    });
  }
};

// Helper functions
function categorizePerformance(roi) {
  if (roi >= 100) return 'excellent';
  if (roi >= 50) return 'good';
  if (roi >= 20) return 'average';
  if (roi >= 0) return 'poor';
  return 'very_poor';
}

function calculateROITrend(campaigns, startDate, endDate) {
  const trend = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const monthCampaigns = campaigns.filter(c => 
      c.createdAt >= monthStart && c.createdAt <= monthEnd
    );
    
    const totalSpent = monthCampaigns.reduce((sum, c) => sum + c.budget.spent, 0);
    const avgROI = monthCampaigns.length > 0
      ? monthCampaigns.reduce((sum, c) => sum + (c.analytics.roi || 0), 0) / monthCampaigns.length
      : 0;
    
    trend.push({
      month: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      spent: totalSpent,
      roi: Math.round(avgROI * 100) / 100,
      campaigns: monthCampaigns.length
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return trend;
}

function generateManualInsights(campaigns, channels) {
  const insights = [];
  
  // Check budget usage
  channels.forEach(channel => {
    if (channel.budget.monthly > 0) {
      const usagePercent = (channel.budget.spent / channel.budget.monthly) * 100;
      
      if (usagePercent > 80) {
        insights.push({
          type: 'warning',
          priority: 'high',
          category: 'budget',
          title: `תקציב ${channel.name} מתקרב לסיום`,
          description: `נוצלו ${usagePercent.toFixed(0)}% מהתקציב החודשי`,
          actionItems: [
            'שקול להגדיל את התקציב',
            'או להקטין את ההוצאות'
          ],
          aiGenerated: false,
          impactScore: 85
        });
      }
    }
  });
  
  // Check underperforming campaigns
  campaigns.forEach(campaign => {
    if (campaign.status === 'active' && campaign.analytics.roi < 0) {
      insights.push({
        type: 'warning',
        priority: 'high',
        category: 'performance',
        title: `קמפיין "${campaign.name}" מפסיד כסף`,
        description: `ROI שלילי של ${campaign.analytics.roi.toFixed(2)}%`,
        actionItems: [
          'בדוק את הקריאייטיב',
          'שנה את קהל היעד',
          'שקול להשהות את הקמפיין'
        ],
        aiGenerated: false,
        impactScore: 90
      });
    }
  });
  
  // Check high performing channels
  channels.forEach(channel => {
    if (channel.performance.roi > 100) {
      insights.push({
        type: 'opportunity',
        priority: 'high',
        category: 'performance',
        title: `${channel.name} מתפקד מעולה!`,
        description: `ROI של ${channel.performance.roi.toFixed(2)}% - הזדמנות להגדלה`,
        actionItems: [
          `הגדל את התקציב ב-50%`,
          'שכפל את האסטרטגיה לערוצים אחרים'
        ],
        aiGenerated: false,
        impactScore: 95
      });
    }
  });
  
  // Check upcoming campaigns
  const upcomingCampaigns = campaigns.filter(c => {
    const days = c.daysUntilPreparation;
    return days !== null && days <= 7 && days >= 0 && c.status === 'planning';
  });
  
  upcomingCampaigns.forEach(campaign => {
    insights.push({
      type: 'info',
      priority: 'medium',
      category: 'timing',
      title: `קמפיין "${campaign.name}" מתקרב`,
      description: `יש להתחיל הכנות בעוד ${campaign.daysUntilPreparation} ימים`,
      actionItems: [
        'ודא שהתוכן מוכן',
        'בדוק את התקציב',
        'אשר את קהל היעד'
      ],
      aiGenerated: false,
      impactScore: 70
    });
  });
  
  return insights;
}

