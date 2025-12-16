import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { authAPI } from '../../utils/api';

const RequireAdminAuth = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      setChecking(true);
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

        // מצב שגיאה אחר (403/500) – ננתב ל-login כדי לא להשאיר מסך שבור
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

  return children;
};

export default RequireAdminAuth;

