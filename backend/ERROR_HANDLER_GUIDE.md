# 🐛 Error Handler - מדריך שימוש

## מה עשינו?

הוספנו מערכת **טיפול בשגיאות מקצועית** למערכת:

✅ שגיאות אחידות בכל ה-API
✅ Logging מרכזי וברור
✅ הסתרת stack traces בפרודקשן
✅ טיפול חכם ב-Mongoose errors
✅ טיפול ב-JWT errors
✅ תמיכה בשגיאות validation

---

## 📁 קבצים חדשים:

1. **src/utils/errors.js** - מחלקות שגיאה
2. **src/middleware/errorHandler.js** - middleware לטיפול בשגיאות
3. **src/app.js** - עודכן עם ה-error handler החדש

---

## 🎯 איך להשתמש?

### **1. שליחת שגיאות בסיסיות**

```javascript
// בקונטרולר
const { NotFoundError, BadRequestError } = require('../utils/errors');

// לא נמצא
if (!client) {
  throw new NotFoundError('לקוח');
}

// בקשה לא תקינה
if (!req.body.email) {
  throw new BadRequestError('אימייל הוא שדה חובה');
}
```

### **2. כל סוגי השגיאות הזמינים**

```javascript
const {
  BadRequestError,      // 400 - בקשה לא תקינה
  UnauthorizedError,    // 401 - לא מורשה
  ForbiddenError,       // 403 - אין הרשאות
  NotFoundError,        // 404 - לא נמצא
  ConflictError,        // 409 - קונפליקט (כפילות)
  ValidationError,      // 422 - שגיאת וולידציה
  RateLimitError,       // 429 - יותר מדי בקשות
  InternalServerError,  // 500 - שגיאת שרת
  ServiceUnavailableError // 503 - שירות לא זמין
} = require('../utils/errors');
```

### **3. שגיאות Validation מורכבות**

```javascript
const { ValidationError } = require('../utils/errors');

// עם פירוט שגיאות
throw new ValidationError('שגיאת וולידציה', [
  { field: 'email', message: 'אימייל לא תקין', value: req.body.email },
  { field: 'phone', message: 'מספר טלפון לא תקין', value: req.body.phone }
]);
```

### **4. שימוש ב-asyncHandler (מומלץ!)**

במקום try-catch בכל פונקציה:

```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');

// ❌ הדרך הישנה
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'לקוח לא נמצא' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ הדרך החדשה (הרבה יותר נקייה!)
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError('לקוח');
  }

  res.json({ success: true, data: client });
});
```

---

## 🎨 דוגמאות מעשיות

### **דוגמה 1: קונטרולר פשוט**

```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const Client = require('../models/Client');

// Get client by ID
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError('לקוח');
  }

  res.json({ success: true, data: client });
});

// Create client
exports.createClient = asyncHandler(async (req, res) => {
  const { fullName, phone, email } = req.body;

  if (!fullName || !phone) {
    throw new BadRequestError('שם מלא וטלפון הם שדות חובה');
  }

  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    data: client
  });
});
```

### **דוגמה 2: טיפול בהרשאות**

```javascript
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Middleware לבדיקת authentication
exports.protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('אנא התחבר למערכת');
  }

  // Verify token...
  next();
});

// Middleware לבדיקת הרשאות
exports.requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('פעולה זו מיועדת למנהלים בלבד');
  }

  next();
});
```

### **דוגמה 3: שגיאות Mongoose אוטומטיות**

```javascript
// השגיאות האלה מטופלות אוטומטית!

// Duplicate key error (11000)
const client = await Client.create({ phone: '0501234567' });
// אם הטלפון קיים -> "phone '0501234567' כבר קיים במערכת"

// Validation error
const client = await Client.create({ fullName: 'test' });
// אם חסר phone -> "phone הוא שדה חובה"

// Cast error (ID לא תקין)
const client = await Client.findById('invalid-id');
// -> "ערך לא תקין עבור _id: invalid-id"

// אין צורך ב-try-catch מיוחד!
```

---

## 📊 פורמט התגובות

### **הצלחה:**
```json
{
  "success": true,
  "data": { ... }
}
```

### **שגיאה (4xx/5xx):**
```json
{
  "success": false,
  "status": "fail",
  "message": "לקוח לא נמצא",
  "timestamp": "2026-01-29T12:34:56.789Z",
  "path": "/api/clients/123",
  "method": "GET"
}
```

### **שגיאת Validation:**
```json
{
  "success": false,
  "status": "fail",
  "message": "שגיאת וולידציה",
  "errors": [
    {
      "field": "email",
      "message": "אימייל לא תקין",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2026-01-29T12:34:56.789Z",
  "path": "/api/clients",
  "method": "POST"
}
```

### **Development Mode (בלבד):**
```json
{
  "success": false,
  "message": "שגיאה",
  "stack": "Error: ... at ...",
  "error": { ... }
}
```

---

## 🎯 Logging

השגיאות נרשמות בקונסול לפי רמת חומרה:

### **5xx (Server Errors):**
```
❌ Server Error: {
  timestamp: '2026-01-29T12:34:56.789Z',
  method: 'GET',
  path: '/api/clients/123',
  statusCode: 500,
  message: 'שגיאת שרת פנימית',
  userId: 'user123',
  ip: '192.168.1.1'
}
Stack: Error at ...
```

### **4xx (Client Errors):**
```
⚠️ Client Error: {
  timestamp: '2026-01-29T12:34:56.789Z',
  method: 'POST',
  path: '/api/clients',
  statusCode: 404,
  message: 'לקוח לא נמצא',
  userId: 'user123'
}
```

---

## ✅ Best Practices

### **DO ✅**
```javascript
// השתמש ב-asyncHandler
exports.myFunction = asyncHandler(async (req, res) => { ... });

// זרוק שגיאות ספציפיות
throw new NotFoundError('לקוח');

// תן הודעות ברורות
throw new BadRequestError('אימייל הוא שדה חובה');

// השתמש ב-ValidationError עם פירוט
throw new ValidationError('שגיאת וולידציה', errors);
```

### **DON'T ❌**
```javascript
// אל תחזיר שגיאות ישירות
return res.status(404).json({ message: 'Not found' }); // ❌

// אל תשתמש ב-try-catch אם לא חייב
try { ... } catch (e) { ... } // ❌ (asyncHandler עושה את זה!)

// אל תחשוף מידע רגיש בשגיאות
throw new Error(JSON.stringify(user)); // ❌

// אל תשכח להשתמש ב-throw
new NotFoundError('לקוח'); // ❌ (חסר throw!)
```

---

## 🧪 בדיקה

נסה לגרום לשגיאות כדי לראות שזה עובד:

```bash
# 404 - Route לא קיים
curl http://localhost:5000/api/nonexistent

# 404 - Resource לא נמצא
curl http://localhost:5000/api/clients/000000000000000000000000

# 400 - ID לא תקין
curl http://localhost:5000/api/clients/invalid-id

# 401 - Unauthorized (אם יש authentication)
curl http://localhost:5000/api/clients
```

---

## 📈 מה הרווחנו?

### **לפני:**
- שגיאות לא אחידות בכל API
- הודעות שגיאה באנגלית
- Stack traces חשופים בפרודקשן
- קשה לדבג בעיות
- Mongoose errors מבלבלות

### **אחרי:**
- ✅ פורמט אחיד בכל API
- ✅ הודעות בעברית וברורות
- ✅ Stack traces רק ב-development
- ✅ Logging מסודר וקריא
- ✅ Mongoose errors מטופלות אוטומטית
- ✅ קוד נקי יותר (פחות try-catch!)

---

## 🔄 Migration - איך להתחיל להשתמש?

לא צריך לשנות כלום מיד! המערכת הישנה ממשיכה לעבוד.

**המלצה:** כשאתה עובד על קונטרולר, עדכן אותו לשיטה החדשה:

1. הוסף `asyncHandler` לפונקציות
2. החלף `res.status().json()` ב-`throw new Error()`
3. השתמש בשגיאות הספציפיות (NotFoundError, וכו')

---

**נוצר על ידי Claude Code** 🤖
