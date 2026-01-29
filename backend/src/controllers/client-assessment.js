const Client = require('../models/Client');
const { isValidObjectId, enforceLeadOwnershipOnRecord } = require('./client-crud');

// ============================================================================
// Assessment Form Management
// ============================================================================

/**
 * מילוי שאלון אפיון
 */
exports.fillAssessmentForm = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    // עדכון שאלון אפיון
    client.assessmentForm = {
      ...req.body,
      filledAt: new Date()
    };

    // אם יש פרטים אישיים/עסקיים בשאלון, עדכן גם אותם
    if (req.body.basicInfo) {
      if (req.body.basicInfo.businessDescription) {
        client.businessInfo.businessType = req.body.basicInfo.businessDescription;
      }
      if (req.body.basicInfo.numberOfEmployees) {
        client.businessInfo.numberOfEmployees = req.body.basicInfo.numberOfEmployees;
      }
    }

    // עדכון סטטוס אם זה אפיון ראשון (Sales OS)
    if (client.status === 'new_lead' || client.status === 'contacted') {
      client.status = 'engaged';
    }

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'note',
      direction: 'outbound',
      subject: 'שאלון אפיון הושלם',
      content: 'שאלון אפיון טלפוני הושלם',
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      completed: true
    });

    await client.save();

    res.json({
      success: true,
      message: 'שאלון אפיון נשמר בהצלחה',
      data: client
    });

  } catch (error) {
    console.error('Error in fillAssessmentForm:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשמירת שאלון האפיון',
      error: error.message
    });
  }
};

/**
 * קבלת שאלון אפיון
 */
exports.getAssessmentForm = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('personalInfo businessInfo assessmentForm');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    res.json({
      success: true,
      data: {
        personalInfo: client.personalInfo,
        businessInfo: client.businessInfo,
        assessmentForm: client.assessmentForm
      }
    });

  } catch (error) {
    console.error('Error in getAssessmentForm:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת שאלון האפיון',
      error: error.message
    });
  }
};

// ============================================================================
// Contract Management
// ============================================================================

/**
 * עדכון / העלאת חוזה ללקוח/ליד קיים
 */
exports.uploadContract = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    const contractFile = req.file;
    const { signed, signedAt, notes } = req.body;

    if (!contractFile && signed === undefined && signedAt === undefined && !notes) {
      return res.status(400).json({
        success: false,
        message: 'לא סופקו נתונים לעדכון החוזה'
      });
    }

    const currentContract = client.contract || {};

    // עדכון שדות חוזה
    if (contractFile) {
      const IS_VERCEL = process.env.VERCEL === '1';

      let fileUrlForPreview = null;

      if (IS_VERCEL && contractFile.buffer) {
        // ב-Vercel אין מערכת קבצים - נשתמש ב-data URL לצורך תצוגה מקדימה
        try {
          const base64 = contractFile.buffer.toString('base64');
          fileUrlForPreview = `data:${contractFile.mimetype || 'application/pdf'};base64,${base64}`;
        } catch (e) {
          console.error('Failed to build data URL for contract file:', e.message);
        }
      }

      // בסביבת פיתוח מקומית נשתמש בנתיב הקובץ שנשמר בדיסק
      if (!fileUrlForPreview && contractFile.filename) {
        fileUrlForPreview = `/uploads/contracts/${contractFile.filename}`;
      }

      currentContract.fileUrl = fileUrlForPreview || currentContract.fileUrl;
      currentContract.signed = true;
      if (!currentContract.signedAt) {
        currentContract.signedAt = new Date();
      }
    }

    if (signed !== undefined) {
      currentContract.signed = signed === 'true' || signed === true;
    }

    if (signedAt) {
      currentContract.signedAt = new Date(signedAt);
    }

    if (typeof notes === 'string') {
      currentContract.notes = notes;
    }

    client.contract = currentContract;
    await client.save();

    res.json({
      success: true,
      message: 'החוזה עודכן בהצלחה',
      data: client.contract
    });
  } catch (error) {
    console.error('Error in uploadContract:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון החוזה',
      error: error.message
    });
  }
};

/**
 * קבלת פרטי החוזה עבור לקוח/ליד
 */
exports.getContract = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('contract');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    res.json({
      success: true,
      data: client.contract || null
    });
  } catch (error) {
    console.error('Error in getContract:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת החוזה',
      error: error.message
    });
  }
};
