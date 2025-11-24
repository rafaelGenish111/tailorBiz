import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  RateReview as TestimonialsIcon,
  Article as BlogIcon,
  Business as PortfolioIcon,
  ShoppingCart as ProductsIcon,
  People as ClientsIcon,
  Settings as SettingsIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  ViewKanban as KanbanIcon,
  AutoAwesome as NurturingIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: 'דשבורד', icon: <DashboardIcon />, path: '/admin' },
  { divider: true, label: 'משימות ותזכורות' },
  { text: 'סדר היום שלי', icon: <TodayIcon />, path: '/admin/today' },
  { text: 'יומן', icon: <CalendarIcon />, path: '/admin/calendar' },
  { text: 'לוח משימות', icon: <KanbanIcon />, path: '/admin/tasks' },
  { divider: true, label: 'אוטומציות טיפוח' },
  { text: 'אוטומציות טיפוח', icon: <NurturingIcon />, path: '/admin/nurturing' },
  { text: 'רצפים פעילים', icon: <TimelineIcon />, path: '/admin/nurturing/active' },
  { divider: true, label: 'ניהול תוכן' },
  { text: 'המלצות', icon: <TestimonialsIcon />, path: '/admin/testimonials' },
  { text: 'מאמרים', icon: <BlogIcon />, path: '/admin/blog' },
  { text: 'תיק עבודות', icon: <PortfolioIcon />, path: '/admin/portfolio' },
  { text: 'מוצרים', icon: <ProductsIcon />, path: '/admin/products' },
  { divider: true, label: 'ניהול לקוחות' },
  { text: 'לקוחות', icon: <ClientsIcon />, path: '/admin/clients' },
  { divider: true, label: 'הגדרות' },
  { text: 'הגדרות', icon: <SettingsIcon />, path: '/admin/settings' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
          bgcolor: 'primary.main',
          color: 'white',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          TailorBiz Admin
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index} sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ px: 2, color: 'rgba(255,255,255,0.5)' }}>
                  {item.label}
                </Typography>
              </Box>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;

