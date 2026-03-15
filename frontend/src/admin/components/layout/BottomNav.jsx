import { BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FolderSpecial as ProjectsIcon,
  PersonAdd as LeadsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUserFromQueryData, hasModuleAccess, hasAnyModuleAccess, useCurrentUserQuery } from '../../hooks/useCurrentUser';

const navItems = [
  { label: 'דשבורד', icon: <DashboardIcon />, path: '/admin' },
  { label: 'לידים', icon: <LeadsIcon />, path: '/admin/leads', requiredModule: 'leads' },
  { label: 'לקוחות', icon: <PeopleIcon />, path: '/admin/customers', requiredModule: 'clients' },
  { label: 'פרויקטים', icon: <ProjectsIcon />, path: '/admin/projects', anyOfModules: ['clients', 'invoices_docs'] },
  { label: 'הגדרות', icon: <SettingsIcon />, path: '/admin/settings', requiredModule: 'settings' },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useCurrentUserQuery();
  const user = getCurrentUserFromQueryData(data);

  // Filter items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (!user) return !item.requiredModule && !item.anyOfModules;
    if (user.role === 'admin' || user.role === 'super_admin') return true;
    if (item.requiredModule && !hasModuleAccess(user, item.requiredModule)) return false;
    if (item.anyOfModules && !hasAnyModuleAccess(user, item.anyOfModules)) return false;
    return true;
  });

  // Find active tab - match on path prefix for nested routes
  const activeIndex = visibleItems.findIndex((item) => {
    if (item.path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(item.path);
  });

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        borderTop: '1px solid',
        borderColor: 'divider',
        // Safe area for devices with home indicator (iPhone X+)
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <BottomNavigation
        value={activeIndex >= 0 ? activeIndex : 0}
        onChange={(_, newValue) => {
          const item = visibleItems[newValue];
          if (item) navigate(item.path);
        }}
        showLabels
        sx={{
          height: 60,
          bgcolor: '#232f3e',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255,255,255,0.5)',
            minWidth: 'auto',
            padding: '6px 0',
            transition: 'color 0.2s',
            '&.Mui-selected': {
              color: '#ec7211',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {visibleItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
