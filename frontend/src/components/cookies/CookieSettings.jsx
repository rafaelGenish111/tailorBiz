import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
} from '@mui/material';
import Cookies from 'js-cookie';

const CookieSettings = ({ onClose, onSave }) => {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const analyticsCookie = Cookies.get('cookie-analytics');
    const marketingCookie = Cookies.get('cookie-marketing');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalytics(analyticsCookie === 'true');
    setMarketing(marketingCookie === 'true');
  }, []);

  const handleSave = () => {
    Cookies.set('cookie-consent', 'custom', { expires: 365 });
    Cookies.set('cookie-analytics', analytics.toString(), { expires: 365 });
    Cookies.set('cookie-marketing', marketing.toString(), { expires: 365 });
    onSave();
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 3,
        zIndex: 1300,
        backgroundColor: 'background.paper',
        borderTop: 2,
        borderColor: 'primary.main',
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            הגדרות עוגיות
          </Typography>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              עוגיות הכרחיות
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              עוגיות אלה נחוצות לפעולת האתר ואי אפשר לבטל אותן. הן מוגדרות בדרך כלל רק בתגובה לפעולות שביצעתם.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              תמיד פעילות
            </Typography>
          </Box>

          <Divider />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">עוגיות אנליטיקה</Typography>
                  <Typography variant="body2" color="text.secondary">
                    עוזרות לנו להבין איך מבקרים משתמשים באתר שלנו
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">עוגיות שיווק</Typography>
                  <Typography variant="body2" color="text.secondary">
                    משמשות לספק תוכן מותאם אישית ופרסומות
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose}>
              ביטול
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              שמור העדפות
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CookieSettings;


