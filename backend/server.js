require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const reminderService = require('./src/services/reminderService');
const leadNurturingService = require('./src/services/leadNurturingService');

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
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });

