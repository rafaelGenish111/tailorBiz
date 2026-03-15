import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme, IconButton, AppBar, Toolbar, Typography, Avatar } from '@mui/material';
import { Menu as MenuIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import BottomNav from './BottomNav';
import PWAInstallBanner from './PWAInstallBanner';
import QuickAddFAB from '../../../components/common/QuickAddFAB';
import { useIsStandalone } from '../../hooks/usePWA';

const DRAWER_WIDTH = 260;
const BOTTOM_NAV_HEIGHT = 60;

// Map routes to Hebrew page titles for the mobile header
const pageTitles = {
  '/admin': 'דשבורד',
  '/admin/leads': 'לידים',
  '/admin/customers': 'לקוחות',
  '/admin/clients': 'לקוחות',
  '/admin/projects': 'פרויקטים',
  '/admin/settings': 'הגדרות',
  '/admin/employees': 'עובדים',
  '/admin/whatsapp-setup': 'WhatsApp',
  '/admin/whatsapp-broadcast': 'WhatsApp שליחה',
  '/admin/bot-config': 'בוט AI',
  '/admin/articles': 'מאמרים',
};

function getPageTitle(pathname) {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Check parent route (e.g. /admin/clients/123 → 'לקוחות')
  const parts = pathname.split('/');
  while (parts.length > 2) {
    parts.pop();
    const parent = parts.join('/');
    if (pageTitles[parent]) return pageTitles[parent];
  }
  return 'TailorBiz';
}

function isDetailPage(pathname) {
  // Detail pages have more than 2 path segments: /admin/clients/:id
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  return segments.length > 2;
}

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isStandalone = useIsStandalone();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const showBackButton = isMobile && isDetailPage(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
        // Prevent overscroll bounce on iOS standalone
        ...(isStandalone && {
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch',
        }),
      }}
    >
      <CssBaseline />

      {/* Mobile: App-style top bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: '#232f3e',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            // Safe area for notch (iPhone)
            pt: 'env(safe-area-inset-top, 0px)',
          }}
        >
          <Toolbar sx={{ minHeight: 56, gap: 0.5 }}>
            {showBackButton ? (
              <IconButton
                color="inherit"
                aria-label="חזור"
                edge="start"
                onClick={() => navigate(-1)}
                sx={{ mr: 0.5 }}
              >
                <BackIcon />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                aria-label="תפריט"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flex: 1, fontWeight: 600, fontSize: '1.05rem' }}
            >
              {pageTitle}
            </Typography>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: '#ec7211',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/admin/settings')}
            >
              A
            </Avatar>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && <AdminHeader />}

      {/* Sidebar - temporary on mobile, permanent on desktop */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          // Top spacing: mobile AppBar + safe area
          mt: isMobile ? '56px' : 0,
          pt: isMobile ? 'env(safe-area-inset-top, 0px)' : 0,
          // Bottom spacing: bottom nav + safe area on mobile
          pb: isMobile ? `${BOTTOM_NAV_HEIGHT + 8}px` : 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // Smooth scrolling for app feel
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Spacer for fixed header on desktop */}
        {!isMobile && <Toolbar />}

        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNav />}

      {/* Quick Add FAB - positioned above bottom nav on mobile */}
      <QuickAddFAB />

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </Box>
  );
};

export default AdminLayout;
