const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

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
const publicCmsRoutes = require('./routes/publicCmsRoutes');
const adminPagesRoutes = require('./routes/adminPagesRoutes');
const adminArticlesRoutes = require('./routes/adminArticlesRoutes');
const adminClientsRoutes = require('./routes/adminClientsRoutes');
const adminUploadsRoutes = require('./routes/adminUploadsRoutes');

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const IS_VERCEL = process.env.VERCEL === '1';

// ב-Vercel (מאחורי פרוקסי) חובה להגדיר trust proxy כדי שה-rate limit יזהה IP נכון
if (IS_VERCEL) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(
  helmet({
    // בסביבת פיתוח נבטל CSP וגם X-Frame-Options כדי לאפשר iframe מ-5174 (Vite)
    contentSecurityPolicy: isDev ? false : undefined,
    // אפשר iframe גם ב-production עבור תצוגה מקדימה של מסמכים
    frameguard: false // הסר X-Frame-Options לחלוטין כדי לאפשר תצוגה מקדימה
  })
);

// הסר X-Frame-Options מפורשות עבור כל הבקשות (גם אם Vercel או שירותים אחרים מוסיפים אותו)
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

// CORS configuration
const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  // Production frontend (Vercel env or custom domain)
  process.env.CLIENT_URL,
  process.env.CUSTOM_CLIENT_DOMAIN,
  // Hard-coded fallback for current production domain
  'https://tailorbiz-software.com',
  'https://www.tailorbiz-software.com'
].filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // אפשר בקשות ללא origin (כמו Postman, curl, health checks)
    if (!origin) {
      return callback(null, true);
    }

    // בדוק אם ה-origin מותר ברשימה
    if (allowedOrigins.some(allowed => origin === allowed)) {
      return callback(null, true);
    }

    // אפשר כל localhost (כולל פורטים שונים) בסביבת פיתוח
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // אם יש .vercel.app בדומיין - אפשר (לפריסות preview)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    console.log('[CORS] Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting - יותר מקל גם ב-Production כדי למנוע 429 מהירים מ-Frontend
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // ברירת מחדל חדשה: גבול גבוה גם ב-Production (מתאים למערכת פנימית / עומס נמוך)
  max: isDev ? 2000 : 1000, // Dev: 2000, Prod: 1000
  message: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
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

// Public CMS
app.use('/api/public', publicCmsRoutes);

// Admin CMS
app.use('/api/admin/pages', adminPagesRoutes);
app.use('/api/admin/articles', adminArticlesRoutes);
app.use('/api/admin/clients', adminClientsRoutes);
app.use('/api/admin/uploads', adminUploadsRoutes);

// Test routes (רק ב-development)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);

  // נתיב נוסף לסטטוס אוטומציות (גם ב-production)
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
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'שגיאת שרת',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;



