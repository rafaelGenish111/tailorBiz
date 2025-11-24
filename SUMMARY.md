# סיכום מערכת CRM - BizFlow

## מה נבנה?

### Backend (Node.js + MongoDB)

1. **Models (מודלים)**
   - `Client` – מודל לקוח/ליד עשיר עם:
     - `personalInfo`, `businessInfo`
     - `assessmentForm` (שאלון אפיון מלא – 8 חלקים)
     - `interactions`, `tasks`, `orders`, `paymentPlan`, `proposal`, `invoices`
     - שדות סטטוס, מקור ליד, תגיות, ציון ליד, מטא־דאטה ועוד
   - `Invoice` – מודל חשבונית עם שורות, סכומים, מע״מ, סטטוס ותאריכים.

2. **Controllers (בקרים)**
   - `clientController` – עשרות פעולות:
     - CRUD ללקוחות
     - מילוי שאלון אפיון
     - הוספה ושליפה של אינטראקציות
     - לוח תשלומים, משימות, הזמנות, חשבוניות ללקוח
     - סטטיסטיקות כלליות ו־pipeline
   - `invoiceController` – ניהול חשבוניות:
     - יצירה, עדכון, שליפה
     - סימון כמשולמת, שליחת התראות ותזכורות
   - `whatsappController` – טיפול ב־webhooks ושליחת הודעות (תשתית ל־WhatsApp).

3. **Services (שירותים)**
   - `whatsappService` – עטיפה ל־WhatsApp Business API (או אינטגרציה חיצונית):
     - הודעות טקסט, טמפלטים, כפתורים ועוד.
   - `reminderService` – Cron jobs:
     - Follow-ups
     - תשלומים בפיגור
     - לידים קרים וללא מגע
   - `notificationService` – תור התראות מרכזי (Email / WhatsApp / SMS – בהתאם להגדרות).

4. **Utils (כלים)**
   - `leadScoring` – חישוב אוטומטי של ציון ליד (0–100) + המלצות לפעולה.
   - `messageTemplates` – תבניות הודעות מוכנות ל־WhatsApp / Email / SMS.

5. **Routes (נתיבים)**
   - `/api/clients` – כל נתיבי הלקוחות (CRUD, אפיון, אינטראקציות, משימות, הזמנות, תשלומים, חשבוניות).
   - `/api/invoices` – ניהול חשבוניות.
   - `/api/whatsapp` – אינטגרציית WhatsApp (webhooks ושליחה).

### Frontend (React + Material-UI + React Query)

1. **Components (קומפוננטות)**
   - `ClientsList` (admin) – טבלת לקוחות עם:
     - חיפוש, פילטר סטטוס, עמודים.
     - פתיחת כרטיס לקוח בלחיצה על שורה / אייקון עין.
     - יצירה / עריכה / מחיקה של לקוחות.
   - `ClientDetail` – דיאלוג כרטיס לקוח:
     - טאב “פרטים אישיים” – טופס עריכה מלא של כל פרטי הלקוח + סטטוס, מקור ליד ותגיות.
     - טאב “מידע עסקי” – פרטי עסק.
     - טאב “אינטראקציות” – רשימת אינטראקציות + דיאלוג להוספת אינטראקציה חדשה.
     - טאבים למשימות וחשבוניות.
     - טאב “אפיון מוצר” – טעינה של `AssessmentTab`.
     - טאב “הצעת מחיר” – שדות להצעת מחיר, מחיר סגירה ותנאי תשלום/חוזה.
   - `ClientCard` – גרסת כרטיס לקוח עמוד מלא (עם אותם טאבים) לנתיב `/admin/clients/:id`.
   - `AssessmentTab` – שאלון אפיון טלפוני:
     - 8 חלקים, מסודרים כטופס רציף, שאלה בכל שורה.
     - שמירת הנתונים ל־`assessmentForm` ב־Client.
     - בלוק “ניתוח אוטומטי (AI)” שמסכם את המידע ונותן המלצה טקסטואלית + תצוגה מקדימה של פתרון.
   - `InteractionsTab`, `BusinessInfoTab`, `OrdersTab`, `PaymentsTab`, `InvoicesTab`, `PersonalInfoTab` – טאבים משלימים בכרטיס הלקוח.
   - `Dashboard` – דשבורד אנליטי:
     - כרטיסי סטטיסטיקה (סה״כ לקוחות, לידים פעילים, עסקאות פתוחות, הכנסות).
     - גרף Bar של Pipeline מכירות.
     - פילוח מקורות לידים כ־Pie.
     - רשימת פעילות אחרונה.

2. **Hooks (React Query)**
   - `useClients`, `useClient` – ניהול רשימת לקוחות ולקוח בודד.
   - `useCreateClient`, `useUpdateClient`, `useDeleteClient` – פעולות CRUD.
   - `useClientInteractions`, `useAddInteraction` – אינטראקציות.
   - `useClientTasks`, `useCreateTask`, `useUpdateTask` – משימות (תשתית קיימת).
   - `useClientStats`, `usePipelineStats` – סטטיסטיקות ל־Dashboard.

3. **Services**
   - `admin/utils/api.js` – Axios instance:
     - מוסיף token (אם קיים) לכל בקשה.
     - מטפל ב־401 ומנתב ל־Login.
     - ממפה את כל נתיבי ה־API (`clientAPI`, `invoiceAPI`, `whatsappAPI` וכו').

4. **Routing**
   - `App.jsx`:
     - חלק Public – אתר השיווק (`/`, `/about`, `/pricing`, `/contact`).
     - חלק Admin – `/admin/*` שמרנדר `AdminPanel`.
   - `AdminPanel.jsx`:
     - `/admin` → Dashboard החדש.
     - `/admin/clients` → רשימת לקוחות.
     - `/admin/clients/:id` → כרטיס לקוח מלא.
     - נתיבים נוספים (המלצות, בלוג, מוצרים וכו’) נשארו כ־Placeholder.

## פיצ'רים מרכזיים (CRM)

### ✅ מיושם

1. **ניהול לקוחות**
   - יצירה/עריכה/מחיקה.
   - שדות סטטוס, מקור ליד, תגיות, ציון ליד.
   - צפייה מהירה + כרטיס מלא.

2. **שאלון אפיון**
   - טופס אפיון מלא (1–8) עם שמירה במודל.
   - ניתוח אוטומטי בצד לקוח (AI חוקים) שמציע:
     - אילו תהליכים לשפר קודם.
     - כיצד למדוד הצלחה.
     - תצוגה מקדימה של מודול CRM מומלץ.

3. **אינטראקציות**
   - הוספת אינטראקציה חדשה מתוך כרטיס הלקוח.
   - הצגת כל האינטראקציות עם סוג, כיוון, תוכן ו־Follow-up.

4. **הצעת מחיר ותנאי חוזה**
   - שדה `proposal` בלקוח:
     - מחיר ראשוני, מחיר סגירה, מטבע.
     - תנאי תשלום, הערות חוזה.

5. **תשלומים וחשבונות**
   - `paymentPlan` עם תשלומים, סטטוסים, שיטת תשלום וקישור לחשבוניות.
   - מודל `Invoice` עצמאי.

6. **דשבורד**
   - overview מהיר לכל ה־CRM.
   - גרפי Pipeline ו־leads by source.
   - פעילות אחרונה עם ניווט לכרטיסי לקוח.

7. **תזכורות אוטומטיות (Backend)**
   - reminderService מריץ Cron jobs:
     - Follow-up ללידים.
     - תשלומים באיחור.
     - לקוחות לא פעילים.

## טכנולוגיות

**Backend:** Node.js, Express, Mongoose, dotenv, axios, node-cron, express-validator.  
**Frontend:** React, React Router, React Query, Material-UI, Recharts, React-Toastify.  

## המלצות להמשך

### Priority 1

1. חיבור אמיתי ל־WhatsApp Business API (שימוש ב־`whatsappService` ו־`whatsappController`).
2. יצירת PDF לחשבוניות (לדוגמה עם `pdfkit` או `puppeteer`).
3. הוספת שירות email בפועל (SMTP) על בסיס `messageTemplates`.

### Priority 2

4. הרחבת מערכת המשימות (UI מלא למשימות בכל כרטיס לקוח + דשבורד משימות).
5. דוחות: ייצוא Excel ו־PDF לדוחות מכירות, הכנסות, סטטוס לידים.
6. מנגנון הרשאות מתקדם (Roles: Admin, Sales, Support).

### Priority 3

7. אינטגרציה ליומנים (Google Calendar / Outlook) לפגישות.  
8. Mobile App (React Native) לאנשי שטח.  
9. הרחבת “AI” לאוטומציה של follow-ups והצעות מחיר.  

המערכת במצב שבו ניתן לעבוד איתה ביום־יום כמערכת CRM בסיסית–מתקדמת, ולהמשיך להרחיב אותה בהתאם לצרכים העסקיים שלך. 


