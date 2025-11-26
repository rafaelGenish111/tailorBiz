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
const notificationRoutes = require('./routes/notificationRoutes');
const leadNurturingRoutes = require('./routes/leadNurturingRoutes');
const marketingRoutes = require('./routes/marketing');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // בפיתוח, אפשר כל localhost ports
    if (process.env.NODE_ENV === 'development') {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, true); // בפיתוח, אפשר הכל
      }
    } else {
      // ב-production, השתמש ב-CLIENT_URL
      const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/lead-nurturing', leadNurturingRoutes);
app.use('/api/marketing', marketingRoutes);

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



