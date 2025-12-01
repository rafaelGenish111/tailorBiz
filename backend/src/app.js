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

const app = express();
const isDev = process.env.NODE_ENV === 'development';

// Security middleware
app.use(
  helmet({
    // בסביבת פיתוח נבטל CSP וגם X-Frame-Options כדי לאפשר iframe מ-5174 (Vite)
    contentSecurityPolicy: isDev ? false : undefined,
    frameguard: isDev ? false : undefined
  })
);
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

// Rate limiting - יותר מקל בסביבת פיתוח
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // בסביבת פיתוח: 1000 בקשות, ב-production: 100
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



