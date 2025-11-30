# BizFlow CRM - מדריך הרצה

## דרישות מקדימות

1. Node.js (גרסה 20 ומעלה מומלצת – תואם ל־Vite ו־Backend)
2. MongoDB (מותקן ורץ מקומית)
3. npm

## התקנה

### 1. התקנת תלויות Backend

```bash
cd backend
npm install
```

### 2. התקנת תלויות Frontend

```bash
cd ../frontend
npm install
```

### 3. הגדרת קבצי ‎.env

צור את הקבצים:

- `backend/.env`
- `frontend/.env`

ב־`backend/.env` השתמש בערכים לדוגמה:

```env
MONGODB_URI=mongodb://localhost:27017/bizflow-crm
PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=bizflow-verify-token

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

ב־`frontend/.env` (Vite) השתמש:

```env
VITE_API_URL=http://localhost:5000/api
```

## הרצת הפרויקט

### Backend (טרמינל ראשון)

```bash
cd backend
npm run dev
```

השרת יאזין ב־`http://localhost:5000`.

### Frontend (טרמינל שני)

```bash
cd frontend
npm run dev
```

האפליקציה תאזין ב־`http://localhost:5173`.

## מבנה הפרויקט (רלוונטי ל־CRM)

```text
bizflow-website/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Client.js          # מודל לקוח/ליד
│   │   │   └── Invoice.js         # מודל חשבונית
│   │   ├── controllers/
│   │   │   ├── clientController.js
│   │   │   ├── invoiceController.js
│   │   │   └── whatsappController.js
│   │   ├── routes/
│   │   │   ├── clients.routes.js
│   │   │   ├── invoices.routes.js
│   │   │   └── whatsapp.routes.js
│   │   ├── services/
│   │   │   ├── whatsappService.js
│   │   │   ├── reminderService.js
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   ├── leadScoring.js
│   │   │   └── messageTemplates.js
│   │   └── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── admin/
        │   ├── hooks/
        │   │   └── useClients.js
        │   ├── pages/
        │   │   └── AdminPanel.jsx
        │   └── utils/
        │       └── api.js
        ├── components/
        │   └── clients/
        │       ├── ClientList/
        │       │   └── ClientList.jsx
        │       └── ClientCard/
        │           ├── ClientCard.jsx
        │           └── tabs/
        │               ├── AssessmentTab.jsx
        │               ├── BusinessInfoTab.jsx
        │               ├── InteractionsTab.jsx
        │               ├── InvoicesTab.jsx
        │               ├── OrdersTab.jsx
        │               ├── PaymentsTab.jsx
        │               └── PersonalInfoTab.jsx
        └── pages/
            └── Dashboard.jsx
```

## פיצ'רים עיקריים

### ניהול לקוחות

- רשימת לקוחות עם חיפוש וסטטוסים
- כרטיס לקוח מפורט עם טאבים:
  - פרטים אישיים
  - מידע עסקי
  - אפיון מוצר (שאלון טלפוני)
  - אינטראקציות
  - הזמנות, תשלומים, חשבוניות

### שאלון אפיון

- 8 חלקים מלאים בהתאם לשאלון שסיפקת
- שמירה ל־`assessmentForm` במודל `Client`
- ניתוח AI בסיסי בצד לקוח שמציע כיווני פתרון ותצוגה מקדימה

### אינטראקציות

- Timeline אינטראקציות לכל לקוח
- סוגי אינטראקציה: שיחה, אימייל, WhatsApp, פגישה, הערה, משימה
- Follow-up ותאריך המשך

### חשבוניות ותשלומים

- מודל `Invoice` עצמאי
- שדה `paymentPlan` בלוח תשלומים של הלקוח
- שדה `proposal` להצעת מחיר, מחיר סגירה ותנאי חוזה

### דשבורד

- סטטיסטיקות כלליות (סה\"כ לקוחות, לידים פעילים, עסקאות פתוחות, הכנסות)
- Pipeline מכירות וגרף Bar
- פילוח מקורות לידים (Pie)
- פעילות אחרונה ורשימת לקוחות פעילים

## Tips

- נתיב אדמין ראשי: `/admin`
- דשבורד: `/admin` (ברירת מחדל) ➜ טוען את `Dashboard.jsx`
- רשימת לקוחות: `/admin/clients`
- כרטיס לקוח: `/admin/clients/:id`

מכאן אפשר להמשיך לפתח אינטגרציית WhatsApp, משימות מתקדמות, דוחות ועוד. 





