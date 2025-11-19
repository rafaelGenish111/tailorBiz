import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Link, Stack } from '@mui/material';
import Cookies from 'js-cookie';

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      // הצג אחרי 2 שניות
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set('cookieConsent', 'accepted', { expires: 365 });
    setShow(false);
  };

  const rejectCookies = () => {
    Cookies.set('cookieConsent', 'rejected', { expires: 365 });
    setShow(false);
  };

  if (!show) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        left: { xs: 20, md: 'auto' },
        maxWidth: { xs: 'calc(100% - 40px)', md: 450 },
        p: 3,
        zIndex: 1300,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        שימוש בעוגיות 🍪
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        אנו משתמשים בעוגיות כדי לשפר את חווית הגלישה שלך, לנתח תנועה באתר ולהציג תוכן מותאם אישית.
        בהמשך הגלישה באתר, אתה מסכים{' '}
        <Link href="/privacy" underline="hover">
          למדיניות הפרטיות
        </Link>{' '}
        שלנו.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={acceptCookies}
          fullWidth
        >
          אני מסכים
        </Button>
        <Button
          variant="outlined"
          onClick={rejectCookies}
          fullWidth
        >
          דחה
        </Button>
      </Stack>
    </Paper>
  );
}

export default CookieConsent;

