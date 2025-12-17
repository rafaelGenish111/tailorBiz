const MarketingAutomation = require('../../models/marketing/MarketingAutomation');
const { executeAutomation } = require('../../services/marketing/automationEngine');

// @desc    Get all automations
// @route   GET /api/marketing/automations
// @access  Private
exports.getAutomations = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const automations = await MarketingAutomation.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('campaignId', 'name type status');
    
    res.json({
      success: true,
      count: automations.length,
      data: automations
    });
    
  } catch (error) {
    console.error('Error in getAutomations:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת אוטומציות',
      error: error.message
    });
  }
};

// @desc    Get single automation
// @route   GET /api/marketing/automations/:id
// @access  Private
exports.getAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('campaignId', 'name type status');
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    res.json({
      success: true,
      data: automation
    });
    
  } catch (error) {
    console.error('Error in getAutomation:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת אוטומציה',
      error: error.message
    });
  }
};

// @desc    Create new automation
// @route   POST /api/marketing/automations
// @access  Private
exports.createAutomation = async (req, res) => {
  try {
    const automationData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };
    
    const automation = await MarketingAutomation.create(automationData);
    
    // חישוב הרצה הבאה
    automation.calculateNextRun();
    await automation.save();
    
    res.status(201).json({
      success: true,
      message: 'אוטומציה נוצרה בהצלחה',
      data: automation
    });
    
  } catch (error) {
    console.error('Error in createAutomation:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה ביצירת אוטומציה',
      error: error.message
    });
  }
};

// @desc    Update automation
// @route   PUT /api/marketing/automations/:id
// @access  Private
exports.updateAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        automation[key] = req.body[key];
      }
    });
    
    // חישוב מחדש של הרצה הבאה
    automation.calculateNextRun();
    await automation.save();
    
    res.json({
      success: true,
      message: 'אוטומציה עודכנה בהצלחה',
      data: automation
    });
    
  } catch (error) {
    console.error('Error in updateAutomation:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בעדכון אוטומציה',
      error: error.message
    });
  }
};

// @desc    Delete automation
// @route   DELETE /api/marketing/automations/:id
// @access  Private
exports.deleteAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    await automation.deleteOne();
    
    res.json({
      success: true,
      message: 'אוטומציה נמחקה בהצלחה'
    });
    
  } catch (error) {
    console.error('Error in deleteAutomation:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת אוטומציה',
      error: error.message
    });
  }
};

// @desc    Activate automation
// @route   POST /api/marketing/automations/:id/activate
// @access  Private
exports.activateAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    automation.isActive = true;
    automation.calculateNextRun();
    await automation.save();
    
    res.json({
      success: true,
      message: 'אוטומציה הופעלה בהצלחה',
      data: automation
    });
    
  } catch (error) {
    console.error('Error in activateAutomation:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בהפעלת אוטומציה',
      error: error.message
    });
  }
};

// @desc    Pause automation
// @route   POST /api/marketing/automations/:id/pause
// @access  Private
exports.pauseAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    automation.isActive = false;
    automation.nextRun = null;
    await automation.save();
    
    res.json({
      success: true,
      message: 'אוטומציה הושהתה בהצלחה',
      data: automation
    });
    
  } catch (error) {
    console.error('Error in pauseAutomation:', error);
    res.status(400).json({
      success: false,
      message: 'שגיאה בהשהיית אוטומציה',
      error: error.message
    });
  }
};

// @desc    Get automation logs
// @route   GET /api/marketing/automations/:id/logs
// @access  Private
exports.getAutomationLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    const logs = automation.logs
      .sort((a, b) => b.executedAt - a.executedAt)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: logs.length,
      data: logs,
      stats: automation.stats
    });
    
  } catch (error) {
    console.error('Error in getAutomationLogs:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת לוגים',
      error: error.message
    });
  }
};

// @desc    Test automation (manual run)
// @route   POST /api/marketing/automations/:id/test
// @access  Private
exports.testAutomation = async (req, res) => {
  try {
    const automation = await MarketingAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'אוטומציה לא נמצאה'
      });
    }
    
    // הרצה ידנית
    const result = await executeAutomation(automation, true); // true = test mode
    
    res.json({
      success: true,
      message: 'אוטומציה הורצה בהצלחה (מצב בדיקה)',
      data: result
    });
    
  } catch (error) {
    console.error('Error in testAutomation:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהרצת אוטומציה',
      error: error.message
    });
  }
};











