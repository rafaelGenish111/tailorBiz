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
  People as ClientsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
} from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { getCurrentUserFromQueryData, hasAnyModuleAccess, hasModuleAccess, useCurrentUserQuery } from '../../hooks/useCurrentUser';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'דשבורד', icon: <DashboardIcon />, path: '/admin' },

  { divider: true, label: 'לידים ולקוחות' },
  { text: 'לידים', icon: <ClientsIcon />, path: '/admin/leads', requiredModule: 'leads' },
  { text: 'לקוחות', icon: <ClientsIcon />, path: '/admin/customers', requiredModule: 'clients' },

  { divider: true, label: 'התקנות' },
  { text: 'התקנת WhatsApp', icon: <WhatsAppIcon />, path: '/admin/whatsapp-setup', anyOfModules: ['leads', 'clients', 'settings'] },
  { text: 'שליחת WhatsApp מרובה', icon: <WhatsAppIcon />, path: '/admin/whatsapp-broadcast', anyOfModules: ['leads', 'clients'] },

  { divider: true, label: 'הגדרות' },
  { text: 'בוט AI', icon: <SmartToyIcon />, path: '/admin/bot-config', requiredModule: 'settings' },
  { text: 'עובדים', icon: <ClientsIcon />, path: '/admin/employees', adminOnly: true },
  { text: 'הגדרות', icon: <SettingsIcon />, path: '/admin/settings', requiredModule: 'settings' },
];

function isItemAllowedForUser(item, user) {
  if (!item) return false;
  if (item.divider) return true;

  if (!user) return false;

  if (item.adminOnly && user.role !== 'admin' && user.role !== 'super_admin') return false;
  if (item.employeeOnly && user.role !== 'employee') return false;

  if (item.requiredModule && !hasModuleAccess(user, item.requiredModule)) return false;
  if (item.anyOfModules && !hasAnyModuleAccess(user, item.anyOfModules)) return false;
  return true;
}

function filterMenuItemsForUser(items, user) {
  // 1) filter items (including children)
  const filtered = items
    .map((it) => {
      if (it.divider) return it;
      if (it.children?.length) {
        const children = it.children.filter((c) => isItemAllowedForUser(c, user));
        // parent allowed only if it is allowed AND has at least one child
        if (!isItemAllowedForUser(it, user)) return null;
        if (!children.length) return null;
        return { ...it, children };
      }
      return isItemAllowedForUser(it, user) ? it : null;
    })
    .filter(Boolean);

  // 2) remove empty dividers (no items until next divider)
  const out = [];
  for (let i = 0; i < filtered.length; i += 1) {
    const cur = filtered[i];
    if (!cur.divider) {
      out.push(cur);
      continue;
    }
    let hasItemsAfter = false;
    for (let j = i + 1; j < filtered.length; j += 1) {
      if (filtered[j].divider) break;
      hasItemsAfter = true;
      break;
    }
    if (hasItemsAfter) out.push(cur);
  }
  // 3) trim leading/trailing dividers
  while (out.length && out[0].divider) out.shift();
  while (out.length && out[out.length - 1].divider) out.pop();
  return out;
}

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
  const { data, isLoading } = useCurrentUserQuery();
  const user = getCurrentUserFromQueryData(data);

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
          {isLoading || !user ? (
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                טוען תפריט…
              </Typography>
            </Box>
          ) : (
            filterMenuItemsForUser(menuItems, user).map((item, index) => {
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
            })
          )}
        </List>
      </Drawer>
    </Box>
  );
}

export default Sidebar;
