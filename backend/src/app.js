const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const { ParseServer } = require('parse-server'); // 1. ייבוא Parse

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
  const parseServer = new ParseServer({
    databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || 'myMasterKey', // Keep this key secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
    // הגדרות אבטחה נוספות
    allowClientClassCreation: false,
    enforcePrivateUsers: true,
  });

  // הפעלת Parse (החלק האסינכרוני)
  await parseServer.start();

  // הרכבת Parse על נתיב ספציפי *לפני* Body Parsers גלובליים
  // זה פותר בעיות עם העלאת קבצים ב-Parse
  app.use('/parse', parseServer.app);

  // --- הגדרות Express רגילות ---

  if (IS_VERCEL) {
    app.set('trust proxy', 1);
  }

  // CORS - הגדרה מרכזית שתעבוד גם בשגיאות
  const allowedOrigins = [
    'https://tailorbiz-software.com',
    'https://www.tailorbiz-software.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

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

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 2000 : 1000,
    message: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // מחילים את ה-Limiter רק על ה-API שלנו, לא על Parse (ל-Parse יש הגנות משלו אם רוצים)
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
  app.use('/api/time-entries', timeEntryRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/quotes', quoteRoutes);
  app.use('/api/hunting-pools', huntingPoolRoutes);
  app.use('/api/referrer-partners', referrerPartnersRoutes);
  app.use('/api/public', publicCmsRoutes);
  app.use('/api/admin/pages', adminPagesRoutes);
  app.use('/api/admin/articles', adminArticlesRoutes);
  app.use('/api/admin/clients', adminClientsRoutes);
  app.use('/api/admin/uploads', adminUploadsRoutes);
  app.use('/api/admin/site-settings', adminSiteSettingsRoutes);
  app.use('/api/admin/users', adminUsersRoutes);

  if (process.env.NODE_ENV === 'development') {
    app.use('/api/test', testRoutes);

    app.get('/api/automation/status', async (req, res) => {
      try {
        const reminderService = require('./services/reminderService');
        const leadNurturingService = require('./services/leadNurturingService');

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

  // Error handler - חייב להגדיר CORS headers גם בשגיאות
  app.use((err, req, res, next) => {
    // הגדרת CORS headers גם בשגיאות - חשוב מאוד!
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://tailorbiz-software.com',
      'https://www.tailorbiz-software.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    if (origin) {
      if (allowedOrigins.includes(origin) || isDev) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
      } else if (!isDev) {
        res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
      }
    } else if (!isDev) {
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-Session-Token');

    console.error('Error:', err.stack);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'שגיאת שרת',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return app;
}

module.exports = createApp;