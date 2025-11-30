import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import QuickAddFAB from '../../../components/common/QuickAddFAB';

const DRAWER_WIDTH = 260;

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      
      {/* Mobile Header Toggle */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              TailorBiz
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && <AdminHeader />}

      {/* Sidebar Component */}
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
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: isMobile ? 8 : 0, // Add margin top on mobile for the AppBar
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Spacer for fixed header on desktop */}
        {!isMobile && <Toolbar />}
        
        <Box sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>

      {/* Quick Add FAB */}
      <QuickAddFAB />
    </Box>
  );
};

export default AdminLayout;
