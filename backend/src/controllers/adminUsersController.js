const User = require('../models/User');

const sanitizePermissions = (p) => {
  const safe = {};
  const keys = ['clients', 'leads', 'tasks_calendar', 'marketing', 'cms', 'invoices_docs', 'settings'];
  keys.forEach((k) => {
    const src = p?.[k] || {};
    safe[k] = {
      enabled: Boolean(src.enabled),
      viewAll: Boolean(src.viewAll)
    };
  });
  return safe;
};

exports.list = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash')
      .sort('role username');
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in adminUsers list:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת משתמשים', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, password, role, permissions, isActive } = req.body || {};
    const u = String(username || '').trim().toLowerCase();
    const p = String(password || '');
    const r = role === 'super_admin' ? 'super_admin' : role === 'admin' ? 'admin' : 'employee';

    if (!u || u.length < 3) {
      return res.status(400).json({ success: false, message: 'שם משתמש קצר מדי' });
    }
    if (!p || p.length < 8) {
      return res.status(400).json({ success: false, message: 'סיסמה חייבת להיות לפחות 8 תווים' });
    }

    const exists = await User.findOne({ username: u });
    if (exists) {
      return res.status(400).json({ success: false, message: 'שם משתמש כבר קיים' });
    }

    const user = new User({
      username: u,
      role: r,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      permissions: sanitizePermissions(permissions)
    });
    await user.setPassword(p);
    await user.save();

    return res.status(201).json({ success: true, data: user.toSafeJSON() });
  } catch (error) {
    console.error('Error in adminUsers create:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת עובד', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, permissions, isActive, role } = req.body || {};

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });
    }

    if (typeof username === 'string') {
      const u = username.trim().toLowerCase();
      if (!u || u.length < 3) {
        return res.status(400).json({ success: false, message: 'שם משתמש קצר מדי' });
      }
      const exists = await User.findOne({ username: u, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'שם משתמש כבר קיים' });
      }
      user.username = u;
    }

    if (role === 'admin' || role === 'super_admin' || role === 'employee') {
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    if (permissions && typeof permissions === 'object') {
      user.permissions = sanitizePermissions(permissions);
    }

    await user.save();
    return res.json({ success: true, data: user.toSafeJSON() });
  } catch (error) {
    console.error('Error in adminUsers update:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון עובד', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    const p = String(newPassword || '');
    if (!p || p.length < 8) {
      return res.status(400).json({ success: false, message: 'סיסמה חדשה חייבת להיות לפחות 8 תווים' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });
    }

    await user.setPassword(p);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return res.json({ success: true });
  } catch (error) {
    console.error('Error in adminUsers resetPassword:', error);
    return res.status(500).json({ success: false, message: 'שגיאה באיפוס סיסמה', error: error.message });
  }
};

