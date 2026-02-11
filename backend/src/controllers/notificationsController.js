const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * רשימת התראות למשתמש המחובר (params: read=true/false)
 */
const getAll = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }

    const query = { userId };
    if (req.query.read === 'true' || req.query.read === true) {
      query.read = true;
    } else if (req.query.read === 'false' || req.query.read === false) {
      query.read = false;
    }

    const items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('notifications getAll error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת התראות' });
  }
};

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'לא מחובר' });

    await Notification.updateOne({ _id: id, userId }, { $set: { read: true, readAt: new Date() } });
    return res.json({ success: true });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה' });
  }
};

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'לא מחובר' });

    await Notification.updateMany({ userId, read: false }, { $set: { read: true, readAt: new Date() } });
    return res.json({ success: true });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה' });
  }
};

/**
 * DELETE /api/notifications/:id
 */
const remove = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'לא מחובר' });

    await Notification.deleteOne({ _id: id, userId });
    return res.json({ success: true });
  } catch (error) {
    console.error('remove notification error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה' });
  }
};

module.exports = { getAll, markAsRead, markAllAsRead, remove };
