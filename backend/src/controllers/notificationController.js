// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// קבלת כל ההתראות
exports.getAllNotifications = async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;

    // בדיקה אם userId תקין
    if (!isValidObjectId(req.user.id)) {
      return res.json({
        success: true,
        data: [],
        unreadCount: 0
      });
    }

    let query = { userId: req.user.id };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error in getAllNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ההתראות',
      error: error.message
    });
  }
};

// סימון התראה כנקראה
exports.markAsRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'התראה לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון ההתראה',
      error: error.message
    });
  }
};

// סימון כל ההתראות כנקראו
exports.markAllAsRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'כל ההתראות סומנו כנקראו'
    });

  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון ההתראות',
      error: error.message
    });
  }
};

// מחיקת התראה
exports.deleteNotification = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'התראה לא נמצאה'
      });
    }

    res.json({
      success: true,
      message: 'התראה נמחקה בהצלחה'
    });

  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת ההתראה',
      error: error.message
    });
  }
};

module.exports = exports;

