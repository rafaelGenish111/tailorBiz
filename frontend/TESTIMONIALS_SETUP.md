# 🎯 הוראות התקנה והרצה - מודול ניהול המלצות

## ✅ מה נוצר

### Backend (Node.js + Express + MongoDB)
- ✅ מודל Testimonial עם כל השדות הנדרשים
- ✅ Controllers מלאים (CRUD + אישור/דחייה + סידור מחדש)
- ✅ Routes מוגדרים
- ✅ Middleware להעלאת תמונות
- ✅ Middleware לאימות (זמני - יש להחליף ב-JWT אמיתי)
- ✅ חיבור ל-MongoDB

### Frontend (React + Material-UI)
- ✅ API utilities עם axios
- ✅ React Query hooks
- ✅ קומפוננט TestimonialsList (טבלה מלאה)
- ✅ קומפוננט TestimonialForm (טופס הוספה/עריכה)
- ✅ קומפוננט ConfirmDialog
- ✅ תמיכה בהעלאת תמונות
- ✅ חיפוש, סינון, pagination

---

## 📦 שלב 1: התקנת Backend

```bash
cd backend
npm install
```

**חבילות שהותקנו:**
- express, mongoose, dotenv, cors, helmet, express-rate-limit, multer
- nodemon (dev dependency)

---

## 🗄️ שלב 2: הגדרת MongoDB

1. **התקן MongoDB** (אם עדיין לא מותקן):
   - macOS: `brew install mongodb-community`
   - או הורד מ: https://www.mongodb.com/try/download/community

2. **הרץ MongoDB**:
   ```bash
   mongod
   ```

3. **או השתמש ב-MongoDB Atlas** (cloud):
   - עדכן את `MONGODB_URI` ב-`.env`

---

## ⚙️ שלב 3: הגדרת משתני סביבה

קובץ `backend/.env` כבר קיים עם:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bizflow-admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:5173
```

**חשוב:** שנה את `JWT_SECRET` למפתח אקראי חזק!

---

## 🚀 שלב 4: הרצת Backend

```bash
cd backend
npm run dev
```

השרת ירוץ על: `http://localhost:5000`

**בדיקת תקינות:**
```bash
curl http://localhost:5000/health
```

---

## 🎨 שלב 5: התקנת Frontend Dependencies

**חבילות שהותקנו:**
- @tanstack/react-query
- react-toastify
- @mui/x-data-grid

---

## 🔧 שלב 6: הגדרת Frontend

1. **הוסף ל-`.env` (בתיקיית השורש):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **הגדר React Query ב-`main.jsx` או `App.jsx`:**
   ```jsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { ToastContainer } from 'react-toastify';
   import 'react-toastify/dist/ReactToastify.css';

   const queryClient = new QueryClient();

   function App() {
     return (
       <QueryClientProvider client={queryClient}>
         {/* Your app */}
         <ToastContainer position="top-right" rtl />
       </QueryClientProvider>
     );
   }
   ```

3. **שימוש בקומפוננט:**
   ```jsx
   import TestimonialsList from './admin/components/content/testimonials/TestimonialsList';

   function AdminPage() {
     return <TestimonialsList />;
   }
   ```

---

## 📝 שלב 7: בדיקות

### 1. בדיקת Backend API:

```bash
# Health check
curl http://localhost:5000/health

# Get public testimonials
curl http://localhost:5000/api/testimonials/public
```

### 2. בדיקת Frontend:

1. הרץ את ה-Frontend: `npm run dev`
2. פתח את דף הניהול
3. נסה להוסיף המלצה חדשה
4. נסה לערוך/למחוק המלצה
5. נסה לאשר/לדחות המלצה

---

## 🔐 הערות חשובות

### Authentication
- ה-middleware `auth.middleware.js` הוא **זמני** - הוא לא בודק JWT אמיתי
- יש להחליף אותו עם JWT middleware אמיתי
- כרגע כל הבקשות עוברות (req.user.id = 'temp-user-id')

### MongoDB
- ודא ש-MongoDB רץ לפני הרצת ה-Backend
- אם יש שגיאת חיבור, בדוק את `MONGODB_URI` ב-`.env`

### תמונות
- התמונות נשמרות ב-`backend/uploads/images/`
- ודא שהתיקייה קיימת
- התמונות נגישות דרך: `http://localhost:5000/uploads/images/...`

---

## 📚 API Endpoints

### Public
- `GET /api/testimonials/public` - המלצות מאושרות לציבור

### Protected (דורש token)
- `GET /api/testimonials?page=1&limit=10&search=...&status=...`
- `GET /api/testimonials/:id`
- `POST /api/testimonials` (multipart/form-data)
- `PUT /api/testimonials/:id` (multipart/form-data)
- `DELETE /api/testimonials/:id`
- `PATCH /api/testimonials/reorder`
- `PATCH /api/testimonials/:id/status` (Admin only)

---

## 🐛 פתרון בעיות

### שגיאת חיבור MongoDB
```
❌ MongoDB connection error
```
**פתרון:** ודא ש-MongoDB רץ: `mongod`

### שגיאת CORS
```
Access-Control-Allow-Origin
```
**פתרון:** בדוק ש-`CLIENT_URL` ב-`.env` נכון

### שגיאת העלאת תמונה
```
Multer error
```
**פתרון:** ודא שהתיקייה `backend/uploads/images/` קיימת

### Frontend לא מתחבר ל-Backend
**פתרון:** 
1. בדוק ש-`VITE_API_URL` ב-`.env` נכון
2. ודא שה-Backend רץ
3. בדוק את ה-console לדרישות נכשלות

---

## 📁 מבנה הקבצים

```
backend/
├── src/
│   ├── config/database.js
│   ├── models/Testimonial.js
│   ├── controllers/testimonialController.js
│   ├── routes/testimonials.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js (זמני!)
│   │   └── upload.middleware.js
│   └── app.js
├── uploads/images/
├── server.js
└── .env

src/admin/
├── utils/api.js
├── hooks/useTestimonials.js
└── components/
    ├── common/ConfirmDialog.jsx
    └── content/testimonials/
        ├── TestimonialsList.jsx
        └── TestimonialForm.jsx
```

---

## ✅ מה עוד צריך לעשות?

1. **להחליף את auth.middleware.js** עם JWT אמיתי
2. **להוסיף מודל User** אם עדיין לא קיים
3. **להוסיף דף Login** לניהול
4. **להוסיף Drag & Drop** לסידור מחדש (אופציונלי)
5. **להוסיף בדיקות** (unit tests, integration tests)

---

## 🎉 סיכום

המודול מוכן לשימוש! כל הקבצים נוצרו והחבילות הותקנו.

**השלבים הבאים:**
1. הרץ MongoDB
2. הרץ Backend: `cd backend && npm run dev`
3. הרץ Frontend: `npm run dev`
4. פתח את דף הניהול ונסה!

**שאלות?** בדוק את ה-README בקבצים:
- `backend/README.md`
- `src/admin/README.md`

