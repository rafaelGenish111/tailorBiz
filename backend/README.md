# Backend - מודול ניהול המלצות

## התקנה

1. התקן את החבילות הנדרשות:
```bash
cd backend
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-rate-limit multer joi
npm install --save-dev nodemon
```

2. צור קובץ `.env` (כבר קיים) והגדר את המשתנים הבאים:
   - `MONGODB_URI` - כתובת MongoDB
   - `JWT_SECRET` - מפתח JWT
   - `PORT` - פורט השרת (ברירת מחדל: 5000)

3. ודא ש-MongoDB רץ על המחשב שלך

## הרצה

```bash
# Development mode
npm run dev

# Production mode
npm start
```

השרת ירוץ על `http://localhost:5000`

## API Endpoints

### Public
- `GET /api/testimonials/public` - קבלת המלצות מאושרות לציבור

### Protected (דורש authentication)
- `GET /api/testimonials` - קבלת כל ההמלצות (עם pagination, search, filter)
- `GET /api/testimonials/:id` - קבלת המלצה ספציפית
- `POST /api/testimonials` - יצירת המלצה חדשה
- `PUT /api/testimonials/:id` - עדכון המלצה
- `DELETE /api/testimonials/:id` - מחיקת המלצה
- `PATCH /api/testimonials/reorder` - עדכון סדר ההמלצות (drag & drop)
- `PATCH /api/testimonials/:id/status` - עדכון סטטוס (אישור/דחייה) - Admin only

## מבנה הקבצים

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # חיבור ל-MongoDB
│   ├── models/
│   │   └── Testimonial.js       # מודל ההמלצות
│   ├── controllers/
│   │   └── testimonialController.js  # לוגיקת העסקים
│   ├── routes/
│   │   └── testimonials.routes.js    # הגדרת routes
│   ├── middleware/
│   │   ├── auth.middleware.js        # אימות משתמשים
│   │   └── upload.middleware.js      # העלאת קבצים
│   └── app.js                   # הגדרת Express
├── uploads/
│   └── images/                  # תמונות שהועלו
├── server.js                    # נקודת כניסה
└── package.json
```

## הערות

- Middleware האימות (`auth.middleware.js`) הוא זמני - יש להחליף אותו עם JWT אמיתי
- התמונות נשמרות בתיקייה `uploads/images/`
- יש לוודא שהתיקייה `uploads/images/` קיימת לפני הרצה




