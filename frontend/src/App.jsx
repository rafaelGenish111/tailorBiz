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
import AdminPanel from './admin/pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
