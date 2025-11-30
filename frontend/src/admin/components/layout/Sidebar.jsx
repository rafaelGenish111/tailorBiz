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
  Collapse,
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
  Timeline as ProjectsIcon,
  Timeline as GanttIcon,
  AutoAwesome as NurturingIcon,
  Timeline as TimelineIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  SettingsInputAntenna as ChannelsIcon,
  SmartToy as AutomationsIcon,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'דשבורד', icon: <DashboardIcon />, path: '/admin' },
  { divider: true, label: 'משימות ותזכורות' },
  { text: 'סדר היום שלי', icon: <TodayIcon />, path: '/admin/today' },
  { text: 'יומן', icon: <CalendarIcon />, path: '/admin/calendar' },
  { text: 'לוח משימות', icon: <KanbanIcon />, path: '/admin/tasks' },
  { text: 'פרויקטים', icon: <ProjectsIcon />, path: '/admin/projects' },
  { text: 'לוח גאנט', icon: <GanttIcon />, path: '/admin/gantt' },
  { divider: true, label: 'אוטומציות טיפוח' },
  { 
    text: 'טיפוח לידים', 
    icon: <NurturingIcon />, 
    children: [
      { text: 'אוטומציות', path: '/admin/nurturing' },
      { text: 'רצפים פעילים', path: '/admin/nurturing/active' },
    ]
  },
  { divider: true, label: 'מרכז שיווק' },
  { 
    text: 'מרכז שיווק', 
    icon: <CampaignIcon />, 
    children: [
      { text: 'דשבורד', path: '/admin/marketing' },
      { text: 'קמפיינים', path: '/admin/marketing/campaigns' },
      { text: 'ערוצים', path: '/admin/marketing/channels' },
      { text: 'אוטומציות', path: '/admin/marketing/automations' },
      { text: 'אנליטיקה', path: '/admin/marketing/analytics' },
    ]
  },
  { divider: true, label: 'ניהול תוכן' },
  { text: 'המלצות', icon: <TestimonialsIcon />, path: '/admin/testimonials' },
  { text: 'מאמרים', icon: <BlogIcon />, path: '/admin/blog' },
  { text: 'תיק עבודות', icon: <PortfolioIcon />, path: '/admin/portfolio' },
  { text: 'מוצרים', icon: <ProductsIcon />, path: '/admin/products' },
  { divider: true, label: 'ניהול לידים ולקוחות' },
  { text: 'לידים', icon: <ClientsIcon />, path: '/admin/leads' },
  { text: 'לקוחות', icon: <ClientsIcon />, path: '/admin/customers' },
  { divider: true, label: 'הגדרות' },
  { text: 'הגדרות', icon: <SettingsIcon />, path: '/admin/settings' },
];

function SidebarItem({ item, depth = 0, onItemClick }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if any child is active
  const isChildActive = hasChildren && item.children.some(child => location.pathname === child.path);
  const isActive = location.pathname === item.path || isChildActive;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      if (onItemClick) onItemClick();
    }
  };

  const Component = hasChildren ? Box : Link;
  const linkProps = hasChildren ? { onClick: handleClick, sx: { cursor: 'pointer' } } : { to: item.path, component: Link, onClick: handleClick };

  return (
    <>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          {...linkProps}
          selected={!hasChildren && isActive}
          sx={{
            minHeight: 40,
            px: 2.5,
            pl: depth * 2 + 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: 'center',
              color: isActive ? 'secondary.main' : 'text.secondary',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontSize: '0.9rem', 
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'text.primary' : 'text.secondary'
            }} 
          />
          {hasChildren ? (open ? <ExpandLess sx={{ fontSize: '1rem', color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: '1rem', color: 'text.secondary' }} />) : null}
        </ListItemButton>
      </ListItem>
      
      {hasChildren && (
        <Collapse in={open || isChildActive} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child, index) => (
              <ListItemButton
                key={index}
                component={Link}
                to={child.path}
                selected={location.pathname === child.path}
                sx={{
                  pl: depth * 2 + 6,
                  py: 0.5,
                  minHeight: 32,
                }}
              >
                 <ListItemIcon sx={{ minWidth: 20 }}>
                    <CircleIcon sx={{ fontSize: 6, color: location.pathname === child.path ? 'secondary.main' : 'text.disabled' }} />
                 </ListItemIcon>
                <ListItemText 
                  primary={child.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.85rem',
                    color: location.pathname === child.path ? 'text.primary' : 'text.secondary'
                  }} 
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function Sidebar({ mobileOpen, onClose, drawerWidth = DRAWER_WIDTH, variant = 'permanent' }) {
  const location = useLocation();
  
  const handleItemClick = () => {
    if (variant === 'temporary' && onClose) {
      onClose(); // Close drawer on mobile click
    }
  };

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={variant}
        open={variant === 'temporary' ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            top: variant === 'permanent' ? 64 : 0, // Height of AppBar on desktop
            height: variant === 'permanent' ? 'calc(100% - 64px)' : '100%',
            borderRight: '1px solid rgba(0,0,0,0.08)', // RTL - border on the right side
            backgroundColor: '#fff',
          },
        }}
        anchor="left" // RTL support - left means right side in RTL
      >
        <List sx={{ py: 1 }}>
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <Box key={index} sx={{ mt: 2, mb: 1, px: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            }
            return <SidebarItem key={index} item={item} onItemClick={handleItemClick} />;
          })}
        </List>
      </Drawer>
    </Box>
  );
}

export default Sidebar;
