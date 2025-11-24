# 🎯 הנחיות מלאות לבניית פרויקט TailorBiz ב-Cursor

מדריך שלב אחר שלב לבניית אתר TailorBiz - מערכת ניהול אוטומטית מותאמת אישית.

---

## 📋 תוכן עניינים

1. [הקמת הפרויקט הבסיסי](#שלב-1-הקמת-הפרויקט-הבסיסי)
2. [יצירת מבנה התיקיות](#שלב-2-יצירת-מבנה-התיקיות)
3. [קבצי תצורה בסיסיים](#שלב-3-8-קבצי-תצורה)
4. [קומפוננטות Layout](#שלב-9-14-קומפוננטות-layout)
5. [קומפוננטות Home](#שלב-15-20-קומפוננטות-home)
6. [דפים נוספים](#שלב-21-24-דפים)
7. [הרצה ופריסה](#שלב-25-הרצה)

---

## שלב 1: הקמת הפרויקט הבסיסי

### 1.1 יצירת פרויקט Vite

```bash
npm create vite@latest tailorbiz-website -- --template react
cd tailorbiz-website
npm install
```

### 1.2 התקנת חבילות Material-UI

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

### 1.3 התקנת חבילות נוספות

```bash
npm install react-router-dom
npm install framer-motion
npm install react-intersection-observer
npm install js-cookie
npm install stylis stylis-plugin-rtl
```

### 1.4 ניקוי קבצים מיותרים

מחק את הקבצים הבאים:
- `src/App.css`
- `src/index.css`

---

## שלב 2: יצירת מבנה התיקיות

### 2.1 מבנה תיקיות מלא

צור את המבנה הבא תחת `src/`:

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
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
│   └── theme.js
├── utils/
│   ├── accessibility.js
│   └── constants.js
├── App.jsx
└── main.jsx
```

### 2.2 יצירת תיקיות

```bash
mkdir -p src/components/layout
mkdir -p src/components/home
mkdir -p src/components/chatbot
mkdir -p src/components/common
mkdir -p src/pages
mkdir -p src/theme
mkdir -p src/utils
```

---

## שלב 3: עדכון index.html

החלף את תוכן `index.html`:

```html
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="TailorBiz - מערכת ניהול אוטומטית לעסקים קטנים ובינוניים. חיסכון של 10+ שעות שבועיות והחזרת לקוחות שהלכו לאיבוד." />
    <meta name="keywords" content="אוטומציה לעסקים, CRM, ניהול לקוחות, תזכורות אוטומטיות, ניהול תורים" />
    <meta name="author" content="TailorBiz" />
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="TailorBiz - מערכת ניהול אוטומטית" />
    <meta property="og:description" content="חוסכת 10+ שעות שבועיות ומחזירה לקוחות" />
    <meta property="og:url" content="https://yourdomain.com" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <title>TailorBiz - מערכת ניהול אוטומטית לעסקים</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## שלב 4: src/theme/theme.js

ראה קובץ `src/theme/theme.js` בפרויקט.

**תכונות עיקריות:**
- תמיכה ב-RTL
- פלטה: כחול (#1a237e) + תכלת (#00bcd4)
- פונט Heebo
- Shadows מותאמים
- Component overrides

---

## שלב 5: src/utils/accessibility.js

ראה קובץ `src/utils/accessibility.js` בפרויקט.

**פונקציות:**
- `applyAccessibility()` - החלת הגדרות נגישות
- `getAccessibilitySettings()` - קריאת הגדרות
- תמיכה בגודל טקסט, ניגודיות, cursor גדול

---

## שלב 6: src/utils/constants.js

```javascript
export const COMPANY_INFO = {
  name: 'TailorBiz',
  email: 'info@tailorbiz.com',
  phone: '03-1234567',
  address: 'תל אביב, ישראל',
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/tailorbiz',
  linkedin: 'https://linkedin.com/company/tailorbiz',
  instagram: 'https://instagram.com/tailorbiz',
  twitter: 'https://twitter.com/tailorbiz',
};

export const NAV_ITEMS = [
  { label: 'אודות', path: '/about' },
  { label: 'תכונות', path: '/#features' },
  { label: 'תמחור', path: '/pricing' },
  { label: 'צור קשר', path: '/contact' },
];
```

---

## שלב 7: src/main.jsx

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import App from './App'
import { theme } from './theme/theme'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
)
```

---

## שלב 8: src/App.jsx

```javascript
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Layout>
  );
}

export default App;
```

---

## שלב 9: src/components/common/AnimatedSection.jsx

ראה קובץ בפרויקט - קומפוננטה לאנימציות עם `framer-motion` ו-`useInView`.

---

## שלבים 10-16: קומפוננטות Layout & Home

כל הקומפוננטות הבאות זמינות בפרויקט:

### Layout:
- ✅ `Header.jsx` - כותרת עליונה
- ✅ `Footer.jsx` - פוטר עם 4 עמודות
- ✅ `Layout.jsx` - Layout ראשי
- ✅ `AccessibilityMenu.jsx` - תפריט נגישות
- ✅ `CookieConsent.jsx` - הסכמה לעוגיות

### Home:
- ✅ `HeroSection.jsx` - סקשן ראשי
- ✅ `ProcessFlowTimeline.jsx` - timeline תהליך
- ✅ `FeaturesSection.jsx` - 6 תכונות
- ✅ `StatsSection.jsx` - סטטיסטיקות
- ✅ `TestimonialsSection.jsx` - קרוסלת המלצות

### ChatBot:
- ✅ `ChatBot.jsx` - צ'אט בוט אינטראקטיבי

---

## שלבים 17-20: דפים

### src/pages/Home.jsx

```javascript
import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

const Home = () => {
  return (
    <Box>
      <HeroSection />
      <ProcessFlowTimeline />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
    </Box>
  );
};

export default Home;
```

### src/pages/About.jsx
### src/pages/Pricing.jsx
### src/pages/Contact.jsx

ראה קבצים בפרויקט.

---

## שלב 21: public/robots.txt

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## שלב 22: הרצה והבדיקות

### הרצה במצב פיתוח

```bash
npm run dev
```

האתר יהיה זמין ב: http://localhost:5173

### בדיקות

1. **בדוק שאין שגיאות:**
```bash
npm run build
```

2. **בדוק responsive:**
   - פתח Developer Tools (F12)
   - Toggle Device Toolbar (Ctrl+Shift+M)
   - בדוק מסכים: 320px, 768px, 1024px, 1920px

3. **בדוק נגישות:**
   - לחץ על כפתור הנגישות (שמאל)
   - נסה לשנות גודל טקסט
   - נסה ניגודיות גבוהה

4. **בדוק ChatBot:**
   - לחץ על הכפתור (ימין תחתון)
   - שלח הודעות: "תמחור", "דמו", "תכונות"

5. **בדוק קרוסלת המלצות:**
   - עוברת אוטומטית כל 5 שניות
   - ניתן לשלוט עם חצים
   - במובייל: כרטיס אחד

---

## שלב 23: פריסה (Deployment)

### Netlify

1. התחבר ל-[Netlify](https://netlify.com)
2. "New site from Git"
3. בחר את ה-repository
4. הגדרות:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Deploy!

### Vercel

1. התחבר ל-[Vercel](https://vercel.com)
2. "New Project"
3. Import Git Repository
4. הגדרות:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Deploy!

---

## 🎯 תכונות מרכזיות

### ✨ עיצוב
- [x] עיצוב הייטקי לבן וצבעוני
- [x] RTL מלא לעברית
- [x] Responsive מ-320px עד 4K
- [x] אנימציות חלקות עם Framer Motion

### ♿ נגישות
- [x] תפריט נגישות מלא
- [x] ARIA labels
- [x] תמיכה במקלדת
- [x] ניגוד צבעים גבוה

### 🚀 ביצועים
- [x] Code splitting
- [x] Lazy loading
- [x] Optimized images
- [x] SEO ready

### 💬 אינטראקטיביות
- [x] ChatBot חכם
- [x] קרוסלת המלצות
- [x] Cookie consent
- [x] טפסים מובנים

---

## 📚 משאבים נוספים

- [React Documentation](https://react.dev/)
- [Material-UI Docs](https://mui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 🐛 פתרון בעיות נפוצות

### בעיה: שגיאת RTL
**פתרון:** ודא ש-`stylis` ו-`stylis-plugin-rtl` מותקנים:
```bash
npm install stylis stylis-plugin-rtl
```

### בעיה: פונטים לא נטענים
**פתרון:** בדוק שהקישורים ל-Google Fonts ב-`index.html` תקינים.

### בעיה: אנימציות לא עובדות
**פתרון:** ודא ש-`framer-motion` מותקן:
```bash
npm install framer-motion
```

### בעיה: ChatBot לא מופיע
**פתרון:** ודא ש-`Layout.jsx` כולל את `<ChatBot />`.

---

## ✅ Checklist סופי

- [ ] הפרויקט רץ ללא שגיאות (`npm run dev`)
- [ ] כל הדפים נגישים (/, /about, /pricing, /contact)
- [ ] Header responsive עם תפריט מובייל
- [ ] Footer עם קישורים פעילים
- [ ] קרוסלת המלצות עובדת
- [ ] ChatBot עונה על שאלות
- [ ] תפריט נגישות פועל
- [ ] Cookie consent מופיע
- [ ] אנימציות חלקות
- [ ] RTL עובד בכל מקום
- [ ] Build עובר בהצלחה (`npm run build`)

---

**נבנה עם ❤️ עבור TailorBiz**

_מערכת ניהול אוטומטית מותאמת אישית לעסקים קטנים ובינוניים_

