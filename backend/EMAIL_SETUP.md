# 📧 Email Service Setup Guide

## מה השתנה?

הוספתי מערכת שליחת מיילים מלאה לפרויקט:

1. ✅ **Email Service חדש** - [emailService.js](src/services/emailService.js)
2. ✅ **אינטגרציה באוטומציות** - שליחת מיילים באוטומציות שיווקיות
3. ✅ **שליחת חשבוניות במייל** - חשבוניות נשלחות אוטומטית ללקוחות
4. ✅ **תמיכה בתבניות** - תבניות מוכנות מראש מ-[messageTemplates.js](src/utils/messageTemplates.js)
5. ✅ **מחקתי את SMS** - לא צריך יותר, משתמשים ב-Email ו-WhatsApp

---

## 🚀 איך להתחיל?

### שלב 1: בחר ספק Email

יש לך 3 אפשרויות:

#### אפשרות A: Gmail (מומלץ להתחלה) ⭐

**יתרונות:**
- חינם
- פשוט להגדיר
- אמין

**חיסרונות:**
- מגבלה של 500 מיילים ליום
- צריך App Password

**הגדרה:**

1. לך ל-[Google App Passwords](https://myaccount.google.com/apppasswords)
2. צור App Password חדש (בחר "Mail" ו-"Other")
3. העתק את הסיסמה (16 תווים)
4. עדכן ב-`.env`:

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=BizFlow
```

#### אפשרות B: SendGrid (מומלץ לפרודקשן) 🚀

**יתרונות:**
- 100 מיילים ליום חינם
- אמין מאוד
- Analytics מובנה
- IP reputation טוב

**חיסרונות:**
- צריך להירשם לשירות
- צריך לאמת domain (לשליחה גבוהה)

**הגדרה:**

1. הירשם ל-[SendGrid](https://sendgrid.com)
2. צור API Key ב-[Settings > API Keys](https://app.sendgrid.com/settings/api_keys)
3. עדכן ב-`.env`:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=BizFlow
```

#### אפשרות C: SMTP כללי

אם יש לך ספק SMTP אחר:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=BizFlow
```

---

### שלב 2: אתחל את השרת

```bash
cd backend
npm start
```

אם הכל מוגדר נכון, תראה:

```
✅ Email Service initialized with provider: gmail
✅ Email service ready to send messages
```

אם משהו לא בסדר:

```
⚠️ Email service not configured: Missing EMAIL_USER or EMAIL_PASSWORD
```

---

## 🧪 בדיקת המערכת

### בדיקה מהירה מהקוד:

צור קובץ `testEmail.js`:

```javascript
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function test() {
  emailService.initialize();

  const result = await emailService.sendEmail(
    'your-email@gmail.com',
    'Test from BizFlow',
    '<h1>זה עובד! 🎉</h1><p>המייל שלך מוגדר נכון.</p>',
    'זה עובד! המייל שלך מוגדר נכון.'
  );

  console.log('Result:', result);
}

test();
```

הרץ:

```bash
node testEmail.js
```

---

## 📋 איפה המיילים נשלחים?

### 1. **שליחת חשבוניות**

כאשר שולחים חשבונית דרך:
- `POST /api/invoices/:id/send`

המייל נשלח אוטומטית עם:
- ✅ פרטי החשבונית
- ✅ סכום ותאריך תשלום
- ✅ לינק להורדת PDF

**קוד:** [invoiceController.js:309-346](src/controllers/invoiceController.js#L309-L346)

### 2. **אוטומציות שיווקיות**

כאשר מגדירים action מסוג `send_email` באוטומציה:

```javascript
{
  type: 'send_email',
  config: {
    to: 'client@example.com',
    subject: 'נושא המייל',
    body: '<h1>תוכן HTML</h1>',
    text: 'תוכן טקסט רגיל'
  }
}
```

**קוד:** [automationEngine.js:146-165](src/services/marketing/automationEngine.js#L146-L165)

### 3. **תבניות מוכנות**

```javascript
// Welcome email
await emailService.sendWelcomeEmail('client@example.com', 'שם הלקוח');

// Proposal email
await emailService.sendProposal('client@example.com', 'שם הלקוח', 'https://...');

// Custom template
await emailService.sendTemplate('client@example.com', 'welcomeEmail', {
  clientName: 'שם הלקוח'
});
```

---

## 🎨 התבניות הקיימות

כל התבניות נמצאות ב-[messageTemplates.js](src/utils/messageTemplates.js):

### Email Templates:

1. **welcomeEmail** - מייל ברוכים הבאים ללקוח חדש
2. **proposalEmail** - שליחת הצעת מחיר
3. **invoiceEmail** - שליחת חשבונית

### להוסיף תבנית חדשה:

```javascript
// ב-messageTemplates.js
email: {
  myNewTemplate: {
    subject: (clientName) => `נושא המייל - ${clientName}`,
    body: (clientName, otherParam) => `
      <div dir="rtl">
        <h2>שלום ${clientName}</h2>
        <p>${otherParam}</p>
      </div>
    `
  }
}
```

ואז תשתמש:

```javascript
await emailService.sendTemplate('to@example.com', 'myNewTemplate', {
  clientName: 'משה',
  otherParam: 'תוכן נוסף'
});
```

---

## 🔧 Troubleshooting

### בעיה: "Email service not configured"

**פתרון:**
1. ודא שמילאת את `EMAIL_USER` ו-`EMAIL_PASSWORD` ב-`.env`
2. אתחל מחדש את השרת

### בעיה: "Invalid login" עם Gmail

**פתרון:**
1. אתה צריך **App Password**, לא הסיסמה הרגילה שלך
2. לך ל-[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. צור password חדש
4. השתמש בו ב-`EMAIL_PASSWORD`

### בעיה: "Message rejected"

**פתרון:**
1. ודא שכתובת `EMAIL_FROM` תואמת ל-`EMAIL_USER` (ב-Gmail)
2. אם משתמש ב-SendGrid - ודא ש-EMAIL_FROM מאומת

### בעיה: המיילים נכנסים ל-Spam

**פתרון:**
1. השתמש ב-SendGrid (יש להם IP reputation טוב)
2. אמת את ה-domain שלך (SPF, DKIM records)
3. הוסף unsubscribe link במיילים

---

## 📊 מה השתנה בקוד?

### קבצים חדשים:
- ✅ [src/services/emailService.js](src/services/emailService.js) - שירות Email
- ✅ [.env.example](.env.example) - דוגמה להגדרות

### קבצים שהשתנו:
- ✅ [src/services/marketing/automationEngine.js](src/services/marketing/automationEngine.js)
  - הוספתי שליחת Email אמיתית (שורות 146-165)
  - מחקתי את SMS (שורות 155-163)
  - תיקנתי את WhatsApp (שורות 164-177)

- ✅ [src/controllers/invoiceController.js](src/controllers/invoiceController.js)
  - הוספתי שליחת חשבונית במייל (שורות 315-346)

- ✅ [package.json](package.json)
  - הוספתי `nodemailer`

---

## 🎯 מה הלאה?

### אופציונלי - שיפורים נוספים:

1. **PDF Attachments** - צרף PDF של החשבונית ישירות למייל (במקום רק link)
2. **Email Templates מתקדמות** - עיצוב HTML מקצועי יותר
3. **Email Tracking** - מעקב אחר פתיחות וקליקים
4. **Bulk Sending** - שליחה המונית לרשימות תפוצה
5. **Email Queue** - תור מיילים עם retry logic

---

## 💬 שאלות?

אם משהו לא עובד, בדוק:
1. ה-logs בקונסול
2. שההגדרות נכונות ב-`.env`
3. שהשרת התחיל מחדש אחרי השינוי ב-`.env`

---

**נכתב על ידי Claude Code** 🤖
