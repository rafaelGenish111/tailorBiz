import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // אם עדיין לא הוגדר אדמין – ננתב ל-setup
    const run = async () => {
      try {
        const bn = await authAPI.bootstrapNeeded();
        const needed = Boolean(bn?.data?.data?.needed);
        if (needed) navigate('/admin/setup', { replace: true });
      } catch (_) {
        // ignore
      }
    };
    run();
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.login({ username, password });
      const to = location.state?.from || '/admin';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 420, p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          התחברות לאזור האישי
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          נא להזין שם משתמש וסיסמה.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="שם משתמש"
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
            autoComplete="current-password"
            required
            fullWidth
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
          <Button type="submit" variant="contained" color="secondary" disabled={loading}>
            {loading ? 'מתחבר…' : 'התחברות'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

