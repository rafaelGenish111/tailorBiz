import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import themes
import { theme } from './theme/theme';
import adminTheme from './admin/styles/adminTheme';

// Import pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPanel from './admin/pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // לא לעשות refetch אוטומטי בעת טעינה מחדש
      refetchOnReconnect: false, // לא לעשות refetch בעת חיבור מחדש
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - נתונים נשארים "טריים" למשך 5 דקות
      gcTime: 10 * 60 * 1000, // 10 minutes - cache נשמר למשך 10 דקות (לשעבר cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                </Routes>
              </Layout>
            </ThemeProvider>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ThemeProvider theme={adminTheme}>
              <CssBaseline />
              <AdminPanel />
            </ThemeProvider>
          }
        />
      </Routes>

      <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} rtl={true} />
    </QueryClientProvider>
  );
}

export default App;
