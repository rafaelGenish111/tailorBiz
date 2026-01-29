# הרצה מקומית (פיתוח)

## למה 404 על `/api/auth/*`?

אם אתה מקבל 404 על `/api/auth/bootstrap-needed` או `/api/auth/login`, סביר ש**על פורט 5000 רץ שרת של פרויקט אחר** (למשל my-clinic-saas), ולא השרת של bizflow-website.

## הפתרון

הפרויקט הזה מוגדר לרוץ על **פורט 5001** (לא 5000), כדי שלא יתנגש עם פרויקטים אחרים.

### 1. הפעלת השרת (Backend)

```bash
cd backend
npm run dev
```

השרת יעלה על **http://localhost:5001** (מוגדר ב-`backend/.env` כ-`PORT=5001`).

### 2. הפעלת ה-Frontend

```bash
cd frontend
npm run dev
```

ה-Vite proxy מעביר בקשות מ-`/api` ל-`http://localhost:5001`, כך שההתחברות תעבוד.

### 3. התחברות

גלוש ל-**http://localhost:5173/admin/login** והתחבר עם שם המשתמש והסיסמה.

---

**אם עדיין 404:** וודא שאין תהליך אחר על פורט 5001, והפעל את השרת מתוך תיקיית `backend` של הפרויקט הזה.
