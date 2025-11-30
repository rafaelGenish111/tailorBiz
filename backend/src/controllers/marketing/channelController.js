const MarketingChannel = require('../../models/marketing/MarketingChannel');

// @desc    Get all channels
// @route   GET /api/marketing/channels
// @access  Private
exports.getChannels = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const channels = await MarketingChannel.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      count: channels.length,
      data: channels
    });
    
  } catch (error) {
    console.error('Error in getChannels:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ערוצים',
      error: error.message
    });
  }
};

// @desc    Get single channel
// @route   GET /api/marketing/channels/:id
// @access  Private
exports.getChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    res.json({
      success: true,
      data: channel
    });
    
  } catch (error) {
    console.error('Error in getChannel:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ערוץ',
      error: error.message
    });
  }
};

// @desc    Create new channel
// @route   POST /api/marketing/channels
// @access  Private
exports.createChannel = async (req, res) => {
  try {
    const channelData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };
    
    const channel = await MarketingChannel.create(channelData);
    
    res.status(201).json({
      success: true,
      message: 'ערוץ נוצר בהצלחה',
      data: channel
    });
    
  } catch (error) {
    console.error('Error in createChannel:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה ביצירת ערוץ',
      error: error.message
    });
  }
};

// @desc    Update channel
// @route   PUT /api/marketing/channels/:id
// @access  Private
exports.updateChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        channel[key] = req.body[key];
      }
    });
    
    await channel.save();
    
    res.json({
      success: true,
      message: 'ערוץ עודכן בהצלחה',
      data: channel
    });
    
  } catch (error) {
    console.error('Error in updateChannel:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בעדכון ערוץ',
      error: error.message
    });
  }
};

// @desc    Delete channel
// @route   DELETE /api/marketing/channels/:id
// @access  Private
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    await channel.deleteOne();
    
    res.json({
      success: true,
      message: 'ערוץ נמחק בהצלחה'
    });
    
  } catch (error) {
    console.error('Error in deleteChannel:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת ערוץ',
      error: error.message
    });
  }
};

// @desc    Connect channel API
// @route   POST /api/marketing/channels/:id/connect
// @access  Private
exports.connectChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    const { apiKey, accessToken, refreshToken, accountId } = req.body;
    
    channel.integration = {
      connected: true,
      apiKey,
      accessToken,
      refreshToken,
      accountId,
      lastSync: new Date()
    };
    
    await channel.save();
    
    res.json({
      success: true,
      message: 'ערוץ חובר בהצלחה',
      data: channel
    });
    
  } catch (error) {
    console.error('Error in connectChannel:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בחיבור ערוץ',
      error: error.message
    });
  }
};

// @desc    Disconnect channel API
// @route   POST /api/marketing/channels/:id/disconnect
// @access  Private
exports.disconnectChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    channel.integration = {
      connected: false,
      apiKey: null,
      accessToken: null,
      refreshToken: null,
      accountId: null,
      lastSync: null
    };
    
    await channel.save();
    
    res.json({
      success: true,
      message: 'ערוץ נותק בהצלחה',
      data: channel
    });
    
  } catch (error) {
    console.error('Error in disconnectChannel:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בניתוק ערוץ',
      error: error.message
    });
  }
};

// @desc    Get channel performance
// @route   GET /api/marketing/channels/:id/performance
// @access  Private
exports.getChannelPerformance = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    // חישוב מדדים
    channel.calculateCTR();
    channel.calculateROI();
    channel.updateRemainingBudget();
    await channel.save();
    
    const performance = {
      overview: {
        impressions: channel.performance.impressions,
        clicks: channel.performance.clicks,
        conversions: channel.performance.conversions,
        ctr: channel.performance.ctr,
        roi: channel.performance.roi
      },
      budget: {
        monthly: channel.budget.monthly,
        spent: channel.budget.spent,
        remaining: channel.budget.remaining,
        usagePercentage: channel.budget.monthly > 0 ? 
          ((channel.budget.spent / channel.budget.monthly) * 100).toFixed(2) : 0
      },
      efficiency: {
        costPerClick: channel.performance.clicks > 0 ? 
          (channel.performance.cost / channel.performance.clicks).toFixed(2) : 0,
        costPerConversion: channel.performance.conversions > 0 ? 
          (channel.performance.cost / channel.performance.conversions).toFixed(2) : 0
      }
    };
    
    res.json({
      success: true,
      data: performance
    });
    
  } catch (error) {
    console.error('Error in getChannelPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ביצועי ערוץ',
      error: error.message
    });
  }
};

// @desc    Sync channel data
// @route   POST /api/marketing/channels/:id/sync
// @access  Private
exports.syncChannel = async (req, res) => {
  try {
    const channel = await MarketingChannel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'ערוץ לא נמצא'
      });
    }
    
    if (!channel.integration.connected) {
      return res.status(400).json({
        success: false,
        message: 'ערוץ לא מחובר'
      });
    }
    
    // TODO: Implement actual API sync based on platform
    // For now, just update lastSync
    channel.integration.lastSync = new Date();
    await channel.save();
    
    res.json({
      success: true,
      message: 'ערוץ סונכרן בהצלחה',
      data: channel
    });
    
  } catch (error) {
    console.error('Error in syncChannel:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בסנכרון ערוץ',
      error: error.message
    });
  }
};



