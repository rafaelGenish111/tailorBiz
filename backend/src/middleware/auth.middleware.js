const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'tb_auth';

const readTokenFromRequest = (req) => {
  // 1) Cookie (מועדף)
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // 2) Authorization: Bearer (fallback)
  const hdr = req.headers?.authorization || req.headers?.Authorization;
  if (typeof hdr === 'string' && hdr.toLowerCase().startsWith('bearer ')) {
    return hdr.slice(7).trim();
  }
  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = readTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET לא מוגדר בשרת' });
    }

    const payload = jwt.verify(token, secret);
    const userId = payload?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'טוקן לא תקין' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'משתמש לא נמצא' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'המשתמש לא פעיל' });
    }

    // פסילת טוקנים אחרי שינוי סיסמה
    const tokenVersion = payload?.tokenVersion ?? 0;
    if ((user.tokenVersion || 0) !== tokenVersion) {
      return res.status(401).json({ success: false, message: 'פג תוקף ההתחברות, יש להתחבר מחדש' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'התחברות לא תקינה', error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }
    if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
    if (!roles || roles.length === 0) return next();
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: 'אין הרשאה' });
  };
};

const requireModule = (moduleKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }
    if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
    const perm = req.user.permissions?.[moduleKey];
    if (perm?.enabled) return next();
    return res.status(403).json({ success: false, message: 'אין הרשאה למודול זה' });
  };
};

const requireAnyModule = (moduleKeys) => {
  const keys = Array.isArray(moduleKeys) ? moduleKeys : [];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'לא מחובר' });
    }
    if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
    for (const k of keys) {
      const perm = req.user.permissions?.[k];
      if (perm?.enabled) return next();
    }
    return res.status(403).json({ success: false, message: 'אין הרשאה למודול זה' });
  };
};

module.exports = { protect, authorize, requireModule, requireAnyModule };




