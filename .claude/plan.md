# תוכנית: סנכרון דו-כיווני Notion ↔ CRM

## מצב קיים
- `notionService.js` — שירות חד-כיווני CRM→Notion (יוצר/מעדכן דפים ב-Notion)
- `notionSyncService.js` — fire-and-forget עם retry, נקרא אחרי כל create/update של פרויקט
- `notionRoutes.js` — admin endpoints: status, sync-all, sync/:projectId
- Project model כבר מכיל `notionPageId` לקישור עם Notion
- **אין כרגע סנכרון הפוך** (Notion→CRM)
- ה-database הישן ב-Notion (`NOTION_DATABASE_ID`) שונה מהחדש שיצרנו (דשבורד מנכ"ל)

## המטרה
סנכרון דו-כיווני מלא: שינוי ב-Notion מתעדכן ב-MongoDB, ושינוי ב-CRM מתעדכן ב-Notion.

## ארכיטקטורה

### כיוון 1: CRM → Notion (שדרוג הקיים)
- עדכון `notionService.js` לעבוד עם ה-database החדש ("פרויקטים וריטיינרים")
- מיפוי שדות חדש:
  - `project.name + client.name` → "שם הלקוח / הפרויקט"
  - `project.productType` → "חטיבה עסקית" (מיפוי: מערכת SaaS→SaaS הדרכות, מערכות AI→AI לארגונים, null→פרויקט פנימי)
  - `project.stage` → "סטטוס פרויקט" (מיפוי: lead→Kickoff, active→בפיתוח, completed→מוכן ללקוח, won→ריטיינר פעיל)
  - `project.financials.totalValue` → "הכנסת הקמה"
  - `project.expectedMrr` → "ריטיינר חודשי"
  - `project.endDate` → "תאריך יעד למסירה"
- עדכון `NOTION_DATABASE_ID` ב-.env ל-database החדש

### כיוון 2: Notion → CRM (חדש — polling)
Notion לא תומך ב-webhooks, לכן נשתמש ב-**cron polling**:

- **Cron job חדש** כל 2 דקות — שואל את Notion API על שינויים
- שימוש ב-`notion.databases.query()` עם `filter_properties` ו-`sorts` by `last_edited_time`
- שמירת `lastSyncedAt` timestamp בזיכרון (או ב-DB) להשוואת שינויים
- **מיפוי הפוך**: קריאת properties מ-Notion ועדכון MongoDB
- **מניעת לולאה**: כשה-cron מעדכן MongoDB, הוא מסמן flag `_notionTriggered: true` כדי שה-CRM→Notion sync לא ישלח חזרה את אותו שינוי

### פתרון התנגשויות (Conflict Resolution)
- **Last write wins** — מי שעדכן אחרון מנצח
- הוספת שדה `notionLastEditedAt` ב-Project model כדי לזהות שינויים חדשים

## קבצים לשנות/ליצור

### שינויים
1. **`backend/src/services/notionService.js`** — עדכון `buildProperties()` ו-`buildPropertiesReverse()` למיפוי החדש
2. **`backend/src/services/notionSyncService.js`** — הוספת `pullFromNotion()` method + cron job
3. **`backend/src/models/Project.js`** — הוספת `notionLastEditedAt` field
4. **`backend/.env`** — עדכון `NOTION_DATABASE_ID` ל-database החדש

### ללא שינוי
- Routes נשארים כמו שהם (כבר יש sync-all ו-sync/:id)
- Frontend לא צריך שינוי — הנתונים מתעדכנים ב-MongoDB והתצוגה נשארת

## מיפוי שדות מפורט

### CRM → Notion
| CRM Field | Notion Property | לוגיקה |
|---|---|---|
| `client.fullName – project.name` | שם הלקוח / הפרויקט | Title: "שם לקוח – שם פרויקט" |
| `project.productType` | חטיבה עסקית | מיפוי enum |
| `project.stage` | סטטוס פרויקט | lead→Kickoff, active→בפיתוח, completed→מוכן ללקוח, won→ריטיינר פעיל |
| `project.financials.totalValue` | הכנסת הקמה | Number ₪ |
| `project.expectedMrr` | ריטיינר חודשי | Number ₪ |
| `project.endDate` | תאריך יעד למסירה | Date |

### Notion → CRM
| Notion Property | CRM Field | לוגיקה |
|---|---|---|
| סטטוס פרויקט | `project.stage` | Kickoff→lead, בפיתוח→active, QA→active, מוכן ללקוח→completed, ריטיינר פעיל→won |
| הכנסת הקמה | `project.financials.totalValue` | Number |
| ריטיינר חודשי | `project.expectedMrr` | Number |
| חטיבה עסקית | `project.productType` | Reverse enum mapping |
| תאריך יעד למסירה | `project.endDate` | Date |

## סדר ביצוע
1. עדכון Project model — הוספת `notionLastEditedAt`
2. שכתוב `notionService.js` — מיפוי חדש + reverse mapping
3. שכתוב `notionSyncService.js` — הוספת polling cron + pull logic
4. עדכון `.env` — NOTION_DATABASE_ID חדש
5. בדיקה: sync-all לסנכרון ראשוני CRM→Notion
6. בדיקה: שינוי ידני ב-Notion ווידוא שהוא מגיע ל-MongoDB
