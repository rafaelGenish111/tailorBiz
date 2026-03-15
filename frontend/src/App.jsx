import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error handling
import ErrorBoundary from './components/ErrorBoundary';

// Import themes
import { theme } from './theme/theme';
import adminTheme from './admin/styles/adminTheme';

// Import pages
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import About from './pages/About';
import Articles from './pages/Articles';
import ArticlePage from './pages/ArticlePage';
import OurClients from './pages/OurClients';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ROICalculatorPage from './pages/ROICalculatorPage';
import ServicesPage from './pages/services/ServicesPage';
import SaasCreators from './pages/services/SaasCreators';
import AiInstitutions from './pages/services/AiInstitutions';
import AdminPanel from './admin/pages/AdminPanel';
import LoginPage from './admin/pages/LoginPage';
import BootstrapAdminPage from './admin/pages/BootstrapAdminPage';
import RequireAdminAuth from './admin/components/auth/RequireAdminAuth';
import SignDocumentPage from './pages/SignDocumentPage';
import SalesOnboarding from './pages/SalesOnboarding';
import PartnershipPitch from './pages/PartnershipPitch';
import LandingPage from './components/LandingPage';
import ProductLayout from './pages/products/ProductLayout';
import ProductOverview from './pages/products/ProductOverview';
import ProductTechnologies from './pages/products/ProductTechnologies';
import ProductDemo from './pages/products/ProductDemo';
import ProductFeatures from './pages/products/ProductFeatures';
import ProductContact from './pages/products/ProductContact';

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
  const location = useLocation();

  // Digital Signature page - fully standalone, rendered outside main Routes
  // to avoid React Router v7 splat route ranking issue
  if (location.pathname.startsWith('/sign/')) {
    return (
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/sign/:token" element={<SignDocumentPage />} />
        </Routes>
      </QueryClientProvider>
    );
  }

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Standalone (no Header/Footer) */}
        <Route
          path="/sales-training"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <SalesOnboarding />
            </ThemeProvider>
          }
        />
        <Route
          path="/partnership-pitch"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <PartnershipPitch />
            </ThemeProvider>
          }
        />
        <Route
          path="/audit-offer"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <LandingPage />
            </ThemeProvider>
          }
        />

        {/* Product mini-sites (standalone, no main Layout) */}
        <Route
          path="/products/:productId"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ProductLayout />
            </ThemeProvider>
          }
        >
          <Route index element={<ProductOverview />} />
          <Route path="technologies" element={<ProductTechnologies />} />
          <Route path="demo" element={<ProductDemo />} />
          <Route path="features" element={<ProductFeatures />} />
          <Route path="contact" element={<ProductContact />} />
        </Route>

        {/* Admin Routes — must be before public catch-all */}
        <Route
          path="/admin/*"
          element={
            <ThemeProvider theme={adminTheme}>
              <CssBaseline />
              <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="setup" element={<BootstrapAdminPage />} />
                <Route
                  path="*"
                  element={
                    <RequireAdminAuth>
                      <AdminPanel />
                    </RequireAdminAuth>
                  }
                />
              </Routes>
            </ThemeProvider>
          }
        />

        {/* Public Routes — catch-all must be last */}
        <Route
          path="/*"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Articles />} />
                  <Route path="/blog/:slug" element={<ArticlePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/saas-creators" element={<SaasCreators />} />
                  <Route path="/services/ai-institutions" element={<AiInstitutions />} />
                  <Route path="/clients" element={<OurClients />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/roi-calculator" element={<ROICalculatorPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ThemeProvider>
          }
        />
      </Routes>

      <ToastContainer position="top-left" autoClose={2000} hideProgressBar={true} rtl={true} theme="dark" />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
