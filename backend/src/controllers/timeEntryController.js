// backend/controllers/timeEntryController.js
const TimeEntry = require('../models/TimeEntry');
const Client = require('../models/Client');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// התחלת טיימר
exports.startTimer = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { taskType, description } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    // בדוק אם יש טיימר פעיל לאותו משתמש
    const activeTimer = await TimeEntry.findOne({
      userId,
      isRunning: true
    });

    if (activeTimer) {
      return res.status(400).json({
        success: false,
        message: 'יש לך כבר טיימר פעיל. עצור אותו לפני שתתחיל חדש.',
        activeTimer: {
          clientId: activeTimer.clientId,
          startTime: activeTimer.startTime
        }
      });
    }

    // וודא שהלקוח קיים
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // צור entry חדש
    const timeEntry = await TimeEntry.create({
      clientId,
      userId,
      startTime: new Date(),
      taskType: taskType || 'general',
      description,
      isRunning: true
    });

    res.status(201).json({
      success: true,
      message: 'הטיימר התחיל',
      data: timeEntry
    });

  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהפעלת הטיימר',
      error: error.message
    });
  }
};

// עצירת טיימר
exports.stopTimer = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const timeEntry = await TimeEntry.findOne({
      _id: entryId,
      userId,
      isRunning: true
    });

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'טיימר פעיל לא נמצא'
      });
    }

    timeEntry.endTime = new Date();
    timeEntry.isRunning = false;
    await timeEntry.save();

    res.json({
      success: true,
      message: 'הטיימר נעצר',
      data: timeEntry
    });

  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעצירת הטיימר',
      error: error.message
    });
  }
};

// קבלת טיימר פעיל
exports.getActiveTimer = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({
        success: true,
        data: null
      });
    }

    const activeTimer = await TimeEntry.findOne({
      userId,
      isRunning: true
    }).populate('clientId', 'personalInfo.fullName businessInfo.businessName');

    res.json({
      success: true,
      data: activeTimer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת טיימר פעיל',
      error: error.message
    });
  }
};

// קבלת כל הזמנים של לקוח
exports.getClientTimeEntries = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const query = { clientId };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const timeEntries = await TimeEntry.find(query)
      .populate('userId', 'name email')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TimeEntry.countDocuments(query);
    const stats = await TimeEntry.getClientStats(clientId);
    const statsByTask = await TimeEntry.getClientStatsByTask(clientId);

    res.json({
      success: true,
      data: {
        entries: timeEntries,
        stats,
        statsByTask,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת נתוני זמן',
      error: error.message
    });
  }
};

// עדכון entry
exports.updateTimeEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { description, taskType } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const timeEntry = await TimeEntry.findOneAndUpdate(
      { _id: entryId, userId },
      { description, taskType },
      { new: true, runValidators: true }
    );

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'רשומת זמן לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: timeEntry
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון רשומת זמן',
      error: error.message
    });
  }
};

// מחיקת entry
exports.deleteTimeEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const timeEntry = await TimeEntry.findOneAndDelete({
      _id: entryId,
      userId
    });

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'רשומת זמן לא נמצאה'
      });
    }

    res.json({
      success: true,
      message: 'רשומת הזמן נמחקה'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת רשומת זמן',
      error: error.message
    });
  }
};

// הוספה ידנית של זמן
exports.addManualEntry = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startTime, endTime, taskType, description } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'יש לספק זמן התחלה וסיום'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'זמן הסיום חייב להיות אחרי זמן ההתחלה'
      });
    }

    const timeEntry = await TimeEntry.create({
      clientId,
      userId,
      startTime: start,
      endTime: end,
      taskType: taskType || 'general',
      description,
      isRunning: false
    });

    res.status(201).json({
      success: true,
      data: timeEntry
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בהוספת רשומת זמן',
      error: error.message
    });
  }
};


