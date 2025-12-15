const MarketingCampaign = require('../../models/marketing/MarketingCampaign');
const { createTasksForCampaign } = require('../../services/marketing/calendarIntegration');

// @desc    Get all campaigns
// @route   GET /api/marketing/campaigns
// @access  Private
exports.getCampaigns = async (req, res) => {
  try {
    const { status, type, search, sortBy = 'targetDate', sortOrder = 'asc' } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'content.headline': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const campaigns = await MarketingCampaign.find(filter)
      .sort(sort)
      .populate('createdBy', 'name email')
      .populate('tasks.taskId');
    
    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
    
  } catch (error) {
    console.error('Error in getCampaigns:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת קמפיינים',
      error: error.message
    });
  }
};

// @desc    Get single campaign
// @route   GET /api/marketing/campaigns/:id
// @access  Private
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('tasks.taskId')
      .populate('targetAudience.segmentIds');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    res.json({
      success: true,
      data: campaign
    });
    
  } catch (error) {
    console.error('Error in getCampaign:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת קמפיין',
      error: error.message
    });
  }
};

// @desc    Create new campaign
// @route   POST /api/marketing/campaigns
// @access  Private
exports.createCampaign = async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };
    
    const campaign = await MarketingCampaign.create(campaignData);
    
    // יצירת משימות אוטומטית
    if (campaign.automation && campaign.automation.enabled) {
      try {
        await createTasksForCampaign(campaign);
      } catch (taskError) {
        console.error('Error creating tasks for campaign:', taskError);
        // לא נכשל את יצירת הקמפיין בגלל שגיאה ביצירת משימות
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'קמפיין נוצר בהצלחה',
      data: campaign
    });
    
  } catch (error) {
    console.error('Error in createCampaign:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה ביצירת קמפיין',
      error: error.message
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/marketing/campaigns/:id
// @access  Private
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        campaign[key] = req.body[key];
      }
    });
    
    await campaign.save();
    
    res.json({
      success: true,
      message: 'קמפיין עודכן בהצלחה',
      data: campaign
    });
    
  } catch (error) {
    console.error('Error in updateCampaign:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בעדכון קמפיין',
      error: error.message
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/marketing/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    await campaign.deleteOne();
    
    res.json({
      success: true,
      message: 'קמפיין נמחק בהצלחה'
    });
    
  } catch (error) {
    console.error('Error in deleteCampaign:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת קמפיין',
      error: error.message
    });
  }
};

// @desc    Activate campaign
// @route   POST /api/marketing/campaigns/:id/activate
// @access  Private
exports.activateCampaign = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    campaign.status = 'active';
    campaign.startDate = new Date();
    await campaign.save();
    
    res.json({
      success: true,
      message: 'קמפיין הופעל בהצלחה',
      data: campaign
    });
    
  } catch (error) {
    console.error('Error in activateCampaign:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בהפעלת קמפיין',
      error: error.message
    });
  }
};

// @desc    Pause campaign
// @route   POST /api/marketing/campaigns/:id/pause
// @access  Private
exports.pauseCampaign = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    campaign.status = 'paused';
    await campaign.save();
    
    res.json({
      success: true,
      message: 'קמפיין הושהה בהצלחה',
      data: campaign
    });
    
  } catch (error) {
    console.error('Error in pauseCampaign:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בהשהיית קמפיין',
      error: error.message
    });
  }
};

// @desc    Get campaign analytics
// @route   GET /api/marketing/campaigns/:id/analytics
// @access  Private
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    // חישוב מחדש של כל המדדים
    campaign.calculateROI();
    campaign.calculateCostPerLead();
    campaign.calculateConversionRate();
    await campaign.save();
    
    // מידע מפורט לאנליטיקה
    const analytics = {
      overview: {
        status: campaign.status,
        daysActive: campaign.startDate ? Math.ceil((new Date() - campaign.startDate) / (1000 * 60 * 60 * 24)) : 0,
        daysUntilTarget: campaign.daysUntilTarget,
        budget: campaign.budget,
        roi: campaign.analytics.roi,
        costPerLead: campaign.analytics.costPerLead,
        conversionRate: campaign.analytics.conversionRate
      },
      channels: campaign.channels.map(channel => ({
        type: channel.type,
        status: channel.status,
        metrics: channel.metrics,
        performance: {
          openRate: channel.metrics.sent > 0 ? (channel.metrics.opened / channel.metrics.sent * 100).toFixed(2) : 0,
          clickRate: channel.metrics.opened > 0 ? (channel.metrics.clicked / channel.metrics.opened * 100).toFixed(2) : 0,
          conversionRate: channel.metrics.clicked > 0 ? (channel.metrics.converted / channel.metrics.clicked * 100).toFixed(2) : 0
        }
      })),
      goals: campaign.goals.map(goal => ({
        metric: goal.metric,
        target: goal.target,
        actual: goal.actual,
        progress: goal.target > 0 ? (goal.actual / goal.target * 100).toFixed(2) : 0
      })),
      insights: campaign.analytics.insights,
      recommendations: campaign.analytics.recommendations
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Error in getCampaignAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת אנליטיקה',
      error: error.message
    });
  }
};

// @desc    Duplicate campaign
// @route   POST /api/marketing/campaigns/:id/duplicate
// @access  Private
exports.duplicateCampaign = async (req, res) => {
  try {
    const originalCampaign = await MarketingCampaign.findById(req.params.id);
    
    if (!originalCampaign) {
      return res.status(404).json({
        success: false,
        message: 'קמפיין לא נמצא'
      });
    }
    
    // יצירת עותק
    const campaignData = originalCampaign.toObject();
    delete campaignData._id;
    delete campaignData.createdAt;
    delete campaignData.updatedAt;
    
    campaignData.name = `${campaignData.name} (עותק)`;
    campaignData.status = 'planning';
    campaignData.createdBy = req.user._id || req.user.id;
    
    // איפוס נתוני ביצועים
    campaignData.channels.forEach(channel => {
      channel.status = 'draft';
      channel.sentDate = null;
      channel.metrics = {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        cost: 0
      };
    });
    
    campaignData.budget.spent = 0;
    campaignData.analytics = {
      roi: 0,
      costPerLead: 0,
      conversionRate: 0,
      insights: [],
      recommendations: []
    };
    
    const newCampaign = await MarketingCampaign.create(campaignData);
    
    res.status(201).json({
      success: true,
      message: 'קמפיין שוכפל בהצלחה',
      data: newCampaign
    });
    
  } catch (error) {
    console.error('Error in duplicateCampaign:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בשכפול קמפיין',
      error: error.message
    });
  }
};

// @desc    Get upcoming campaigns (for calendar/dashboard)
// @route   GET /api/marketing/campaigns/upcoming
// @access  Private
exports.getUpcomingCampaigns = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    const campaigns = await MarketingCampaign.find({
      targetDate: {
        $gte: new Date(),
        $lte: endDate
      },
      status: { $in: ['planning', 'preparing', 'active'] }
    })
    .sort({ targetDate: 1 })
    .populate('createdBy', 'name email')
    .select('name type status targetDate preparationDays daysUntilTarget daysUntilPreparation budget');
    
    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
    
  } catch (error) {
    console.error('Error in getUpcomingCampaigns:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת קמפיינים קרובים',
      error: error.message
    });
  }
};









