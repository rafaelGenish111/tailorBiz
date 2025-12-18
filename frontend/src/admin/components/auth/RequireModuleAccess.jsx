import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { getCurrentUserFromQueryData, hasAnyModuleAccess, hasModuleAccess, useCurrentUserQuery } from '../../hooks/useCurrentUser';

export default function RequireModuleAccess({
  children,
  requiredModule,
  anyOfModules,
  adminOnly = false,
}) {
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

  if (adminOnly && user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
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
    (requiredModule ? hasModuleAccess(user, requiredModule) : true) &&
    (anyOfModules ? hasAnyModuleAccess(user, anyOfModules) : true);

  if (!ok) {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
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
