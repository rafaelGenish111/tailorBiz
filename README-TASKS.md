# מערכת Task Manager & Notifications - הוראות הרצה

## 🚀 התקנה

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install date-fns
```

## 📋 הרצה

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

אמור לראות:

```
✅ MongoDB connected
🔔 Starting Reminder Service...
✅ Reminder Service is now active
📋 Scheduled jobs: 4
🚀 Server is running on port 5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

## 🧪 בדיקה

### 1. בדוק שהאוטומציות עובדות

```
בדפדפן: http://localhost:5000/api/test/run-reminders
```

צפוי לראות:

```json
{
  "success": true,
  "message": "Manual check completed. Check server logs for details."
}
```

### 2. בדוק את סטטוס האוטומציות

```
http://localhost:5000/api/automation/status
```

### 3. פתח את האפליקציה

```
http://localhost:3000/admin/today
```

## 📱 דפים זמינים

1. **סדר היום שלי** (`/admin/today`)
   - משימות להיום
   - משימות באיחור
   - משימות דחופות
   - התראות

2. **יומן** (`/admin/calendar`)
   - תצוגה חודשית
   - משימות לפי יום
   - לחיצה על יום לראות פרטים

3. **לוח משימות** (`/admin/tasks`)
   - Kanban board
   - 4 עמודות: לעשות, בביצוע, ממתין, הושלם
   - גרור ושחרר (בעתיד)

4. **מרכז התראות** (`/admin/notifications`)
   - כל ההתראות
   - סינון: הכל / לא נקראו / נקראו
   - מחיקה וסימון כנקרא

## 🤖 אוטומציות פעילות

### כל יום ב-9:00 בבוקר:

- ✅ בדיקת Follow-ups
- ✅ זיהוי לידים קרים
- ✅ תשלומים באיחור
- ✅ פגישות מחר
- ✅ משימות להיום

### כל יום ב-8:00 בבוקר:

- ✅ תזכורות תשלום (3 ימים לפני)

### כל שעה:

- ✅ משימות דחופות בשעה הקרובה

### כל יום ב-18:00:

- ✅ סיכום יומי למנהל

## 🎯 יצירת משימה ידנית

```javascript
POST http://localhost:5000/api/tasks

{
  "title": "התקשר ללקוח",
  "description": "לברר לגבי ההצעה",
  "type": "call",
  "priority": "high",
  "status": "todo",
  "dueDate": "2025-11-24T10:00:00",
  "relatedClient": "CLIENT_ID_HERE"
}
```

## 📊 API Endpoints

### Tasks

- `GET /api/tasks` - כל המשימות (עם פילטרים)
- `GET /api/tasks/:id` - משימה ספציפית
- `POST /api/tasks` - יצירת משימה
- `PUT /api/tasks/:id` - עדכון משימה
- `DELETE /api/tasks/:id` - מחיקת משימה
- `GET /api/tasks/views/today-agenda` - סדר היום
- `GET /api/tasks/views/calendar` - יומן
- `GET /api/tasks/stats/overview` - סטטיסטיקות

### Notifications

- `GET /api/notifications` - כל ההתראות
- `PUT /api/notifications/:id/read` - סמן כנקרא
- `PUT /api/notifications/read-all` - סמן הכל כנקרא
- `DELETE /api/notifications/:id` - מחק התראה

## 🐛 Troubleshooting

### אין התראות?

→ הרץ: `http://localhost:5000/api/test/run-reminders`

### האוטומציות לא עובדות?

→ בדוק שרואה בלוג: "Reminder Service is now active"

### MongoDB לא מחובר?

→ וודא ש-MongoDB רץ: `sudo systemctl status mongod`

## 🎉 סיימת!

עכשיו כשתכנס לאפליקציה, תראה:

- 🔔 Badge עם מספר התראות לא נקראו
- 📋 סדר היום המלא שלך
- 📅 יומן עם כל המשימות
- ✅ לוח Kanban מסודר

**המערכת מוכנה לשימוש!**
















