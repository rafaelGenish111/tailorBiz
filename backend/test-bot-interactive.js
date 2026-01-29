/**
 * 🤖 Interactive Bot Tester
 *
 * בדיקה אינטראקטיבית של הבוט - שלח הודעות וקבל תשובות בזמן אמת
 *
 * שימוש:
 * node test-bot-interactive.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Client = require('./src/models/Client');
const AIBotConfig = require('./src/models/AIBotConfig');
const ConversationContext = require('./src/models/ConversationContext');
const aiBotEngine = require('./src/services/aiBotEngine');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let testClient = null;
let conversationContext = null;

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function initializeBot() {
  try {
    log('🔌', 'מתחבר ל-MongoDB...', colors.blue);
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    log('✅', 'MongoDB מחובר', colors.green);

    // בדיקת OpenAI API Key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
      log('❌', 'OPENAI_API_KEY לא מוגדר!', colors.red);
      log('💡', 'אנא הגדר OpenAI API key ב-.env', colors.yellow);
      process.exit(1);
    }

    // יצירת/קבלת Default Bot
    log('🤖', 'מאתחל בוט AI...', colors.blue);
    const defaultBot = await AIBotConfig.ensureDefaultBot();
    log('✅', `בוט: ${defaultBot.name}`, colors.green);
    log('📋', `  מודל: ${defaultBot.model}`, colors.cyan);
    log('📋', `  פונקציות: ${defaultBot.getActiveFunctions().length}`, colors.cyan);

    // יצירת ליד טסט או שימוש בקיים
    const timestamp = Date.now();
    const testPhone = `050${String(timestamp).slice(-7)}`;

    testClient = await Client.create({
      fullName: 'Interactive Test User',
      personalInfo: {
        fullName: 'Interactive Test User',
        phone: testPhone,
        email: `test-interactive-${timestamp}@example.com`
      },
      businessInfo: {
        businessName: 'Test Business Interactive',
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

    log('✅', `נוצר לקוח טסט: ${testClient._id}`, colors.green);
    console.log('\n' + '━'.repeat(70));
    console.log(`${colors.bright}${colors.cyan}🤖 בוט מוכן! תוכל לשוחח איתו עכשיו${colors.reset}`);
    console.log(`${colors.yellow}💡 טיפים:${colors.reset}`);
    console.log(`   • כתוב 'יציאה' או 'exit' כדי לצאת`);
    console.log(`   • כתוב 'היסטוריה' כדי לראות את כל השיחה`);
    console.log(`   • כתוב 'נקה' כדי להתחיל שיחה חדשה`);
    console.log('━'.repeat(70) + '\n');

    return true;
  } catch (error) {
    log('❌', `שגיאה באתחול: ${error.message}`, colors.red);
    console.error(error.stack);
    return false;
  }
}

async function sendMessage(message) {
  try {
    log('🤖', 'הבוט חושב...', colors.yellow);

    const startTime = Date.now();
    const response = await aiBotEngine.handleMessage(testClient._id, message, 'chat');
    const duration = Date.now() - startTime;

    console.log(''); // שורה ריקה
    log('🤖', `${response.message}`, colors.cyan);

    // הצגת actions שבוצעו
    if (response.actionResults && response.actionResults.length > 0) {
      console.log('');
      log('⚙️', `פעולות שבוצעו:`, colors.yellow);
      response.actionResults.forEach((result, i) => {
        const status = result.success ? `${colors.green}✓` : `${colors.red}✗`;
        console.log(`   ${i + 1}. ${status} ${result.action}${colors.reset}`);
        if (result.data) {
          console.log(`      ${colors.cyan}→ ${JSON.stringify(result.data)}${colors.reset}`);
        }
      });
    }

    // זמן תגובה
    console.log('');
    log('⏱️', `זמן תגובה: ${duration}ms`, colors.blue);

  } catch (error) {
    log('❌', `שגיאה: ${error.message}`, colors.red);
  }
}

async function showHistory() {
  try {
    const conversation = await ConversationContext.findOne({
      client: testClient._id,
      status: 'active'
    });

    if (!conversation || conversation.messages.length === 0) {
      log('📋', 'אין עדיין היסטוריית שיחה', colors.yellow);
      return;
    }

    console.log('\n' + '━'.repeat(70));
    log('📜', 'היסטוריית שיחה:', colors.cyan);
    console.log('━'.repeat(70));

    conversation.messages.forEach((msg, i) => {
      const roleColor = msg.role === 'user' ? colors.magenta : colors.cyan;
      const roleEmoji = msg.role === 'user' ? '👤' : '🤖';
      const roleName = msg.role === 'user' ? 'אתה' : 'בוט';

      console.log(`\n${roleColor}${roleEmoji} ${roleName}:${colors.reset}`);
      console.log(`${msg.content}`);

      if (msg.functionCall) {
        console.log(`${colors.yellow}   ⚙️ פעולה: ${msg.functionCall.name}${colors.reset}`);
      }
    });

    console.log('\n' + '━'.repeat(70) + '\n');

    // סטטיסטיקות
    log('📊', 'סטטיסטיקות:', colors.cyan);
    console.log(`   הודעות: ${conversation.messages.length}`);
    console.log(`   כוונה: ${conversation.context?.intent || 'לא זוהתה'}`);
    console.log(`   ביטחון: ${conversation.context?.confidence ? (conversation.context.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
    console.log('');

  } catch (error) {
    log('❌', `שגיאה בהצגת היסטוריה: ${error.message}`, colors.red);
  }
}

async function clearConversation() {
  try {
    await ConversationContext.deleteMany({ client: testClient._id });
    log('✅', 'שיחה נוקתה! מתחיל שיחה חדשה...', colors.green);
  } catch (error) {
    log('❌', `שגיאה בניקוי שיחה: ${error.message}`, colors.red);
  }
}

async function chat() {
  while (true) {
    const userMessage = await prompt(`${colors.magenta}👤 אתה: ${colors.reset}`);

    if (!userMessage.trim()) {
      continue;
    }

    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage === 'יציאה' || lowerMessage === 'exit' || lowerMessage === 'quit') {
      log('👋', 'להתראות!', colors.blue);
      break;
    }

    if (lowerMessage === 'היסטוריה' || lowerMessage === 'history') {
      await showHistory();
      continue;
    }

    if (lowerMessage === 'נקה' || lowerMessage === 'clear') {
      await clearConversation();
      continue;
    }

    if (lowerMessage === 'עזרה' || lowerMessage === 'help') {
      console.log('\n' + '━'.repeat(70));
      log('💡', 'פקודות זמינות:', colors.cyan);
      console.log('   יציאה / exit      - יציאה מהתוכנית');
      console.log('   היסטוריה / history - הצגת כל השיחה');
      console.log('   נקה / clear        - ניקוי שיחה והתחלה מחדש');
      console.log('   עזרה / help        - הצגת הודעה זו');
      console.log('━'.repeat(70) + '\n');
      continue;
    }

    await sendMessage(userMessage);
    console.log('');
  }
}

async function cleanup() {
  try {
    if (testClient) {
      log('🧹', 'מנקה נתוני טסט...', colors.yellow);
      await Client.deleteOne({ _id: testClient._id });
      await ConversationContext.deleteMany({ client: testClient._id });
      const TaskManager = require('./src/models/TaskManager');
      await TaskManager.deleteMany({ client: testClient._id });
    }

    await mongoose.connection.close();
    log('👋', 'התנתק מ-MongoDB', colors.blue);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }

  rl.close();
  process.exit(0);
}

// Main
(async () => {
  console.clear();
  console.log('\n' + '━'.repeat(70));
  console.log(`${colors.bright}${colors.green}🤖 Interactive Bot Tester${colors.reset}`);
  console.log('━'.repeat(70) + '\n');

  const initialized = await initializeBot();

  if (!initialized) {
    process.exit(1);
  }

  // Handle exit
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  await chat();
  await cleanup();
})();
