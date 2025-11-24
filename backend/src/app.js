const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const reminderService = require('./services/reminderService');

// Import routes
const testimonialRoutes = require('./routes/testimonials.routes');
const clientRoutes = require('./routes/clients.routes');
const invoiceRoutes = require('./routes/invoices.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const taskManagerRoutes = require('./routes/taskManagerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const leadNurturingRoutes = require('./routes/leadNurturingRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
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

// נתיב לבדיקה ידנית של אוטומציות
app.get('/api/test/run-reminders', async (req, res) => {
  try {
    console.log('🧪 Running manual reminder check...');
    await reminderService.runManualCheck();
    res.json({
      success: true,
      message: 'Manual check completed. Check server logs for details.',
    });
  } catch (error) {
    console.error('Error running manual reminder check:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// סטטוס אוטומציות
app.get('/api/automation/status', (req, res) => {
  const jobs = reminderService.jobs || [];

  res.json({
    success: true,
    data: {
      active: jobs.length > 0,
      jobCount: jobs.length,
      jobs: [
        { name: 'Daily Checks', schedule: '9:00 AM daily', active: true },
        { name: 'Payment Reminders', schedule: '8:00 AM daily', active: true },
        { name: 'Urgent Tasks Check', schedule: 'Every hour', active: true },
        { name: 'Daily Summary', schedule: '6:00 PM daily', active: true },
      ],
    },
  });
});

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



