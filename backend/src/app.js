const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
// Parse Server - רק אם לא ב-Vercel (conditional import כדי למנוע בעיות עם PostgreSQL adapter)
let ParseServer = null;
if (process.env.VERCEL !== '1') {
  try {
    ParseServer = require('parse-server').ParseServer;
  } catch (e) {
    console.warn('⚠️ Parse Server not available:', e.message);
  }
}

// Import routes
const testimonialRoutes = require('./routes/testimonials.routes');
const clientRoutes = require('./routes/clients.routes');
const invoiceRoutes = require('./routes/invoices.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const taskManagerRoutes = require('./routes/taskManagerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const leadNurturingRoutes = require('./routes/leadNurturingRoutes');
const marketingRoutes = require('./routes/marketing');
const aiBotRoutes = require('./routes/aiBotRoutes');
const publicChatRoutes = require('./routes/publicChatRoutes');
const testRoutes = require('./routes/testRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const huntingPoolRoutes = require('./routes/huntingPoolRoutes');
const referrerPartnersRoutes = require('./routes/referrerPartnersRoutes');
const authRoutes = require('./routes/authRoutes');
const publicCmsRoutes = require('./routes/publicCmsRoutes');
const adminPagesRoutes = require('./routes/adminPagesRoutes');
const adminArticlesRoutes = require('./routes/adminArticlesRoutes');
const adminClientsRoutes = require('./routes/adminClientsRoutes');
const adminUploadsRoutes = require('./routes/adminUploadsRoutes');
const adminSiteSettingsRoutes = require('./routes/adminSiteSettingsRoutes');
const adminUsersRoutes = require('./routes/adminUsersRoutes');

// אנו עוטפים את הכל בפונקציה אסינכרונית כדי לאפשר ל-Parse לעלות לפני שהאפליקציה מוכנה
async function createApp() {
  const app = express();
  const isDev = process.env.NODE_ENV === 'development';
  const IS_VERCEL = process.env.VERCEL === '1';

  // --- Parse Server Setup (חייב לקרות לפני הכל) ---
  // משביתים את Parse Server ב-Vercel כי הוא לא נחוץ וגורם לבעיות עם PostgreSQL adapter
  let parseServer = null;

  // רק אם לא ב-Vercel ו-ParseServer זמין, נפעיל את Parse Server (אם נחוץ בפיתוח מקומי)
  if (!IS_VERCEL && ParseServer) {
    const mongoUri = process.env.DATABASE_URI || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev';

    // רק אם יש MongoDB URI, נפעיל את Parse Server
    if (mongoUri && mongoUri.startsWith('mongodb')) {
      try {
        // בדיקה אם קובץ cloud code קיים
        const cloudCodePath = process.env.CLOUD_CODE_MAIN || path.join(__dirname, 'cloud', 'main.js');
        const fs = require('fs');
        const cloudCodeExists = fs.existsSync(cloudCodePath);

        const parseConfig = {
          databaseURI: mongoUri,
          appId: process.env.APP_ID || 'myAppId',
          masterKey: process.env.MASTER_KEY || 'myMasterKey', // Keep this key secret!
          serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
          // הגדרות אבטחה נוספות
          allowClientClassCreation: false,
          enforcePrivateUsers: true,
        };

        // רק אם קובץ cloud code קיים, נוסיף אותו
        if (cloudCodeExists) {
          parseConfig.cloud = cloudCodePath;
        }

        parseServer = new ParseServer(parseConfig);

        // הפעלת Parse (החלק האסינכרוני)
        await parseServer.start();
        console.log('✅ Parse Server started');
      } catch (parseError) {
        console.error('⚠️ Parse Server failed to start:', parseError.message);
        console.error('Parse Server error stack:', parseError.stack);
        // לא נכשל את כל האפליקציה אם Parse Server נכשל
        parseServer = null;
      }
    } else {
      console.log('⚠️ Parse Server skipped - no MongoDB URI or not MongoDB URI format');
    }
  } else {
    if (IS_VERCEL) {
      console.log('⚠️ Parse Server disabled in Vercel (not needed and causes PostgreSQL adapter issues)');
    } else if (!ParseServer) {
      console.log('⚠️ Parse Server not available');
    }
  }

  // הרכבת Parse על נתיב ספציפי *לפני* Body Parsers גלובליים
  // זה פותר בעיות עם העלאת קבצים ב-Parse
  if (parseServer) {
    app.use('/parse', parseServer.app);
  }

  // --- הגדרות Express רגילות ---

  if (IS_VERCEL) {
    app.set('trust proxy', 1);
  }

  // CORS - הגדרה מרכזית שתעבוד גם בשגיאות
  // Support dynamic frontend URL via environment variable
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [
    'https://tailorbiz-software.com',
    'https://www.tailorbiz-software.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

  // Add FRONTEND_URL to allowed origins if provided
  if (frontendUrl) {
    // Support both with and without trailing slash
    const normalizedUrl = frontendUrl.replace(/\/$/, '');
    if (!allowedOrigins.includes(normalizedUrl)) {
      allowedOrigins.push(normalizedUrl);
    }
    // Also add www variant if it's a production URL
    if (normalizedUrl.startsWith('https://') && !normalizedUrl.includes('www.')) {
      const wwwVariant = normalizedUrl.replace('https://', 'https://www.');
      if (!allowedOrigins.includes(wwwVariant)) {
        allowedOrigins.push(wwwVariant);
      }
    }
  }

  const setCorsHeaders = (req, res) => {
    const origin = req.headers.origin;
    // תמיד להגדיר CORS headers, גם אם אין origin (למקרה של preflight)
    if (origin) {
      if (allowedOrigins.includes(origin) || isDev) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
      } else if (!isDev) {
        // בפרודקשן, רק origins מורשים - אבל נגדיר את הראשון כדי שלא תהיה שגיאת CORS
        res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
      }
    } else if (!isDev) {
      // אם אין origin בפרודקשן, נגדיר את הראשון
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-Session-Token');
  };

  // CORS middleware - לפני כל דבר אחר
  app.use((req, res, next) => {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      frameguard: false
    })
  );

  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
  });

  // Wrapper לכל ה-responses כדי לוודא ש-CORS headers תמיד נשלחים
  // זה חשוב כי controllers מחזירים שגיאות ישירות עם res.status().json()
  const originalSend = express.response.send;
  const originalJson = express.response.json;
  const originalStatus = express.response.status;

  // Override send כדי לוודא ש-CORS headers תמיד נשלחים
  express.response.send = function (body) {
    setCorsHeaders(this.req, this);
    return originalSend.call(this, body);
  };

  // Override json כדי לוודא ש-CORS headers תמיד נשלחים
  express.response.json = function (body) {
    setCorsHeaders(this.req, this);
    return originalJson.call(this, body);
  };

  // Override status כדי לוודא ש-CORS headers תמיד נשלחים
  express.response.status = function (code) {
    setCorsHeaders(this.req, this);
    const statusResponse = originalStatus.call(this, code);
    // Override גם את ה-json של ה-status response
    const originalStatusJson = statusResponse.json;
    statusResponse.json = function (body) {
      setCorsHeaders(this.req, this);
      return originalJson.call(this, body);
    };
    // Override גם את ה-send של ה-status response
    const originalStatusSend = statusResponse.send;
    statusResponse.send = function (body) {
      setCorsHeaders(this.req, this);
      return originalSend.call(this, body);
    };
    return statusResponse;
  };

  // Rate Limiting - limiter כללי עם הגבלות גבוהות
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 2000 : 1000,
    message: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate Limiting עבור auth endpoints - הגבלות גבוהות יותר כדי למנוע חסימה בטעות
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: isDev ? 500 : 200, // הגבלות גבוהות מאוד במצב פיתוח כדי למנוע חסימה בטעות
    message: 'יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // לא לספור בקשות מוצלחות
    skip: (req) => {
      // במצב פיתוח, לדלג על rate limiting עבור bootstrap-needed
      return isDev && req.path === '/bootstrap-needed';
    },
  });

  // מחילים את ה-auth limiter על auth endpoints לפני ה-limiter הכללי
  app.use('/api/auth', authLimiter);

  // מחילים את ה-Limiter הכללי על שאר ה-API, לא על Parse (ל-Parse יש הגנות משלו אם רוצים)
  app.use('/api/', limiter);

  // Body parser - מגיע אחרי Parse!
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // --- Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/tasks', taskManagerRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/lead-nurturing', leadNurturingRoutes);
  app.use('/api/marketing', marketingRoutes);
  app.use('/api/ai-bots', aiBotRoutes);
  app.use('/api/time-entries', timeEntryRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/quotes', quoteRoutes);
  app.use('/api/hunting-pools', huntingPoolRoutes);
  app.use('/api/referrer-partners', referrerPartnersRoutes);
  app.use('/api/public', publicCmsRoutes);
  app.use('/api/public/chat', publicChatRoutes);
  app.use('/api/admin/pages', adminPagesRoutes);
  app.use('/api/admin/articles', adminArticlesRoutes);
  app.use('/api/admin/clients', adminClientsRoutes);
  app.use('/api/admin/uploads', adminUploadsRoutes);
  app.use('/api/admin/site-settings', adminSiteSettingsRoutes);
  app.use('/api/admin/users', adminUsersRoutes);

  if (process.env.NODE_ENV === 'development') {
    app.use('/api/test', testRoutes);

    // --- WhatsApp debug endpoints (DEV only) ---
    // מאפשר לראות סטטוס/QR בדפדפן בלי התחברות (נוח לפיתוח מקומי בלבד)
    app.get('/api/dev/whatsapp/status', async (req, res) => {
      try {
        const whatsappService = require('./services/whatsappService');
        const status = await whatsappService.getStatus();
        return res.json({ success: true, data: status });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'שגיאה בבדיקת סטטוס WhatsApp', error: error.message });
      }
    });

    app.get('/api/dev/whatsapp/qr.svg', async (req, res) => {
      try {
        const whatsappService = require('./services/whatsappService');
        const QRCode = require('qrcode');
        const qr = await whatsappService.getQr();
        if (qr.connected) return res.status(204).send();
        if (!qr.qr) {
          return res.status(404).json({ success: false, message: 'אין QR זמין כרגע' });
        }
        const svg = await QRCode.toString(qr.qr, { type: 'svg', margin: 1, scale: 6 });
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        return res.status(200).send(svg);
      } catch (error) {
        return res.status(500).json({ success: false, message: 'שגיאה ביצירת QR (SVG)', error: error.message });
      }
    });

    // Force restart WhatsApp service (DEV only)
    app.post('/api/dev/whatsapp/restart', async (req, res) => {
      try {
        const whatsappService = require('./services/whatsappService');
        const result = await whatsappService.restart({ resetSession: false });
        return res.json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'שגיאה ב-restart ל-WhatsApp', error: error.message });
      }
    });

    // Force reset session + restart (DEV only) - ייצור QR חדש
    app.post('/api/dev/whatsapp/reset', async (req, res) => {
      try {
        const whatsappService = require('./services/whatsappService');
        const result = await whatsappService.restart({ resetSession: true });
        return res.json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'שגיאה ב-reset ל-WhatsApp', error: error.message });
      }
    });

    app.get('/api/automation/status', async (req, res) => {
      try {
        const reminderService = require('./services/reminderService');
        const leadNurturingService = require('./services/leadServiceV2');

        res.json({
          success: true,
          data: {
            reminderService: {
              active: reminderService.jobs && reminderService.jobs.length > 0,
              jobCount: reminderService.jobs ? reminderService.jobs.length : 0
            },
            leadNurturingService: {
              active: leadNurturingService.jobs && leadNurturingService.jobs.length > 0,
              jobCount: leadNurturingService.jobs ? leadNurturingService.jobs.length : 0
            }
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use((err, req, res, next) => {
    // Keep CORS headers - critical for frontend!
    setCorsHeaders(req, res);
    // Pass to our error handler
    errorHandler(err, req, res, next);
  });

  return app;
}

module.exports = createApp;