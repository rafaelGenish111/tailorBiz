# Frontend Admin - מודול ניהול המלצות

## התקנה

1. התקן את החבילות הנדרשות:
```bash
npm install @tanstack/react-query axios react-toastify @mui/x-data-grid
```

2. הוסף ל-`.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## שימוש

### ייבוא הקומפוננט

```jsx
import TestimonialsList from './admin/components/content/testimonials/TestimonialsList';

function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestimonialsList />
    </QueryClientProvider>
  );
}
```

### הגדרת React Query

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

## תכונות

- ✅ טבלה עם כל ההמלצות
- ✅ חיפוש וסינון לפי סטטוס
- ✅ הוספה/עריכה/מחיקה של המלצות
- ✅ אישור/דחייה של המלצות
- ✅ העלאת תמונות
- ✅ דירוג (rating)
- ✅ Pagination
- ✅ Responsive design

## מבנה הקבצים

```
src/admin/
├── utils/
│   └── api.js                    # הגדרת axios ו-API calls
├── hooks/
│   └── useTestimonials.js        # React Query hooks
└── components/
    ├── common/
    │   └── ConfirmDialog.jsx     # דיאלוג אישור
    └── content/
        └── testimonials/
            ├── TestimonialsList.jsx   # רשימת ההמלצות
            └── TestimonialForm.jsx    # טופס הוספה/עריכה
```

## הערות

- יש לוודא שה-Backend רץ על `http://localhost:5000`
- יש להגדיר JWT token ב-localStorage תחת המפתח `token`
- הקומפוננטים משתמשים ב-Material-UI ו-DataGrid

