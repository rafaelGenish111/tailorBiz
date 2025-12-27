require('dotenv').config();
const createApp = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1';

console.log(`[System] Starting... VERCEL=${IS_VERCEL}, NODE_ENV=${process.env.NODE_ENV}`);

// Cache את ה-app instance עבור Vercel
let appInstance = null;

if (!IS_VERCEL) {
  // --- מצב פיתוח מקומי ---
  // טוענים את השירותים רק כאן, לא ב-Vercel
  const reminderService = require('./src/services/reminderService');
  const leadNurturingService = require('./src/services/leadNurturingService');
  const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

  connectDB().then(async () => {
    const app = await createApp();
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

  // הגדרת CORS headers מיד בתחילת ה-handler - לפני כל דבר אחר!
  const allowedOrigins = [
    'https://tailorbiz-software.com',
    'https://www.tailorbiz-software.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (origin) {
    // אם origin לא ברשימה, נגדיר את הראשון כדי שלא תהיה שגיאת CORS
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  } else {
    // אם אין origin, נגדיר את הראשון
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-Session-Token');

  // טיפול ב-preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  try {
    // בדיקה של environment variables
    const hasMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!hasMongoUri) {
      console.error('❌ [Vercel] MONGO_URI / MONGODB_URI is missing!');
      // CORS headers כבר מוגדרים בתחילת ה-handler
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'MONGO_URI / MONGODB_URI is missing!',
        stage: 'Environment Variables'
      });
    }

    // חיבור ל-MongoDB
    await connectDB();

    // יצירת/שימוש ב-app instance (cache כדי לא ליצור אותו מחדש בכל request)
    if (!appInstance) {
      appInstance = await createApp();
    }

    return appInstance(req, res);

  } catch (error) {
    console.error('❌ [Vercel] Critical Error:', error);
    console.error('Error stack:', error.stack);

    // CORS headers כבר מוגדרים בתחילת ה-handler, אז לא צריך להגדיר אותם שוב

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      stage: 'DB Connection or Init',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};
