# 🤖 איך לקוחות יכולים לפנות לבוט AI

המדריך המלא לאינטגרציה של הבוט עם לקוחות

---

## 📱 1. WhatsApp (כבר פועל!)

### איך זה עובד?

הבוט **כבר מחובר ל-WhatsApp** ועונה אוטומטית להודעות נכנסות!

**תהליך:**
1. לקוח שולח הודעה למספר WhatsApp של העסק
2. המערכת מזהה את הלקוח (או יוצרת ליד חדש)
3. הבוט מתחיל conversation אוטומטית
4. הבוט עונה בזמן אמת בעברית

### דוגמה:

```
👤 לקוח: "שלום, אני רוצה לשמוע על השירותים שלכם"

🤖 בוט: "שלום! אנו מציעים פתרונות לניהול לידים ולקוחות..."

👤 לקוח: "אני מעוניין לקבוע פגישה"

🤖 בוט: "נהדר! באיזה יום ושעה נוח לך?"
```

### מה צריך לעשות?

**כלום!** זה כבר עובד. רק צריך לוודא ש-WhatsApp מחובר למערכת.

---

## 💬 2. Chat Widget באתר

### מה זה?

כפתור צ'אט צף שמופיע בפינה התחתונה של האתר, מאפשר ללקוחות לשוחח עם הבוט ישירות מהאתר.

### איך להטמיע?

#### שלב 1: הוסף את ה-Widget לאפליקציה

**אופציה A: להוסיף לכל העמודים (מומלץ)**

ערוך את הקובץ הראשי של האפליקציה:

```jsx
// frontend/src/App.jsx (או Main.jsx)
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <>
      {/* הקוד הקיים שלך */}
      <Routes>
        {/* ... */}
      </Routes>

      {/* הוסף את ה-Widget בסוף */}
      <ChatWidget />
    </>
  );
}
```

**אופציה B: להוסיף רק לעמודים ספציפיים**

```jsx
// frontend/src/pages/HomePage.jsx
import ChatWidget from '../components/ChatWidget';

function HomePage() {
  return (
    <div>
      <h1>ברוכים הבאים</h1>
      {/* התוכן שלך */}

      {/* הוסף את ה-Widget */}
      <ChatWidget />
    </div>
  );
}
```

#### שלב 2: הגדר את כתובת ה-API

ודא שיש לך משתנה סביבה:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5001

# בסביבת production:
VITE_API_URL=https://your-domain.com
```

#### שלב 3: זהו!

כעת יופיע כפתור צ'אט צף בפינה התחתונה של המסך:

```
                                    🟦 💬
```

### איך זה נראה?

<details>
<summary>לחץ לצפייה</summary>

**כפתור סגור:**
```
┌─────────────────────────────────────┐
│                                     │
│    האתר שלך                         │
│                                     │
│                                     │
│                              [💬]   │  ← כפתור צף
└─────────────────────────────────────┘
```

**כפתור פתוח:**
```
┌─────────────────────────────────────┐
│                                     │
│    האתר שלך                         │
│                       ┌──────────┐  │
│                       │ 🤖 Bot   │  │
│                       │ מקוון   │  │
│                       ├──────────┤  │
│                       │ שלום!👋  │  │
│                       │ איך אני  │  │
│                       │ יכול     │  │
│                       │ לעזור?   │  │
│                       ├──────────┤  │
│                       │ [______] │  │
│                       │  [שלח]   │  │
│                       └──────────┘  │
└─────────────────────────────────────┘
```

</details>

---

## 🔌 3. API Endpoint (לשימוש מתקדם)

אם אתה רוצה לבנות ממשק משלך, יש לך גישה ישירה ל-API.

### Endpoints זמינים:

#### 1. אתחול צ'אט

```bash
POST /api/public/chat/init
Content-Type: application/json

{}
```

**תגובה:**
```json
{
  "success": true,
  "sessionId": "webchat_1234567890_abc123",
  "botName": "BizFlow Assistant",
  "welcomeMessage": "שלום! 👋 איך אוכל לעזור לך היום?"
}
```

#### 2. שליחת הודעה

```bash
POST /api/public/chat/message
Content-Type: application/json

{
  "message": "שלום, אני רוצה לשמוע על השירותים",
  "sessionId": "webchat_1234567890_abc123",
  "clientInfo": {
    "name": "ישראל ישראלי",
    "email": "israel@example.com",
    "phone": "050-1234567"
  }
}
```

**תגובה:**
```json
{
  "success": true,
  "message": "שלום! אנו מציעים...",
  "conversationId": "chat_697b...",
  "clientId": "697b7838c66b...",
  "actions": []
}
```

#### 3. קבלת היסטוריית שיחה

```bash
GET /api/public/chat/history/:sessionId
```

**תגובה:**
```json
{
  "success": true,
  "messages": [
    {
      "role": "user",
      "content": "שלום",
      "timestamp": "2026-01-29T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "שלום! איך אני יכול לעזור?",
      "timestamp": "2026-01-29T10:00:02Z"
    }
  ],
  "conversationId": "chat_697b...",
  "status": "active"
}
```

#### 4. סיום צ'אט

```bash
POST /api/public/chat/end/:sessionId
```

### דוגמת שימוש (JavaScript):

```javascript
// אתחול
const initResponse = await fetch('http://localhost:5001/api/public/chat/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId } = await initResponse.json();

// שליחת הודעה
const messageResponse = await fetch('http://localhost:5001/api/public/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'שלום!',
    sessionId: sessionId
  })
});
const { message } = await messageResponse.json();
console.log('תגובת הבוט:', message);
```

---

## 🎯 תכונות הבוט

### מה הבוט יכול לעשות?

1. **לענות על שאלות** בעברית טבעית
2. **לקבוע פגישות** - זיהוי אוטומטי של בקשות לפגישה
3. **לעדכן סטטוס לקוחות** - מזהה רמת עניין ומעדכן אוטומטית
4. **להעביר לנציג אנושי** - כשהלקוח מבקש "אדם אמיתי"
5. **לאסוף מידע** - שואל שאלות מבררות לפני ביצוע פעולות

### דוגמאות לשיחות:

**דוגמה 1: קביעת פגישה**
```
👤 "אני רוצה לקבוע פגישה למחר בשעה 3"
🤖 "נהדר! באיזה סוג פגישה מדובר? טלפון, פגישה פרונטלית, WhatsApp או אימייל?"
👤 "שיחת טלפון"
🤖 "קבעתי את הפגישה בשבילך! 📅"
✅ נוצרה משימה במערכת אוטומטית
```

**דוגמה 2: עדכון סטטוס**
```
👤 "אני מעוניין מאוד להתקדם"
🤖 "מצוין! עדכנתי את הסטטוס שלך. נציג שלנו יחזור אליך בקרוב."
✅ סטטוס הלקוח השתנה ל-"engaged"
```

**דוגמה 3: העברה לנציג**
```
👤 "אני רוצה לדבר עם אדם אמיתי"
🤖 "מעביר אותך לנציג אנושי. הוא יחזור אליך בהקדם."
✅ נוצרה משימה דחופה למנהל
```

---

## ⚙️ הגדרות נוספות

### התאמה אישית של הבוט

אפשר לשנות את התנהגות הבוט דרך ממשק הניהול:

```
/api/ai-bots/bot-configs
```

**מה אפשר לשנות:**
- **System Prompt** - האישיות של הבוט
- **Temperature** - רמת היצירתיות (0-2)
- **Functions** - אילו פעולות הבוט יכול לבצע
- **Rules** - כללי שיחה (מקסימום הודעות, timeout, וכו')

### דוגמת התאמה:

```javascript
// שינוי ה-System Prompt לבוט יותר פורמלי
{
  "systemPrompt": "אתה עוזר מקצועי ופורמלי של BizFlow. תמיד השתמש בלשון נימוס ותן תשובות מפורטות.",
  "temperature": 0.5 // פחות יצירתי, יותר עקבי
}
```

---

## 🚀 התחלה מהירה

### צ'קליסט:

- [x] **WhatsApp** - כבר עובד!
- [ ] **Chat Widget** - הוסף `<ChatWidget />` לאפליקציה
- [ ] **בדיקה** - נסה לשלוח הודעה מהאתר
- [ ] **התאמה** - שנה את ה-System Prompt אם צריך

### בדיקה מהירה:

```bash
# בדיקת API
curl -X POST http://localhost:5001/api/public/chat/init

# בדיקת שליחת הודעה
curl -X POST http://localhost:5001/api/public/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "שלום, זה טסט",
    "sessionId": "test_123"
  }'
```

---

## 📊 מוניטורינג ודוחות

### איך לראות שיחות?

**1. דרך API:**
```bash
GET /api/ai-bots/conversations/:clientId
```

**2. במסד הנתונים:**
```javascript
// כל השיחות הפעילות
db.conversationcontexts.find({ status: 'active' })

// שיחות של לקוח ספציפי
db.conversationcontexts.find({ client: ObjectId('...') })
```

### סטטיסטיקות:

```bash
GET /api/ai-bots/stats
```

**תגובה:**
```json
{
  "conversationsStarted": 150,
  "conversationsCompleted": 120,
  "avgSatisfaction": 4.5,
  "totalMessages": 1200,
  "avgMessagesPerConversation": 8
}
```

---

## 🔒 אבטחה

### Rate Limiting

כל ה-endpoints הציבוריים מוגבלים ל:
- **20 בקשות לדקה** לכל IP
- מונע spam ושימוש לרעה

### אנונימיות

לקוחות יכולים לשוחח **ללא צורך בהרשמה**:
- נוצר ליד אוטומטית בשיחה הראשונה
- מידע מינימלי נשמר
- אפשר להוסיף פרטים מאוחר יותר

---

## 💡 טיפים

1. **בדוק תגובות** - השתמש ב-`test-bot-simple.js` לבדיקות
2. **עקוב אחרי שיחות** - בדוק לוג ב-ConversationContext
3. **שפר את ה-Prompts** - התאם לפי משוב מלקוחות
4. **הוסף פונקציות** - אפשר להוסיף יכולות חדשות לבוט

---

## 📞 תמיכה

אם יש בעיות או שאלות:

1. בדוק את הלוגים: `tail -f backend/logs/app.log`
2. הרץ טסט: `node backend/test-openai-real.js`
3. בדוק connection ל-MongoDB
4. ודא ש-OPENAI_API_KEY תקין

---

**זהו! 🎉 עכשיו הלקוחות יכולים לפנות לבוט דרך WhatsApp או דרך האתר!**
