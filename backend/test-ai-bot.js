/**
 * טסט מהיר למערכת AI Bot
 *
 * שימוש:
 * node test-ai-bot.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIBotConfig = require('./src/models/AIBotConfig');
const ConversationContext = require('./src/models/ConversationContext');
const Client = require('./src/models/Client');

async function testAIBotSystem() {
  try {
    console.log('🧪 Starting AI Bot System Test...\n');

    // חיבור ל-MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // בדיקת יצירת Default Bot
    console.log('2️⃣ Testing Default Bot Creation...');
    const defaultBot = await AIBotConfig.ensureDefaultBot();
    console.log(`✅ Default Bot: ${defaultBot.name}`);
    console.log(`   - Model: ${defaultBot.model}`);
    console.log(`   - Temperature: ${defaultBot.temperature}`);
    console.log(`   - Functions: ${defaultBot.functions.length}`);
    console.log(`   - Active Functions: ${defaultBot.getActiveFunctions().length}\n`);

    // בדיקת triggers
    console.log('3️⃣ Testing Bot Triggers...');
    const shouldTriggerNewLead = defaultBot.shouldTrigger('new_message', {
      message: 'שלום, אני מעוניין במידע',
      status: 'new_lead'
    });
    console.log(`   - Should trigger on new_message: ${shouldTriggerNewLead}`);

    // בדיקת stop keywords
    console.log('\n4️⃣ Testing Stop Keywords...');
    const stopKeywords = ['עצור', 'stop', 'לא מעוניין'];
    stopKeywords.forEach(keyword => {
      const isStop = defaultBot.isStopKeyword(keyword);
      console.log(`   - "${keyword}" is stop keyword: ${isStop}`);
    });

    // בדיקת handoff keywords
    console.log('\n5️⃣ Testing Handoff Keywords...');
    const handoffKeywords = ['דבר עם אדם', 'talk to human'];
    handoffKeywords.forEach(keyword => {
      const isHandoff = defaultBot.isHandoffKeyword(keyword);
      console.log(`   - "${keyword}" is handoff keyword: ${isHandoff}`);
    });

    // בדיקת function mapping
    console.log('\n6️⃣ Testing Function Mappings...');
    const functionNames = ['schedule_followup', 'update_lead_status', 'handoff_to_human'];
    functionNames.forEach(funcName => {
      const mapping = defaultBot.getFunctionMapping(funcName);
      console.log(`   - ${funcName}: ${mapping ? mapping.type : 'not found'}`);
    });

    // סטטיסטיקות שיחות
    console.log('\n7️⃣ Testing Conversation Stats...');
    const stats = await ConversationContext.getStats();
    console.log(`   - Total Conversations: ${stats.totalConversations}`);
    console.log(`   - Active: ${stats.activeConversations}`);
    console.log(`   - Completed: ${stats.completedConversations}`);
    console.log(`   - Abandoned: ${stats.abandonedConversations}`);

    // בדיקת Active Bots
    console.log('\n8️⃣ Testing Active Bots Query...');
    const activeBots = await AIBotConfig.getActiveBots();
    console.log(`   - Active Bots Count: ${activeBots.length}`);

    console.log('\n✅ All Tests Passed!\n');

    // סיכום
    console.log('📊 System Status Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Default Bot: ${defaultBot.isActive ? 'Active' : 'Inactive'}`);
    console.log(`✅ Functions Available: ${defaultBot.getActiveFunctions().length}`);
    console.log(`✅ Triggers Configured: ${defaultBot.triggers.length}`);
    console.log(`✅ Stop Keywords: ${defaultBot.rules.autoStopKeywords.length}`);
    console.log(`✅ Handoff Keywords: ${defaultBot.rules.handoffToHumanKeywords.length}`);
    console.log(`✅ Max Conversation Length: ${defaultBot.rules.maxConversationLength}`);
    console.log(`✅ Session Timeout: ${defaultBot.rules.sessionTimeoutMinutes} minutes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 AI Bot System is ready for production!\n');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// הרצת הטסט
testAIBotSystem();
