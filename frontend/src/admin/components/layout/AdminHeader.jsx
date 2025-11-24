import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Badge } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle as AccountIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useTasks';

function AdminHeader() {
  const navigate = useNavigate();
  const { data: notificationsResponse } = useNotifications({ read: false });
  const unreadCount = notificationsResponse?.unreadCount || 0;

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
      elevation={0}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ניהול מערכת
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={() => navigate('/admin/notifications')}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountIcon />
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AdminHeader;

