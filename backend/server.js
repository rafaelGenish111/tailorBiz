require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/database');

// שירותים שרצים רק בשרת רגיל ולא ב-Serverless
const reminderService = require('./src/services/reminderService');
const leadNurturingService = require('./src/services/leadNurturingService');
const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1';

// חיבור למסד נתונים
connectDB().then(() => {
  console.log('✅ MongoDB connected.');
  
  // אם אנחנו לא ב-Vercel, נפעיל את השרת ואת שירותי הרקע כרגיל
  if (!IS_VERCEL) {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      
      // הפעלת שירותים ברקע (רק בשרת רגיל/מקומי)
      if (process.env.ENABLE_REMINDERS === 'true') reminderService.startAllReminders();
      if (process.env.ENABLE_LEAD_NURTURING === 'true') leadNurturingService.start();
      initializeAutomationEngine().catch(console.error);
    });

    // Graceful shutdown - SIGTERM
    process.on('SIGTERM', () => {
      console.log('⛔ SIGTERM received. Closing server and stopping services...');
      reminderService.stopAllReminders();
      leadNurturingService.stop();
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
        mongoose.connection.close(false, () => process.exit(1));
      });
    });
  }
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err);
  if (!IS_VERCEL) {
    process.exit(1);
  }
});

// ייצוא האפליקציה עבור Vercel
module.exports = app;

