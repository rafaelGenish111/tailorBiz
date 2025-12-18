import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { getCurrentUserFromQueryData, hasAnyModuleAccess, hasModuleAccess, useCurrentUserQuery } from '../../hooks/useCurrentUser';

function getRulesForPath(pathname) {
  // Normalize
  const p = pathname || '';

  // Always allow root admin dashboard and sales training
  if (p === '/admin' || p === '/admin/' || p.startsWith('/admin/sales-training')) {
    return { allow: true };
  }

  // Admin-only
  if (p.startsWith('/admin/employees')) {
    return { adminOnly: true };
  }

  // Settings
  if (p.startsWith('/admin/settings')) {
    return { requiredModule: 'settings' };
  }

  // Tasks & planner
  if (
    p.startsWith('/admin/today') ||
    p.startsWith('/admin/calendar') ||
    p.startsWith('/admin/tasks') ||
    p.startsWith('/admin/projects') ||
    p.startsWith('/admin/gantt') ||
    p.startsWith('/admin/notifications')
  ) {
    return { requiredModule: 'tasks_calendar' };
  }

  // Marketing + nurturing
  if (p.startsWith('/admin/marketing') || p.startsWith('/admin/nurturing')) {
    return { requiredModule: 'marketing' };
  }

  // CMS
  if (
    p.startsWith('/admin/testimonials') ||
    p.startsWith('/admin/cms') ||
    p.startsWith('/admin/blog') ||
    p.startsWith('/admin/portfolio') ||
    p.startsWith('/admin/products')
  ) {
    return { requiredModule: 'cms' };
  }

  // Leads / clients
  if (p.startsWith('/admin/leads')) {
    return { requiredModule: 'leads' };
  }
  if (p.startsWith('/admin/customers')) {
    return { requiredModule: 'clients' };
  }
  if (p.startsWith('/admin/clients')) {
    return { anyOfModules: ['clients', 'leads'] };
  }
  if (p.startsWith('/admin/pipeline') || p.startsWith('/admin/hunting-pools')) {
    return { anyOfModules: ['leads', 'clients'] };
  }

  // Unknown admin route: be safe and allow (so we don't break future additions)
  // Individual routes can still be guarded at route-level.
  return { allow: true };
}

export default function AdminPathGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading } = useCurrentUserQuery();
  const user = getCurrentUserFromQueryData(data);

  if (isLoading || !user) {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">טוען…</Typography>
      </Box>
    );
  }

  const rules = getRulesForPath(location.pathname);
  if (rules.allow) return children;

  if (rules.adminOnly && user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, maxWidth: '100%', overflowX: 'hidden' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 560, width: '100%' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            אין הרשאה
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            אין לך הרשאה לצפות בעמוד זה.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate('/admin', { replace: true })}>
            חזרה לדשבורד
          </Button>
        </Paper>
      </Box>
    );
  }

  const ok =
    user.role === 'admin' ||
    (rules.requiredModule ? hasModuleAccess(user, rules.requiredModule) : true) &&
    (rules.anyOfModules ? hasAnyModuleAccess(user, rules.anyOfModules) : true);

  if (!ok) {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, maxWidth: '100%', overflowX: 'hidden' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 560, width: '100%' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            אין הרשאה
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            אין לך הרשאה לצפות בעמוד זה.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate('/admin', { replace: true })}>
            חזרה לדשבורד
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
}
