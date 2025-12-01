import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Badge, InputBase, alpha, useTheme, Button } from '@mui/material';
import { Notifications as NotificationsIcon, Search as SearchIcon, Menu as MenuIcon, HelpOutline as HelpIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useTasks';

function AdminHeader() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: notificationsResponse } = useNotifications({ read: false });
  const unreadCount = notificationsResponse?.unreadCount || 0;

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main', // Dark Navy
        color: 'white',
      }}
      elevation={0}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1 }}>
        {/* Logo / Brand + Dashboard button (mobile) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: 'auto', md: 260 },
            flexShrink: 0
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer' }}
            onClick={() => navigate('/admin/dashboard')}
          >
            TailorBiz <Box component="span" sx={{ color: 'secondary.main' }}>Admin</Box>
          </Typography>

          {/* Mobile Dashboard Button */}
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              ml: 1,
              display: { xs: 'inline-flex', md: 'none' },
              textTransform: 'none',
              borderRadius: 999,
              px: 1.5,
            }}
          >
            דשבורד
          </Button>
        </Box>

        {/* Search Bar (AWS Style) */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'flex-start',
            ml: { xs: 0, md: 4 }
          }}
        >
           <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              mr: 2,
              ml: 0,
              width: '100%',
              maxWidth: 600,
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="חיפוש..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  transition: theme.transitions.create('width'),
                  width: '100%',
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="large">
             <HelpIcon />
          </IconButton>

          <IconButton
            color="inherit"
            size="large"
            onClick={() => navigate('/admin/notifications')}
          >
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
             <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.9rem' }}>A</Avatar>
             <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 500 }}>Admin</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AdminHeader;
