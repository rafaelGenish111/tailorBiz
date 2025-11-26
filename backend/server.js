require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const reminderService = require('./src/services/reminderService');
const leadNurturingService = require('./src/services/leadNurturingService');
const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

const PORT = process.env.PORT || 5000;

// Connect to database and start server only after successful connection
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected, starting server...');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);

      // הפעלת שירות התזכורות (אם מופעל ב-.env)
      if (process.env.ENABLE_REMINDERS === 'true') {
        reminderService.startAllReminders();
      }

      // הפעלת שירות טיפוח לידים (אם מופעל ב-.env)
      if (process.env.ENABLE_LEAD_NURTURING === 'true') {
        leadNurturingService.start();
      }

      // הפעלת מנוע האוטומציה השיווקית (אם מופעל ב-.env)
      if (process.env.ENABLE_MARKETING_AUTOMATION === 'true' || process.env.ENABLE_MARKETING_AUTOMATION !== 'false') {
        initializeAutomationEngine()
          .then(() => {
            console.log('✅ Marketing automation engine initialized');
          })
          .catch((err) => {
            console.error('❌ Failed to initialize marketing automation engine:', err);
          });
      }
    });

    // Graceful shutdown - SIGTERM
    process.on('SIGTERM', () => {
      console.log('⛔ SIGTERM received. Closing server and stopping services...');
      reminderService.stopAllReminders();
      leadNurturingService.stop();
      // Note: automation engine cron jobs will stop automatically when process exits
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('🔌 MongoDB connection closed.');
          process.exit(0);
        });
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => {
        reminderService.stopAllReminders();
        leadNurturingService.stop();
        // Note: automation engine cron jobs will stop automatically when process exits
        mongoose.connection.close(false, () => process.exit(1));
      });
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });

