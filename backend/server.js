require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1';

console.log(`[System] Starting... VERCEL=${IS_VERCEL}, NODE_ENV=${process.env.NODE_ENV}`);

if (!IS_VERCEL) {
  // --- מצב פיתוח מקומי ---
  // טוענים את השירותים רק כאן, לא ב-Vercel
  const reminderService = require('./src/services/reminderService');
  const leadNurturingService = require('./src/services/leadNurturingService');
  const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
      if (process.env.ENABLE_REMINDERS === 'true') reminderService.startAllReminders();
      if (process.env.ENABLE_LEAD_NURTURING === 'true') leadNurturingService.start();
      initializeAutomationEngine().catch(console.error);
    });
  }).catch(err => {
    console.error('❌ Local Server Error:', err);
  });
}

// --- מצב Vercel Serverless ---
module.exports = async (req, res) => {
  console.log(`[Vercel] Incoming request: ${req.method} ${req.url}`);
  
  try {
    const hasMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!hasMongoUri) {
      throw new Error('CRITICAL: MONGO_URI / MONGODB_URI is missing!');
    }

    await connectDB();
    return app(req, res);
    
  } catch (error) {
    console.error('❌ [Vercel] Critical Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stage: 'DB Connection or Init'
    });
  }
};
