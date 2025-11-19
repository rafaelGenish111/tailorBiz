# TailorBiz - מערכת ניהול אוטומטית מותאמת אישית

![TailorBiz](https://img.shields.io/badge/TailorBiz-מערכת%20ניהול-00bcd4?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-0081CB?style=for-the-badge&logo=mui)

## 📖 תיאור

**TailorBiz** היא מערכת ניהול אוטומטית מותאמת אישית לעסקים קטנים ובינוניים. המערכת מאפשרת:

- ✅ חיסכון של 10+ שעות עבודה שבועיות
- ✅ החזרת לקוחות שהלכו לאיבוד
- ✅ ניהול אוטומטי של תהליכים עסקיים
- ✅ התאמה מושלמת לצרכי העסק שלכם

---

## 🚀 התקנה והרצה

### דרישות מקדימות

- Node.js (גרסה 16 ומעלה)
- npm או yarn

### התקנת הפרויקט

```bash
# שלב 1: צור את הפרויקט
npm create vite@latest tailorbiz-website -- --template react
cd tailorbiz-website

# שלב 2: התקן חבילות
npm install

# שלב 3: התקן חבילות נוספות
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
npm install framer-motion
npm install react-intersection-observer
npm install js-cookie
npm install stylis stylis-plugin-rtl

# שלב 4: הרץ את הפרויקט
npm run dev
```

---

## 📁 מבנה הפרויקט

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx          # כותרת עליונה עם ניווט
│   │   ├── Footer.jsx          # פוטר עם פרטי יצירת קשר
│   │   ├── Layout.jsx          # Layout עיקרי
│   │   ├── AccessibilityMenu.jsx
│   │   └── CookieConsent.jsx
│   ├── home/
│   │   ├── HeroSection.jsx
│   │   ├── ProcessFlowTimeline.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── StatsSection.jsx
│   │   └── TestimonialsSection.jsx
│   ├── chatbot/
│   │   └── ChatBot.jsx
│   └── common/
│       └── AnimatedSection.jsx
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Pricing.jsx
│   └── Contact.jsx
├── theme/
│   └── theme.js               # ערכת נושא Material-UI
├── utils/
│   ├── accessibility.js       # פונקציות נגישות
│   └── constants.js           # קבועים גלובליים
├── App.jsx                    # קומפוננטה ראשית
└── main.jsx                   # נקודת כניסה
```

---

## 🎨 עיצוב ונושא

הפרויקט משתמש ב-Material-UI עם ערכת נושא מותאמת אישית:

### צבעים עיקריים

- **Primary (כחול נייבי):** `#1a237e`
- **Secondary (טורקיז):** `#00bcd4`
- **Background:** `#ffffff`

### פונטים

- **Heebo** - פונט ראשי (תומך בעברית)
- משקלים: 300, 400, 500, 600, 700, 800, 900

---

## ✨ תכונות מרכזיות

### 1. **תמיכה ב-RTL (Right-to-Left)**
המערכת תומכת מלאה בכיווניות מימין לשמאל לשפה העברית.

### 2. **אנימציות**
- Framer Motion לאנימציות חלקות
- React Intersection Observer לאנימציות בגלילה

### 3. **נגישות**
- תפריט נגישות עם אפשרויות:
  - שינוי גודל טקסט
  - ניגודיות גבוהה
  - הדגשת קישורים
  - סמן עכבר מוגדל

### 4. **רספונסיבי**
- תומך במסכים מ-320px ועד 4K
- תפריט מותאם למובייל

### 5. **קרוסלת המלצות**
- החלפה אוטומטית כל 5 שניות
- 3 כרטיסים בשורה (האמצעי מוגדל)
- ניווט ידני עם חצים

### 6. **צ'אט בוט**
- עוזר דיגיטלי עם לוגיקה בסיסית
- תמיכה בשאלות נפוצות

---

## 🛠️ טכנולוגיות

| טכנולוגיה | גרסה | תיאור |
|-----------|------|-------|
| React | 18.x | ספריית UI |
| Material-UI | 5.x | ספריית קומפוננטות |
| React Router | 6.x | ניתוב |
| Framer Motion | 10.x | אנימציות |
| Emotion | 11.x | CSS-in-JS |
| Stylis | 4.x | RTL Support |

---

## 📄 קבצי תצורה מרכזיים

### `src/theme/theme.js`
מגדיר את ערכת הנושא של Material-UI:
- צבעים
- טיפוגרפיה
- צללים
- רדיוסים
- התנהגות קומפוננטות

### `src/utils/constants.js`
קבועים גלובליים:
```javascript
export const COMPANY_INFO = {
  name: 'TailorBiz',
  email: 'info@tailorbiz.com',
  phone: '03-1234567',
  address: 'תל אביב, ישראל',
};
```

### `src/utils/accessibility.js`
פונקציות לניהול נגישות:
- `applyAccessibility()` - החלת הגדרות נגישות
- `getAccessibilitySettings()` - קריאת הגדרות מ-localStorage

---

## 🌐 דפים

### 1. **דף הבית** (`/`)
- HeroSection - כותרת ראשית עם CTA
- ProcessFlowTimeline - תהליך העבודה
- FeaturesSection - תכונות עיקריות (6 כרטיסים)
- StatsSection - סטטיסטיקות
- TestimonialsSection - המלצות לקוחות (קרוסלה)

### 2. **אודות** (`/about`)
- מי אנחנו
- החזון שלנו
- יתרונות תחרותיים
- איך המערכת עובדת

### 3. **תמחור** (`/pricing`)
- חבילות מחירים
- השוואה בין תכניות

### 4. **צור קשר** (`/contact`)
- טופס יצירת קשר
- פרטי התקשרות

---

## 🎯 SEO ונגישות

### Meta Tags
```html
<meta name="description" content="TailorBiz - מערכת ניהול אוטומטית לעסקים..." />
<meta name="keywords" content="אוטומציה לעסקים, CRM, ניהול לקוחות..." />
<meta property="og:title" content="TailorBiz - מערכת ניהול אוטומטית" />
```

### Accessibility
- ARIA labels על כל האלמנטים
- תמיכה במקלדת
- ניגוד צבעים מספיק
- טקסטים חלופיים לתמונות

---

## 🚀 פריסה (Deployment)

### Vite Build

```bash
npm run build
```

הקבצים יופקו בתיקיית `dist/`

### Netlify / Vercel

1. חבר את ה-repository ל-Netlify/Vercel
2. הגדר:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Deploy!

---

## 🤝 תרומה

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

---

## 📝 רישיון

הפרויקט הזה הוא קוד פתוח תחת רישיון MIT.

---

## 📧 יצירת קשר

- **Email:** info@tailorbiz.com
- **טלפון:** 03-1234567
- **כתובת:** תל אביב, ישראל

---

## 🙏 תודות

- [Material-UI](https://mui.com/) - ספריית UI מעולה
- [Framer Motion](https://www.framer.com/motion/) - אנימציות חלקות
- [Vite](https://vitejs.dev/) - Build tool מהיר
- [React](https://react.dev/) - ספריית הליבה

---

**נבנה עם ❤️ על ידי צוות TailorBiz**
