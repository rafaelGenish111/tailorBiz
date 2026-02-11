const TimeEntry = require('../models/TimeEntry');
const mongoose = require('mongoose');

/**
 * GET /api/time-entries/active
 * מחזיר את הטיימר הפעיל של המשתמש המחובר
 */
const getActive = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }

    const active = await TimeEntry.findOne({ userId, isRunning: true })
      .sort({ startTime: -1 })
      .populate('clientId', 'personalInfo businessInfo')
      .lean();

    if (!active) {
      return res.json({ success: true, data: null });
    }

    const out = {
      ...active,
      clientId: active.clientId?._id || active.clientId
    };
    return res.json({ success: true, data: out });
  } catch (error) {
    console.error('getActive error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בקבלת הטיימר הפעיל' });
  }
};

/**
 * POST /api/time-entries/client/:clientId/start
 * התחלת טיימר חדש ללקוח
 */
const start = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { clientId } = req.params;
    const { taskType = 'general', description = '' } = req.body || {};

    if (!userId || !clientId) {
      return res.status(400).json({ success: false, message: 'חסרים פרטים' });
    }

    // עצור טיימר פעיל קודם אם יש
    await TimeEntry.updateMany(
      { userId, isRunning: true },
      { $set: { isRunning: false, endTime: new Date() } }
    );

    const entry = new TimeEntry({
      clientId,
      userId,
      startTime: new Date(),
      taskType,
      description,
      isRunning: true
    });
    await entry.save();

    const result = await TimeEntry.findById(entry._id)
      .populate('clientId', 'personalInfo businessInfo')
      .lean();

    const out = {
      ...result,
      clientId: result.clientId?._id || result.clientId
    };
    return res.json({ success: true, data: out });
  } catch (error) {
    console.error('start error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהפעלת הטיימר' });
  }
};

/**
 * PUT /api/time-entries/:entryId/stop
 * עצירת טיימר
 */
const stop = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { entryId } = req.params;

    if (!userId || !entryId) {
      return res.status(400).json({ success: false, message: 'חסרים פרטים' });
    }

    const entry = await TimeEntry.findOne({ _id: entryId, userId, isRunning: true });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'טיימר פעיל לא נמצא' });
    }

    entry.endTime = new Date();
    entry.isRunning = false;
    if (entry.endTime && entry.startTime) {
      entry.duration = Math.floor((entry.endTime - entry.startTime) / 1000);
    }
    await entry.save();

    return res.json({ success: true, data: entry });
  } catch (error) {
    console.error('stop error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעצירת הטיימר' });
  }
};

/**
 * GET /api/time-entries/client/:clientId
 * רשימת רשומות זמן + סטטיסטיקות ללקוח
 */
const getClientEntries = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category, page = 1, limit = 50 } = req.query || {};

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ success: false, message: 'מזהה לקוח לא תקין' });
    }

    const stats = await TimeEntry.getClientStats(clientId);
    const statsByTask = await TimeEntry.getClientStatsByTask(clientId);

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, parseInt(limit, 10) || 50);
    const entries = await TimeEntry.find({ clientId })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Math.min(100, parseInt(limit, 10) || 50))
      .lean();

    return res.json({
      success: true,
      data: {
        entries,
        stats,
        statsByTask,
        pagination: {
          page: parseInt(page, 10) || 1,
          limit: Math.min(100, parseInt(limit, 10) || 50),
          total: await TimeEntry.countDocuments({ clientId })
        }
      }
    });
  } catch (error) {
    console.error('getClientEntries error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת רשומות' });
  }
};

/**
 * POST /api/time-entries/client/:clientId/manual
 * הוספת רשומת זמן ידנית
 */
const addManual = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { clientId } = req.params;
    const { startTime, endTime, taskType = 'general', description = '' } = req.body || {};

    if (!userId || !clientId) {
      return res.status(400).json({ success: false, message: 'חסרים פרטים' });
    }

    const st = startTime ? new Date(startTime) : new Date();
    const et = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((et - st) / 1000);

    const entry = new TimeEntry({
      clientId,
      userId,
      startTime: st,
      endTime: et,
      duration,
      taskType,
      description,
      isRunning: false
    });
    await entry.save();

    return res.json({ success: true, data: entry });
  } catch (error) {
    console.error('addManual error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהוספת רשומה' });
  }
};

/**
 * PUT /api/time-entries/:entryId
 * עדכון רשומת זמן
 */
const update = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { entryId } = req.params;
    const body = req.body || {};

    const entry = await TimeEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'רשומה לא נמצאה' });
    }

    if (body.startTime) entry.startTime = new Date(body.startTime);
    if (body.endTime) entry.endTime = new Date(body.endTime);
    if (body.taskType) entry.taskType = body.taskType;
    if (body.description !== undefined) entry.description = body.description;

    if (entry.endTime && entry.startTime) {
      entry.duration = Math.floor((entry.endTime - entry.startTime) / 1000);
    }
    await entry.save();

    return res.json({ success: true, data: entry });
  } catch (error) {
    console.error('update error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון' });
  }
};

/**
 * DELETE /api/time-entries/:entryId
 * מחיקת רשומת זמן
 */
const remove = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { entryId } = req.params;

    const entry = await TimeEntry.findOneAndDelete({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'רשומה לא נמצאה' });
    }

    return res.json({ success: true, data: { _id: entryId } });
  } catch (error) {
    console.error('remove error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקה' });
  }
};

module.exports = {
  getActive,
  start,
  stop,
  getClientEntries,
  addManual,
  update,
  remove
};
