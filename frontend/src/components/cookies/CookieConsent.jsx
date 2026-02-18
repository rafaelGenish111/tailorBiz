import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Link,
  Stack,
} from '@mui/material';
import Cookies from 'js-cookie';
import CookieSettings from './CookieSettings';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    Cookies.set('cookie-consent', 'all', { expires: 365 });
    Cookies.set('cookie-analytics', 'true', { expires: 365 });
    Cookies.set('cookie-marketing', 'true', { expires: 365 });
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    Cookies.set('cookie-consent', 'none', { expires: 365 });
    Cookies.set('cookie-analytics', 'false', { expires: 365 });
    Cookies.set('cookie-marketing', 'false', { expires: 365 });
    setShowConsent(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!showConsent) {
    return null;
  }

  if (showSettings) {
    return (
      <CookieSettings
        onClose={() => setShowSettings(false)}
        onSave={() => {
          setShowConsent(false);
          setShowSettings(false);
        }}
      />
    );
  }

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
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            שימוש בעוגיות
          </Typography>
          <Typography variant="body2" color="text.secondary">
            אנו משתמשים בעוגיות כדי לשפר את החוויה שלכם באתר, לנתח תנועה ולספק תוכן מותאם אישית.
            על ידי המשך השימוש באתר, אתם מסכימים לשימוש בעוגיות.
            <Link href="/privacy" sx={{ ml: 1 }}>
              קראו עוד על מדיניות הפרטיות שלנו
            </Link>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAcceptAll}
            >
              קבל הכל
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCustomize}
            >
              התאמה אישית
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleRejectAll}
            >
              דחה הכל
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CookieConsent;


