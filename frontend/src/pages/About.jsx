import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

function About() {
  const values = [
    {
      icon: RocketLaunchIcon,
      title: 'חדשנות',
      description: 'אנחנו תמיד מחפשים דרכים חדשות ויצירתיות לפתור בעיות עסקיות ולהוביל את השוק קדימה',
      color: '#1a237e',
      bgColor: 'rgba(26, 35, 126, 0.08)',
    },
    {
      icon: PeopleIcon,
      title: 'לקוחות במרכז',
      description: 'הצלחת הלקוחות שלנו היא הצלחה שלנו - אנחנו כאן בשבילכם בכל שלב בדרך',
      color: '#00bcd4',
      bgColor: 'rgba(0, 188, 212, 0.08)',
    },
    {
      icon: TrendingUpIcon,
      title: 'שיפור מתמיד',
      description: 'אנחנו משפרים ומעדכנים את המערכת באופן קבוע על בסיס משובים של הלקוחות שלנו',
      color: '#1a237e',
      bgColor: 'rgba(26, 35, 126, 0.08)',
    },
  ];

  const advantages = [
    { icon: CheckCircleIcon, text: 'תשלום חד-פעמי ללא מנוי חודשי' },
    { icon: AutoGraphIcon, text: 'התאמה אישית מלאה לעסק שלכם' },
    { icon: SupportAgentIcon, text: 'תמיכה טכנית 24/7' },
    { icon: EmojiEventsIcon, text: 'הדרכה מקיפה והטמעה' },
    { icon: TrendingUpIcon, text: 'עדכונים שוטפים ללא עלות' },
    { icon: SecurityIcon, text: 'אבטחת מידע ברמה הגבוהה ביותר' },
  ];

  const stats = [
    { number: '500+', label: 'לקוחות מרוצים' },
    { number: '10+', label: 'שעות חיסכון שבועי' },
    { number: '95%', label: 'שביעות רצון' },
    { number: '3', label: 'שנות ניסיון' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* רקע עם גרדיאנט */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(26,35,126,0.03) 0%, rgba(0,188,212,0.05) 100%)',
            zIndex: 0,
          }}
        />

        {/* עיגולים מטושטשים */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,188,212,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 10 }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center' }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '2px',
                mb: 2,
                display: 'block',
              }}
            >
              ABOUT US
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              אודות TailorBiz
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              אנחנו מאמינים שכל עסק, קטן או גדול, ראוי למערכת ניהול מתקדמת ואוטומטית
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* הסיפור שלנו */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.main',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '2px',
                  mb: 2,
                  display: 'block',
                }}
              >
                OUR STORY
              </Typography>
              <Typography variant="h2" fontWeight={800} gutterBottom color="primary.main">
                הסיפור שלנו
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                TailorBiz נוסדה מתוך הבנה שעסקים קטנים ובינוניים מתמודדים עם אתגרים ייחודיים
                בניהול יומיומי - זמן מוגבל, משאבים מצומצמים, ולקוחות שצריכים תשומת לב אישית.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                ראינו עסקים שמאבדים לקוחות פשוט בגלל שכחה לשלוח תזכורת, או שמפספסים הזדמנויות
                כי לא היה זמן לעקוב אחרי כל לקוח. החלטנו לשנות את זה.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                היום, אנחנו גאים לעזור למאות עסקים לחסוך זמן, להגדיל רווחים, ולספק שירות
                טוב יותר ללקוחות שלהם - הכל באמצעות אוטומציה חכמה ומותאמת אישית.
              </Typography>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  borderRadius: 1,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    border: '2px solid',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 1,
                  }}
                />
                <Typography variant="h3" color="white" fontWeight={800} sx={{ textAlign: 'center' }}>
                  TailorBiz
                  <br />
                  <Typography variant="h5" color="rgba(255,255,255,0.8)">
                    מערכת ניהול אוטומטית
                  </Typography>
                </Typography>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* סטטיסטיקות */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '-10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => {
              const [ref, inView] = useInView({ triggerOnce: true });
              return (
                <Grid item xs={6} md={3} key={index}>
                  <MotionBox
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          color: 'white',
                          mb: 1,
                          fontSize: { xs: '2.5rem', md: '3.5rem' },
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* הערכים שלנו */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'secondary.main',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '2px',
              mb: 2,
              display: 'block',
            }}
          >
            OUR VALUES
          </Typography>
          <Typography variant="h2" fontWeight={800} gutterBottom color="primary.main">
            הערכים שלנו
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            העקרונות המנחים אותנו בכל מה שאנחנו עושים
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {values.map((value, index) => {
            const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
            const Icon = value.icon;

            return (
              <Grid item xs={12} md={4} key={index}>
                <MotionPaper
                  ref={ref}
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                      borderColor: value.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      bgcolor: value.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Icon sx={{ fontSize: 40, color: value.color }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom color="primary.main">
                    {value.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.8,
                      flexGrow: 1,
                    }}
                  >
                    {value.description}
                  </Typography>
                </MotionPaper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* למה לבחור בנו */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '2px',
                mb: 2,
                display: 'block',
              }}
            >
              WHY CHOOSE US
            </Typography>
            <Typography variant="h2" fontWeight={800} gutterBottom color="primary.main">
              למה לבחור ב-TailorBiz?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              היתרונות שלנו שהופכים אותנו לבחירה המושלמת עבור העסק שלכם
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {advantages.map((advantage, index) => {
              const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
              const Icon = advantage.icon;

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <MotionBox
                    ref={ref}
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    sx={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 3,
                        height: '100%',
                        bgcolor: 'white',
                        borderRadius: 1,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(-8px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          bgcolor: 'rgba(0,188,212,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: 'secondary.main', fontSize: 24 }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mt: 1,
                          flexGrow: 1,
                        }}
                      >
                        {advantage.text}
                      </Typography>
                    </Box>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(0,188,212,0.3)',
              }}
            >
              צרו קשר עכשיו
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default About;
