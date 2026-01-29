/**
 * 🤖 Simple Bot Tester - שלח הודעה אחת וקבל תשובה
 *
 * שימוש:
 * node test-bot-simple.js "ההודעה שלך כאן"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./src/models/Client');
const AIBotConfig = require('./src/models/AIBotConfig');
const aiBotEngine = require('./src/services/aiBotEngine');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

async function testMessage(message) {
  try {
    console.log(`\n${colors.cyan}🤖 שולח הודעה לבוט...${colors.reset}\n`);

    // חיבור ל-MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    // וידוא קיום Default Bot
    await AIBotConfig.ensureDefaultBot();

    // יצירת לקוח טסט
    const timestamp = Date.now();
    const testPhone = `050${String(timestamp).slice(-7)}`;

    const testClient = await Client.create({
      fullName: 'Quick Test User',
      personalInfo: {
        fullName: 'Quick Test User',
        phone: testPhone,
        email: `test-quick-${timestamp}@example.com`
      },
      businessInfo: {
        businessName: 'Test Business',
        businessType: 'services'
      },
      leadSource: 'website_form',
      source: 'website_form',
      status: 'new_lead',
      aiPreferences: {
        botEnabled: true,
        preferredLanguage: 'he',
        communicationStyle: 'professional'
      }
    });

    // שליחת ההודעה
    console.log(`${colors.magenta}👤 אתה: ${message}${colors.reset}\n`);

    const startTime = Date.now();
    const response = await aiBotEngine.handleMessage(testClient._id, message, 'chat');
    const duration = Date.now() - startTime;

    // הצגת התשובה
    console.log(`${colors.cyan}🤖 הבוט: ${response.message}${colors.reset}\n`);

    // הצגת actions
    if (response.actionResults && response.actionResults.length > 0) {
      console.log(`${colors.yellow}⚙️ פעולות שבוצעו:${colors.reset}`);
      response.actionResults.forEach((result, i) => {
        const status = result.success ? `${colors.green}✓` : `${colors.red}✗`;
        console.log(`   ${i + 1}. ${status} ${result.action}${colors.reset}`);
      });
      console.log('');
    }

    console.log(`${colors.yellow}⏱️ זמן תגובה: ${duration}ms${colors.reset}\n`);

    // ניקוי
    await Client.deleteOne({ _id: testClient._id });
    const ConversationContext = require('./src/models/ConversationContext');
    await ConversationContext.deleteMany({ client: testClient._id });

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}❌ שגיאה: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// קבלת ההודעה מהפרמטרים
const message = process.argv.slice(2).join(' ');

if (!message) {
  console.log(`
${colors.cyan}🤖 Simple Bot Tester${colors.reset}

${colors.yellow}שימוש:${colors.reset}
  node test-bot-simple.js "ההודעה שלך כאן"

${colors.yellow}דוגמאות:${colors.reset}
  node test-bot-simple.js "שלום, איך אתה?"
  node test-bot-simple.js "אני רוצה לקבוע פגישה"
  node test-bot-simple.js "תעדכן את הסטטוס שלי ל-engaged"
  `);
  process.exit(1);
}

testMessage(message);
