require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

// שירותים שרצים רק בשרת רגיל
const reminderService = require('./src/services/reminderService');
const leadNurturingService = require('./src/services/leadNurturingService');
const { initializeAutomationEngine } = require('./src/services/marketing/automationEngine');

const PORT = process.env.PORT || 5000;
// Vercel מגדיר אוטומטית את process.env.VERCEL ל-'1'
const IS_VERCEL = process.env.VERCEL === '1';

if (!IS_VERCEL) {
  // --- מצב פיתוח מקומי / שרת רגיל ---
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
      
      // הפעלת שירותי רקע
      if (process.env.ENABLE_REMINDERS === 'true') reminderService.startAllReminders();
      if (process.env.ENABLE_LEAD_NURTURING === 'true') leadNurturingService.start();
      initializeAutomationEngine().catch(console.error);
    });
  }).catch(err => {
    console.error('❌ Local Server Error:', err);
  });
}

// --- מצב Vercel Serverless ---
// אנחנו מייצאים פונקציה עוטפת שמבטיחה חיבור ל-DB לפני הטיפול בבקשה
module.exports = async (req, res) => {
  try {
    // 1. חיבור ל-DB (משתמש ב-cache, אז זה מהיר בבקשות חוזרות)
    await connectDB();
    
    // 2. העברת הטיפול ל-Express
    return app(req, res);
  } catch (error) {
    console.error('❌ Vercel Function Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Database connection failed' 
    });
  }
};

