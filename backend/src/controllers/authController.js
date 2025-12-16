const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'tb_auth';

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // בפרודקשן חובה Secure כדי ש-SameSite=None יעבוד
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
};

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing');
  return jwt.sign(
    { sub: String(user._id), role: user.role, tokenVersion: user.tokenVersion || 0 },
    secret,
    { expiresIn: '30d' }
  );
};

exports.bootstrapNeeded = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    return res.json({ success: true, data: { needed: adminCount === 0 } });
  } catch (error) {
    console.error('Error in bootstrapNeeded:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בבדיקת מצב התקנה', error: error.message });
  }
};

exports.bootstrap = async (req, res) => {
  try {
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'ADMIN_BOOTSTRAP_SECRET לא מוגדר בשרת' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({ success: false, message: 'המערכת כבר הותקנה (קיים אדמין)' });
    }

    const { username, password, bootstrapSecret } = req.body || {};
    if (!bootstrapSecret || bootstrapSecret !== secret) {
      return res.status(403).json({ success: false, message: 'סוד התקנה לא תקין' });
    }

    const u = String(username || '').trim().toLowerCase();
    const p = String(password || '');
    if (!u || u.length < 3) {
      return res.status(400).json({ success: false, message: 'שם משתמש קצר מדי' });
    }
    if (!p || p.length < 8) {
      return res.status(400).json({ success: false, message: 'סיסמה חייבת להיות לפחות 8 תווים' });
    }

    const admin = new User({
      username: u,
      role: 'admin',
      isActive: true,
      permissions: {
        clients: { enabled: true, viewAll: true },
        leads: { enabled: true, viewAll: true },
        tasks_calendar: { enabled: true, viewAll: true },
        marketing: { enabled: true, viewAll: true },
        cms: { enabled: true, viewAll: true },
        invoices_docs: { enabled: true, viewAll: true },
        settings: { enabled: true, viewAll: true }
      }
    });
    await admin.setPassword(p);
    await admin.save();

    const token = signToken(admin);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    return res.status(201).json({ success: true, data: admin.toSafeJSON() });
  } catch (error) {
    console.error('Error in bootstrap:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהתקנה ראשונית', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const u = String(username || '').trim().toLowerCase();
    const p = String(password || '');
    if (!u || !p) {
      return res.status(400).json({ success: false, message: 'חסרים שם משתמש או סיסמה' });
    }

    const user = await User.findOne({ username: u });
    if (!user) {
      return res.status(401).json({ success: false, message: 'פרטי התחברות שגויים' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'המשתמש לא פעיל' });
    }
    const ok = await user.comparePassword(p);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'פרטי התחברות שגויים' });
    }

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    return res.json({ success: true, data: user.toSafeJSON() });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהתחברות', error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
};

exports.me = async (req, res) => {
  return res.json({ success: true, data: req.user?.toSafeJSON ? req.user.toSafeJSON() : req.user });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const cur = String(currentPassword || '');
    const next = String(newPassword || '');
    if (!cur || !next) {
      return res.status(400).json({ success: false, message: 'חסרות סיסמה נוכחית/חדשה' });
    }
    if (next.length < 8) {
      return res.status(400).json({ success: false, message: 'סיסמה חדשה חייבת להיות לפחות 8 תווים' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }

    const ok = await user.comparePassword(cur);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'סיסמה נוכחית שגויה' });
    }

    await user.setPassword(next);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשינוי סיסמה', error: error.message });
  }
};

