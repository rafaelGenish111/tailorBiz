require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

// שירותים שרצים רק בשרת רגיל
const reminderService = require('./src/services/reminderService');
const leadNurturingService = require('./src/services/leadNurturingService');
const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1';

console.log(`[System] Starting... VERCEL=${IS_VERCEL}, NODE_ENV=${process.env.NODE_ENV}`);

if (!IS_VERCEL) {
  // --- מצב פיתוח מקומי ---
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
    // בדיקת משתני סביבה קריטיים
    if (!process.env.MONGO_URI) {
      throw new Error('CRITICAL: MONGO_URI is missing!');
    }

    console.log('[Vercel] Connecting to DB...');
    await connectDB();
    console.log('[Vercel] DB Connected. Passing to Express app...');
    
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


