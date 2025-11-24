import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import AccessibilityMenu from './AccessibilityMenu';
import CookieConsent from './CookieConsent';
import ChatBot from '../chatbot/ChatBot';

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
      <AccessibilityMenu />
      <ChatBot />
      <CookieConsent />
    </Box>
  );
}

export default Layout;
