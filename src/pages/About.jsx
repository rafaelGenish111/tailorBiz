import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const MotionBox = motion(Box);

function About() {
  const values = [
    {
      icon: RocketLaunchIcon,
      title: 'חדשנות',
      description: 'אנחנו תמיד מחפשים דרכים חדשות ויצירתיות לפתור בעיות עסקיות',
    },
    {
      icon: PeopleIcon,
      title: 'לקוחות במרכז',
      description: 'הצלחת הלקוחות שלנו היא הצלחה שלנו - אנחנו כאן בשבילכם',
    },
    {
      icon: TrendingUpIcon,
      title: 'שיפור מתמיד',
      description: 'אנחנו משפרים ומעדכנים את המערכת באופן קבוע',
    },
  ];

  const advantages = [
    'תשלום חד-פעמי ללא מנוי חודשי',
    'התאמה אישית מלאה לעסק שלכם',
    'תמיכה טכנית 24/7',
    'הדרכה מקיפה והטמעה',
    'עדכונים שוטפים ללא עלות',
    'אבטחת מידע ברמה הגבוהה ביותר',
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" fontWeight={800} gutterBottom>
              אודות TailorBiz
            </Typography>
            <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', opacity: 0.9 }}>
              אנחנו מאמינים שכל עסק, קטן או גדול, ראוי למערכת ניהול מתקדמת ואוטומטית
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              הסיפור שלנו
            </Typography>
            <Typography variant="body1" paragraph>
              TailorBiz נוסדה מתוך הבנה שעסקים קטנים ובינוניים מתמודדים עם אתגרים ייחודיים
              בניהול יומיומי - זמן מוגבל, משאבים מצומצמים, ולקוחות שצריכים תשומת לב אישית.
            </Typography>
            <Typography variant="body1" paragraph>
              ראינו עסקים שמאבדים לקוחות פשוט בגלל שכחה לשלוח תזכורת, או שמפספסים הזדמנויות
              כי לא היה זמן לעקוב אחרי כל לקוח. החלטנו לשנות את זה.
            </Typography>
            <Typography variant="body1">
              היום, אנחנו גאים לעזור למאות עסקים לחסוך זמן, להגדיל רווחים, ולספק שירות
              טוב יותר ללקוחות שלהם - הכל באמצעות אוטומציה חכמה ומותאמת אישית.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 400,
                borderRadius: 4,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" color="text.secondary">
                תמונה / איור
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 10 }}>
          <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
            הערכים שלנו
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,188,212,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <value.icon sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10 }}>
          <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
            למה לבחור ב-TailorBiz?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {advantages.map((advantage, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                  <Typography variant="h6">{advantage}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default About;
