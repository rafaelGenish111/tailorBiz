// backend/src/controllers/leadNurturingController.js
const LeadNurturing = require('../models/LeadNurturing');
const LeadNurturingInstance = require('../models/LeadNurturingInstance');
const Client = require('../models/Client');

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return id && id !== 'temp-user-id' && /^[0-9a-fA-F]{24}$/.test(id);
}

// קבלת כל התבניות
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await LeadNurturing.find()
      .populate('createdBy', 'name email')
      .sort('-metadata.createdAt');

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error in getAllTemplates:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת התבניות',
      error: error.message
    });
  }
};

// קבלת תבנית בודדת
exports.getTemplateById = async (req, res) => {
  try {
    const template = await LeadNurturing.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'תבנית לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת התבנית',
      error: error.message
    });
  }
};

// יצירת תבנית חדשה
exports.createTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User ID לא תקין'
      });
    }

    const templateData = {
      ...req.body,
      createdBy: userId
    };

    const template = new LeadNurturing(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: 'תבנית נוצרה בהצלחה',
      data: template
    });
  } catch (error) {
    console.error('Error in createTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת התבנית',
      error: error.message
    });
  }
};

// עדכון תבנית
exports.updateTemplate = async (req, res) => {
  try {
    const template = await LeadNurturing.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'תבנית לא נמצאה'
      });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        template[key] = req.body[key];
      }
    });

    template.metadata.updatedAt = new Date();
    await template.save();

    res.json({
      success: true,
      message: 'תבנית עודכנה בהצלחה',
      data: template
    });
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון התבנית',
      error: error.message
    });
  }
};

// מחיקת תבנית
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await LeadNurturing.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'תבנית לא נמצאה'
      });
    }

    // מחק גם את כל המופעים הפעילים
    await LeadNurturingInstance.deleteMany({
      nurturingTemplate: req.params.id
    });

    res.json({
      success: true,
      message: 'תבנית נמחקה בהצלחה'
    });
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת התבנית',
      error: error.message
    });
  }
};

// הפעלה/כיבוי של תבנית
exports.toggleTemplateActive = async (req, res) => {
  try {
    const template = await LeadNurturing.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'תבנית לא נמצאה'
      });
    }

    template.isActive = !template.isActive;
    template.metadata.updatedAt = new Date();
    await template.save();

    res.json({
      success: true,
      message: `תבנית ${template.isActive ? 'הופעלה' : 'כובתה'} בהצלחה`,
      data: template
    });
  } catch (error) {
    console.error('Error in toggleTemplateActive:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשינוי סטטוס התבנית',
      error: error.message
    });
  }
};

// קבלת כל המופעים הפעילים
exports.getActiveInstances = async (req, res) => {
  try {
    const { status, clientId } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.client = clientId;
    }

    const instances = await LeadNurturingInstance.find(query)
      .populate('nurturingTemplate', 'name description')
      .populate('client', 'personalInfo businessInfo status leadScore')
      .sort('-startedAt');

    res.json({
      success: true,
      count: instances.length,
      data: instances
    });
  } catch (error) {
    console.error('Error in getActiveInstances:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת המופעים',
      error: error.message
    });
  }
};

// הפסקה ידנית של מופע
exports.stopInstance = async (req, res) => {
  try {
    const instance = await LeadNurturingInstance.findById(req.params.id);

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'מופע לא נמצא'
      });
    }

    instance.status = 'stopped';
    instance.stopReason = req.body.reason || 'הופסק ידנית';
    instance.stoppedAt = new Date();
    await instance.save();

    res.json({
      success: true,
      message: 'מופע הופסק בהצלחה',
      data: instance
    });
  } catch (error) {
    console.error('Error in stopInstance:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהפסקת המופע',
      error: error.message
    });
  }
};

// הפעלה ידנית של תבנית על ליד
exports.manualTrigger = async (req, res) => {
  try {
    const { templateId, clientId } = req.body;

    // וודא שהתבנית והלקוח קיימים
    const template = await LeadNurturing.findById(templateId);
    const client = await Client.findById(clientId);

    if (!template || !client) {
      return res.status(404).json({
        success: false,
        message: 'תבנית או לקוח לא נמצאו'
      });
    }

    // בדוק אם כבר יש מופע פעיל
    const existingInstance = await LeadNurturingInstance.findOne({
      nurturingTemplate: templateId,
      client: clientId,
      status: 'active'
    });

    if (existingInstance) {
      return res.status(400).json({
        success: false,
        message: 'כבר קיים רצף פעיל עבור לקוח זה'
      });
    }

    // צור מופע חדש
    const instance = new LeadNurturingInstance({
      nurturingTemplate: templateId,
      client: clientId,
      status: 'active',
      currentStep: 0,
      nextActionAt: new Date() // התחל מיד
    });

    await instance.save();

    template.stats.totalTriggered += 1;
    await template.save();

    res.status(201).json({
      success: true,
      message: 'רצף טיפוח הופעל בהצלחה',
      data: instance
    });
  } catch (error) {
    console.error('Error in manualTrigger:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהפעלת הרצף',
      error: error.message
    });
  }
};

// סטטיסטיקות כלליות
exports.getNurturingStats = async (req, res) => {
  try {
    const stats = {
      totalTemplates: await LeadNurturing.countDocuments(),
      activeTemplates: await LeadNurturing.countDocuments({ isActive: true }),
      
      totalInstances: await LeadNurturingInstance.countDocuments(),
      activeInstances: await LeadNurturingInstance.countDocuments({ status: 'active' }),
      completedInstances: await LeadNurturingInstance.countDocuments({ status: 'completed' }),
      stoppedInstances: await LeadNurturingInstance.countDocuments({ status: 'stopped' }),

      // Top performing templates
      topTemplates: await LeadNurturing.find({ isActive: true })
        .sort('-stats.totalCompleted')
        .limit(5)
        .select('name stats'),

      // Recent activity
      recentActivity: await LeadNurturingInstance.find()
        .populate('client', 'personalInfo')
        .populate('nurturingTemplate', 'name')
        .sort('-metadata.updatedAt')
        .limit(10)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getNurturingStats:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הסטטיסטיקות',
      error: error.message
    });
  }
};

module.exports = exports;











