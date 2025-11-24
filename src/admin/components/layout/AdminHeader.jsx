import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle as AccountIcon } from '@mui/icons-material';

function AdminHeader() {
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
          <IconButton color="inherit">
            <NotificationsIcon />
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




