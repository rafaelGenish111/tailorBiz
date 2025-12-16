import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authAPI } from '../utils/api';

const BootstrapAdminPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [bootstrapSecret, setBootstrapSecret] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showSecret, setShowSecret] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // אם כבר יש אדמין – ננתב ל-login
    const run = async () => {
      try {
        const bn = await authAPI.bootstrapNeeded();
        const needed = Boolean(bn?.data?.data?.needed);
        if (!needed) navigate('/admin/login', { replace: true });
      } catch (_) {
        // ignore
      }
    };
    run();
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('אימות סיסמה לא תואם');
      return;
    }
    setLoading(true);
    try {
      await authAPI.bootstrap({ username, password, bootstrapSecret });
      setSuccess('נוצר אדמין בהצלחה. מעביר לאזור האישי…');
      setTimeout(() => navigate('/admin', { replace: true }), 300);
    } catch (err) {
      setError(err?.response?.data?.message || 'שגיאה בהגדרה ראשונית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 520, p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          הגדרה ראשונית
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          יצירת משתמש אדמין ראשון (חד־פעמי).
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="שם משתמש (אדמין)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            label="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            fullWidth
            helperText="לפחות 8 תווים"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="אימות סיסמה"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            fullWidth
          />
          <TextField
            label="סוד התקנה (ADMIN_BOOTSTRAP_SECRET)"
            value={bootstrapSecret}
            onChange={(e) => setBootstrapSecret(e.target.value)}
            type={showSecret ? 'text' : 'password'}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowSecret((p) => !p)} edge="end">
                    {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type="submit" variant="contained" color="secondary" disabled={loading}>
            {loading ? 'יוצר…' : 'צור אדמין'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BootstrapAdminPage;

