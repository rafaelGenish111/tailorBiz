# 🤖 מערכת AI Bot - תיעוד מלא

**תאריך יצירה:** 2026-01-29
**גרסה:** 1.0.0
**סטטוס:** ✅ Phase 1 הושלמה - מוכן לשימוש

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [רכיבים](#רכיבים)
4. [API Endpoints](#api-endpoints)
5. [שימוש](#שימוש)
6. [הגדרות](#הגדרות)
7. [בדיקות](#בדיקות)
8. [שלבי פיתוח](#שלבי-פיתוח)

---

## 🎯 סקירה כללית

מערכת AI Bot אחודה שמשלבת 4 סוגי אוטומציות עם בוט חכם מבוסס OpenAI:

### סוגי אוטומציות:
1. **🆕 טיפול בליד חדש** - WhatsApp + AI Bot אוטומטי
2. **⏰ טיפול בליד ללא מענה** - Follow-up אוטומטי
3. **🔄 אוטומציות מבוססות סטטוס** - פעולות עם שינוי סטטוס
4. **📅 אוטומציות מתוזמנות** - Cron jobs

### יכולות AI Bot:
- 💬 שיחה חופשית בעברית/אנגלית
- 🎯 זיהוי intents (OpenAI Function Calling)
- ⚡ ביצוע actions אוטומטי
- 🤝 Handoff לנציג אנושי
- 📊 מעקב סטטיסטיקות

---

## 🏗️ ארכיטקטורה

```
┌─────────────────────────────────────────────────────────────┐
│                     User (WhatsApp/Chat)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    WhatsAppService                          │
│  • handleIncomingMessage()                                  │
│  • Route to AI Bot if active conversation                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TriggerHandler                           │
│  • handleNewMessage()                                       │
│  • handleStatusChange()                                     │
│  • handleNewLead()                                          │
│  • checkNoResponseLeads() [Cron: 6h]                        │
│  • checkAbandonedConversations() [Cron: 1h]                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AutomationOrchestrator                         │
│  • routeTrigger()                                           │
│  • executeMarketingAutomation()                             │
│  • executeLeadNurturing()                                   │
│  • handleBotIntentDetected()                                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│ MarketingAutomation     │   │ LeadNurturing           │
│ (B2C Campaigns)         │   │ (B2B Lead Sequences)    │
└─────────────────────────┘   └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AIBotEngine                            │
│  • handleMessage()                                          │
│  • callOpenAI() - Function Calling                          │
│  • executeFunction()                                        │
│  • 8 Actions: createTask, scheduleFollowup, etc.           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │  gpt-4o-mini    │
                    └─────────────────┘
```

---

## 📦 רכיבים

### 1. Models (מודלים)

#### ConversationContext
**קובץ:** [`backend/src/models/ConversationContext.js`](backend/src/models/ConversationContext.js)

**תפקיד:** ניהול מצב שיחה של AI Bot

**שדות מרכזיים:**
```javascript
{
  client: ObjectId,              // הלקוח
  channel: String,               // whatsapp/chat/email
  sessionId: String,             // מזהה יחיד
  status: String,                // active/waiting/completed/abandoned/handoff
  messages: [{                   // היסטוריית הודעות
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date,
    functionCall: Object
  }],
  context: {                     // הקשר שיחה
    intent: String,
    entities: Object,
    confidence: Number,
    currentStep: Number,
    pendingActions: [Object],
    variables: Object
  },
  lastActivityAt: Date,
  expiresAt: Date                // TTL: 24h auto-delete
}
```

**Methods:**
- `addMessage(role, content, functionCall, metadata)`
- `updateContext(updates)`
- `complete(reason)`
- `abandon(reason)`
- `handoffToHuman(userId, reason, assignedTo)`
- `getSummary()`

**Static Methods:**
- `getOrCreate(clientId, channel)` - מצא או צור שיחה
- `getActiveConversations(clientId)` - שיחות פעילות
- `archiveOldConversations(daysOld)` - ארכוב ישנות
- `getStats(filter)` - סטטיסטיקות

---

#### AIBotConfig
**קובץ:** [`backend/src/models/AIBotConfig.js`](backend/src/models/AIBotConfig.js)

**תפקיד:** הגדרות בוט (personality, functions, triggers)

**שדות מרכזיים:**
```javascript
{
  name: String,
  description: String,
  isActive: Boolean,
  systemPrompt: String,          // אישיות הבוט
  temperature: Number,           // 0-2 (default: 0.7)
  model: String,                 // gpt-4o-mini/gpt-4/gpt-3.5-turbo
  maxTokens: Number,
  functions: [{                  // OpenAI functions
    name: String,
    description: String,
    parameters: Object,          // JSON Schema
    actionMapping: {
      type: String,              // create_task, update_lead_status, etc.
      automationId: ObjectId,
      config: Object
    },
    enabled: Boolean
  }],
  triggers: [{                   // מתי להפעיל
    event: String,               // new_message, new_lead, etc.
    conditions: Object,
    enabled: Boolean
  }],
  rules: {
    maxConversationLength: 20,
    sessionTimeoutMinutes: 1440,
    handoffToHumanKeywords: [...],
    autoStopKeywords: [...],
    autoHandoffAfterFailures: 3,
    collectFeedback: Boolean,
    allowAutonomousActions: Boolean
  },
  stats: {                       // סטטיסטיקות
    conversationsStarted: Number,
    conversationsCompleted: Number,
    avgSatisfaction: Number,
    totalMessages: Number,
    totalIntentsDetected: Number
  }
}
```

**Methods:**
- `getActiveFunctions()` - פונקציות פעילות לOpenAI
- `shouldTrigger(event, context)` - האם להפעיל
- `getFunctionMapping(functionName)` - mapping של function
- `isHandoffKeyword(message)` - בדיקת handoff
- `isStopKeyword(message)` - בדיקת stop
- `updateStats(updates)` - עדכון סטטיסטיקות

**Static Methods:**
- `ensureDefaultBot()` - יצירת בוט ברירת מחדל
- `getActiveBots()` - כל הבוטים הפעילים
- `getBotForEvent(event, context)` - בוט מתאים לאירוע
- `getDefaultBot()` - בוט ברירת מחדל

---

### 2. Services (שירותים)

#### AIBotEngine
**קובץ:** [`backend/src/services/aiBotEngine.js`](backend/src/services/aiBotEngine.js) (615 שורות)

**תפקיד:** מנוע שיחה AI עם OpenAI Function Calling

**Main Method:**
```javascript
async handleMessage(clientId, message, channel = 'whatsapp')
```

**תהליך:**
1. Get/Create conversation context
2. Get client + bot config
3. Check stop/handoff keywords
4. Add user message to context
5. Call OpenAI with function definitions
6. Handle function calls (if any)
7. Add assistant response
8. Check conversation limits
9. Send response via channel
10. Save context + update stats

**Actions מיושמים (8):**
1. `createTask()` - יצירת משימה
2. `scheduleFollowup()` - קביעת follow-up
3. `updateLeadStatus()` - עדכון סטטוס
4. `sendNotification()` - שליחת התראה
5. `sendEmail()` - שליחת אימייל
6. `sendWhatsApp()` - שליחת WhatsApp
7. `handoffToHuman()` - העברה לנציג
8. `collectInformation()` - איסוף מידע

**OpenAI Integration:**
```javascript
POST https://api.openai.com/v1/chat/completions
{
  model: 'gpt-4o-mini',
  messages: [...],
  functions: [...],
  function_call: 'auto',
  temperature: 0.7,
  max_tokens: 500
}
```

---

#### AutomationOrchestrator
**קובץ:** [`backend/src/services/automationOrchestrator.js`](backend/src/services/automationOrchestrator.js)

**תפקיד:** שכבת routing מרכזית בין מערכות האוטומציה

**Triggers רשומים (8):**
1. `new_lead` - ליד חדש
2. `status_change` - שינוי סטטוס
3. `no_response` - ללא מענה
4. `new_message` - הודעה חדשה
5. `interaction` - אינטראקציה
6. `bot_conversation_completed` - שיחה הושלמה
7. `bot_conversation_abandoned` - שיחה ננטשה
8. `bot_intent_detected` - intent זוהה

**Methods:**
- `initialize()` - אתחול המערכת
- `registerTrigger(type, handler)` - רישום trigger
- `routeTrigger(type, payload)` - ניתוב trigger
- `executeMarketingAutomation(automation, client)`
- `executeLeadNurturing(automation, client)`
- `executeWorkflow(workflowDefinition)`

---

#### TriggerHandler
**קובץ:** [`backend/src/services/triggerHandler.js`](backend/src/services/triggerHandler.js)

**תפקיד:** ניהול triggers + Cron jobs

**Cron Jobs (3):**
1. **No-Response Check** - כל 6 שעות
   ```javascript
   cron.schedule('0 */6 * * *', checkNoResponseLeads)
   ```

2. **Abandoned Conversations** - כל שעה
   ```javascript
   cron.schedule('0 * * * *', checkAbandonedConversations)
   ```

3. **Cleanup Old Conversations** - יומי ב-02:00
   ```javascript
   cron.schedule('0 2 * * *', cleanupOldConversations)
   ```

**Hooks:**
- `handleStatusChange(clientId, oldStatus, newStatus)`
- `handleInteractionCreated(clientId, interaction)`
- `handleNewLead(clientId)`
- `handleNewMessage(clientId, message, channel)`

---

### 3. Controllers & Routes

#### aiBotController
**קובץ:** [`backend/src/controllers/aiBotController.js`](backend/src/controllers/aiBotController.js)

**Endpoints:**

**Bot Configs:**
- `POST /api/ai-bots/bot-configs` - יצירת bot config
- `GET /api/ai-bots/bot-configs` - רשימת configs
- `GET /api/ai-bots/bot-configs/:id` - config ספציפי
- `PUT /api/ai-bots/bot-configs/:id` - עדכון config
- `DELETE /api/ai-bots/bot-configs/:id` - מחיקת config
- `PATCH /api/ai-bots/bot-configs/:id/toggle` - הפעלה/כיבוי
- `PATCH /api/ai-bots/bot-configs/:id/stats` - עדכון סטטיסטיקות
- `GET /api/ai-bots/bot-configs/default` - config ברירת מחדל
- `POST /api/ai-bots/bot-configs/ensure-default` - יצירת default

**Conversations:**
- `POST /api/ai-bots/conversations/test` - טסט שיחה
- `GET /api/ai-bots/conversations/:clientId` - שיחות לקוח
- `GET /api/ai-bots/conversations/:id/messages` - הודעות שיחה
- `POST /api/ai-bots/conversations/:id/handoff` - handoff לנציג
- `DELETE /api/ai-bots/conversations/:id` - ארכוב שיחה

**Statistics:**
- `GET /api/ai-bots/stats` - סטטיסטיקות כלליות

**כל ה-routes מוגנים ב-`protect` middleware (authentication).**

---

## 🔧 הגדרות

### Environment Variables

**קובץ:** `.env`

```bash
# AI Bot Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Bot Settings
BOT_SESSION_TIMEOUT_MINUTES=1440        # 24 hours
BOT_MAX_CONVERSATION_LENGTH=20
BOT_ENABLE_FUNCTION_CALLING=true
ENABLE_AI_BOT=true

# Automation Settings
AUTOMATION_QUEUE_ENABLED=true
AUTOMATION_MAX_CONCURRENT=10
AUTOMATION_RETRY_ATTEMPTS=3
```

---

## 🚀 שימוש

### 1. הפעלת השרת

```bash
cd backend
npm start
```

**Output מצופה:**
```
✅ MongoDB Connected
✅ Parse Server started
🚀 Server running locally on port 5001
✅ AutomationOrchestrator initialized
   ├── 8 triggers רשומים
✅ TriggerHandler initialized
   ├── Cron: no-response (6h)
   ├── Cron: abandoned conversations (1h)
   └── Cron: cleanup (daily)
✅ AI Bot system ready
```

---

### 2. יצירת Bot Config

```javascript
// POST /api/ai-bots/bot-configs
{
  "name": "Support Bot",
  "systemPrompt": "אתה נציג תמיכה של BizFlow...",
  "temperature": 0.7,
  "model": "gpt-4o-mini",
  "functions": [
    {
      "name": "schedule_meeting",
      "description": "קביעת פגישה עם הלקוח",
      "parameters": {
        "type": "object",
        "properties": {
          "date": { "type": "string" },
          "time": { "type": "string" }
        },
        "required": ["date"]
      },
      "actionMapping": {
        "type": "create_task",
        "config": { "priority": "high" }
      },
      "enabled": true
    }
  ],
  "triggers": [
    {
      "event": "new_message",
      "conditions": {},
      "enabled": true
    }
  ]
}
```

---

### 3. טסט שיחה

```javascript
// POST /api/ai-bots/conversations/test
{
  "clientId": "507f1f77bcf86cd799439011",
  "message": "שלום, אני רוצה לקבוע פגישה",
  "channel": "whatsapp"
}

// Response:
{
  "success": true,
  "data": {
    "response": "שלום! אשמח לעזור לך לקבוע פגישה. באיזה תאריך נוח לך?",
    "functionCall": {
      "name": "schedule_meeting",
      "arguments": { ... }
    }
  }
}
```

---

### 4. מעקב אחר שיחות

```javascript
// GET /api/ai-bots/conversations/:clientId
{
  "success": true,
  "count": 2,
  "data": [
    {
      "sessionId": "whatsapp_507f1f77bcf86cd799439011_1738165200000",
      "status": "active",
      "messageCount": 5,
      "intent": "schedule_meeting",
      "createdAt": "2026-01-29T10:00:00.000Z",
      "lastActivityAt": "2026-01-29T10:05:00.000Z"
    }
  ]
}
```

---

## 🧪 בדיקות

### הרצת טסטים

```bash
# טסט בסיסי של המערכת
node test-ai-bot.js
```

**Output:**
```
🧪 Starting AI Bot System Test...
✅ MongoDB Connected
✅ Default Bot: Default Bot
✅ All Tests Passed!
🎉 AI Bot System is ready for production!
```

### בדיקות ידניות

#### 1. בדיקת Default Bot
```bash
curl http://localhost:5001/api/ai-bots/bot-configs/default \
  -H "Authorization: Bearer <token>"
```

#### 2. בדיקת Triggers
```bash
# בדיקה ידנית של no-response leads
node -e "require('./src/services/triggerHandler').runManualCheck()"
```

#### 3. בדיקת OpenAI Integration
```javascript
// test-openai.js
const aiBotEngine = require('./src/services/aiBotEngine');
await aiBotEngine.handleMessage(
  'clientId',
  'שלום, אני רוצה לקבוע פגישה',
  'whatsapp'
);
```

---

## 📊 סטטיסטיקות ומעקב

### לוגים
המערכת מדפיסה logs מפורטים:

```
💬 Handling new message: 507f1f77bcf86cd799439011 (whatsapp)
🤖 Starting AI bot conversation
🎯 Intent detected: schedule_meeting
✅ Task created: Meeting with client
📤 Sending WhatsApp response
✅ Conversation context saved
```

### Metrics
```javascript
// GET /api/ai-bots/stats
{
  "conversations": {
    "totalConversations": 150,
    "activeConversations": 12,
    "completedConversations": 120,
    "abandonedConversations": 18,
    "avgMessagesPerConversation": 8.5,
    "avgSatisfaction": 4.2
  },
  "bots": [
    {
      "name": "Default Bot",
      "stats": {
        "conversationsStarted": 150,
        "conversationsCompleted": 120,
        "totalMessages": 1275,
        "totalIntentsDetected": 95,
        "avgSatisfaction": 4.2
      }
    }
  ]
}
```

---

## 🔮 שלבי פיתוח

### ✅ Phase 1: Foundation (הושלמה)
- [x] Models: ConversationContext, AIBotConfig
- [x] Services: AIBotEngine, AutomationOrchestrator, TriggerHandler
- [x] Controllers & Routes
- [x] Server initialization
- [x] Environment variables
- [x] Basic testing

### 🚧 Phase 2: AI Implementation (בביצוע)
- [x] OpenAI function calling
- [x] Intent detection
- [x] Action execution
- [ ] Enhanced error handling
- [ ] Fallback mechanisms
- [ ] Context persistence optimization

### 📅 Phase 3: Missing Triggers (הבא)
- [ ] status_change trigger testing
- [ ] no_response trigger testing
- [ ] interaction trigger testing
- [ ] Client model hooks integration

### 🎨 Phase 4: Visual Builder UI (עתידי)
- [ ] AutomationBuilder component
- [ ] TriggerSelector component
- [ ] ActionBuilder component
- [ ] AIBotConfigPanel component
- [ ] PreviewAndTest component

### 💬 Phase 5: Bot Chat Interface (עתידי)
- [ ] BotChatInterface component
- [ ] AIBotManager UI
- [ ] ConversationHistory viewer
- [ ] Real-time updates

### 🚀 Phase 6: Integration & Production (עתידי)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Load testing
- [ ] Documentation completion
- [ ] User acceptance testing

---

## 💡 דוגמאות שימוש

### דוגמה 1: ליד חדש עם AI Bot

**Flow:**
1. ליד חדש נכנס למערכת
2. AutomationOrchestrator מזהה trigger של `new_lead`
3. AIBotConfig מחזיר bot פעיל
4. AIBotEngine שולח הודעת ברוכים הבאים
5. משתמש משיב
6. Bot מזהה intent (למשל: `schedule_meeting`)
7. Task נוצר אוטומטית
8. סטטוס משתנה ל-`engaged`

### דוגמה 2: No-Response Follow-up

**Flow:**
1. Cron job רץ כל 6 שעות
2. TriggerHandler בודק לידים ללא מענה
3. מוצא ליד עם 3 ימים ללא אינטראקציה
4. AutomationOrchestrator מנתב ל-LeadNurturing
5. שליחת הודעת follow-up
6. אם אין תגובה ב-24h נוספות → handoff לנציג

---

## 🛠️ פתרון בעיות

### בעיה: Bot לא מגיב
**פתרון:**
1. בדוק ש-`ENABLE_AI_BOT=true`
2. בדוק ש-`OPENAI_API_KEY` תקין
3. בדוק logs: `✅ AI Bot system ready`
4. בדוק ש-Default Bot קיים: `GET /api/ai-bots/bot-configs/default`

### בעיה: Cron jobs לא רצים
**פתרון:**
1. בדוק initialization logs
2. וודא ש-server רץ continuously (לא serverless)
3. בדוק `triggerHandler.getStatus()`

### בעיה: Function calling לא עובד
**פתרון:**
1. בדוק ש-`BOT_ENABLE_FUNCTION_CALLING=true`
2. וודא ש-functions מוגדרים ב-bot config
3. בדוק OpenAI response logs
4. וודא שה-function parameters תואמים ל-JSON Schema

---

## 📞 תמיכה

**Issues:** https://github.com/anthropics/claude-code/issues
**תיעוד:** קובץ זה + [Plan](/.claude/plans/federated-purring-sprout.md)
**Logs:** `backend/logs/` (אם מוגדר)

---

## 🎉 סיכום

מערכת AI Bot אחודת ומקצועית שמאפשרת:
- 🤖 שיחות AI חכמות עם OpenAI
- ⚡ אוטומציות מתוזמנות וטריגרים
- 🎯 זיהוי intents וביצוע actions
- 📊 מעקב סטטיסטיקות מפורט
- 🔧 ניהול דרך API מלא

**נוצר על ידי Claude Code** 🤖
**תאריך:** 2026-01-29
