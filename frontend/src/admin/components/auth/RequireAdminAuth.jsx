import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { authAPI } from '../../utils/api';

const RequireAdminAuth = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = React.useState(true);
  const [fatalError, setFatalError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      setChecking(true);
      setFatalError('');
      try {
        await authAPI.me();
        if (!mounted) return;
        setChecking(false);
      } catch (e) {
        const status = e?.response?.status;
        if (!mounted) return;

        if (status === 401) {
          try {
            const bn = await authAPI.bootstrapNeeded();
            const needed = Boolean(bn?.data?.data?.needed);
            if (needed) {
              navigate('/admin/setup', { replace: true });
              return;
            }
          } catch (_) {
            // ignore
          }
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        // 500/בעיית שרת – עדיף להציג הודעה ברורה במקום לולאת login
        if (status >= 500) {
          const msg = e?.response?.data?.message || e?.response?.data?.error || 'שגיאת שרת';
          setFatalError(msg);
          setChecking(false);
          return;
        }

        navigate('/admin/login', { replace: true, state: { from: location.pathname } });
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">בודק הרשאות…</Typography>
      </Box>
    );
  }

  if (fatalError) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 560, width: '100%' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            בעיית שרת בהתחברות
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {fatalError}
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => window.location.reload()}>
            נסה שוב
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default RequireAdminAuth;

