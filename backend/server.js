require('dotenv').config();
const createApp = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5001;
const IS_VERCEL = process.env.VERCEL === '1';

console.log(`[System] Starting... VERCEL=${IS_VERCEL}, NODE_ENV=${process.env.NODE_ENV}`);

// Cache את ה-app instance עבור Vercel
let appInstance = null;

if (!IS_VERCEL) {
  // --- מצב פיתוח מקומי ---
  // טוענים את השירותים רק כאן, לא ב-Vercel
  const reminderService = require('./src/services/reminderService');
  const leadNurturingService = require('./src/services/leadServiceV2');
  const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');
  const automationOrchestrator = require('./src/services/automationOrchestrator');
  const triggerHandler = require('./src/services/triggerHandler');
  const AIBotConfig = require('./src/models/AIBotConfig');

  connectDB().then(async () => {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
      if (process.env.ENABLE_REMINDERS === 'true') reminderService.startAllReminders();
      if (process.env.ENABLE_LEAD_NURTURING === 'true') leadNurturingService.start();
      initializeAutomationEngine().catch(console.error);

      // אתחול AutomationOrchestrator & TriggerHandler
      if (process.env.ENABLE_AI_BOT !== 'false') {
        automationOrchestrator.initialize()
          .then(() => {
            console.log('✅ AutomationOrchestrator initialized');
            return triggerHandler.initialize();
          })
          .then(() => {
            console.log('✅ TriggerHandler initialized');
            // יצירת Default Bot אם לא קיים
            return AIBotConfig.ensureDefaultBot();
          })
          .then(() => {
            console.log('✅ AI Bot system ready');
          })
          .catch(err => {
            console.error('❌ AI Bot system initialization failed:', err.message);
          });
      }

      // אתחול WhatsApp Service
      const whatsappService = require('./src/services/whatsappService');
      // אפשר להשבית עם ENABLE_WHATSAPP=false
      if (process.env.ENABLE_WHATSAPP !== 'false') {
        // ננסה לאתחל, אבל לא נכשל את השרת אם זה נכשל
        setTimeout(() => {
          try {
            whatsappService.initialize();
          } catch (err) {
            console.warn('⚠️ WhatsApp Service initialization failed:', err.message);
            console.warn('⚠️ WhatsApp will retry automatically when connection is available');
          }
        }, 2000); // המתנה קצרה כדי לא להפריע לאתחול השרת
      }
    });
  }).catch(err => {
    console.error('❌ Local Server Error:', err);
  });
}

// --- מצב Vercel Serverless ---
module.exports = async (req, res) => {
  console.log(`[Vercel] Incoming request: ${req.method} ${req.url}`);
  console.log(`[Vercel] Request path: ${req.url}`);
  console.log(`[Vercel] Request query:`, req.query);

  // הגדרת CORS headers מיד בתחילת ה-handler - לפני כל דבר אחר!
  // ב-Vercel serverless functions, צריך להשתמש ב-setHeader במקום header
  // Support dynamic frontend URL via environment variable
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [
    'https://tailorbiz-software.com',
    'https://www.tailorbiz-software.com',
    'https://tailorbiz-frontend-stage.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

  // Add FRONTEND_URL to allowed origins if provided
  if (frontendUrl) {
    const normalizedUrl = frontendUrl.replace(/\/$/, '');
    if (!allowedOrigins.includes(normalizedUrl)) {
      allowedOrigins.push(normalizedUrl);
    }
    // Also add www variant if it's a production URL
    if (normalizedUrl.startsWith('https://') && !normalizedUrl.includes('www.')) {
      const wwwVariant = normalizedUrl.replace('https://', 'https://www.');
      if (!allowedOrigins.includes(wwwVariant)) {
        allowedOrigins.push(wwwVariant);
      }
    }
  }

  const origin = req.headers?.origin || req.headers?.['origin'];
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (origin) {
    // אם origin לא ברשימה, נגדיר את הראשון כדי שלא תהיה שגיאת CORS
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  } else {
    // אם אין origin, נגדיר את הראשון
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-Session-Token');

  // טיפול ב-preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // בדיקה של environment variables
    const hasMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!hasMongoUri) {
      console.error('❌ [Vercel] MONGO_URI / MONGODB_URI is missing!');
      // CORS headers כבר מוגדרים בתחילת ה-handler
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: 'MONGO_URI / MONGODB_URI is missing!',
        stage: 'Environment Variables'
      }));
      return;
    }

    // חיבור ל-MongoDB
    await connectDB();

    // יצירת/שימוש ב-app instance (cache כדי לא ליצור אותו מחדש בכל request)
    if (!appInstance) {
      console.log('[Vercel] Creating app instance...');
      appInstance = await createApp();
      console.log('[Vercel] App instance created');
    }

    console.log('[Vercel] Handling request with Express app...');
    return appInstance(req, res);

  } catch (error) {
    console.error('❌ [Vercel] Critical Error:', error);
    console.error('Error stack:', error.stack);

    // CORS headers כבר מוגדרים בתחילת ה-handler, אז לא צריך להגדיר אותם שוב
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    const errorResponse = {
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      stage: 'DB Connection or Init'
    };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    res.end(JSON.stringify(errorResponse));
    return;
  }
};
