import React from 'react';
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
import { publicCMS } from '../utils/publicApi';
import { getImageUrl } from '../utils/imageUtils';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

function InViewMotionBox({
  children,
  inViewOptions = { triggerOnce: true, threshold: 0.1 },
  inViewAnimate,
  ...motionProps
}) {
  const [ref, inView] = useInView(inViewOptions);
  return (
    <MotionBox ref={ref} animate={inView ? inViewAnimate : {}} {...motionProps}>
      {children}
    </MotionBox>
  );
}

function InViewMotionPaper({
  children,
  inViewOptions = { triggerOnce: true, threshold: 0.1 },
  inViewAnimate,
  ...motionProps
}) {
  const [ref, inView] = useInView(inViewOptions);
  return (
    <MotionPaper ref={ref} animate={inView ? inViewAnimate : {}} {...motionProps}>
      {children}
    </MotionPaper>
  );
}

function About() {
  const [cmsAbout, setCmsAbout] = React.useState(null);
  const [cmsLoaded, setCmsLoaded] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await publicCMS.getPage('about');
        setCmsAbout(res.data?.data?.content || null);
      } catch (_) {
        setCmsAbout(null);
      } finally {
        setCmsLoaded(true);
      }
    };
    run();
  }, []);

  if (cmsLoaded && cmsAbout) {
    // Use sections if available, otherwise fall back to content parsing
    const sections = Array.isArray(cmsAbout.sections) && cmsAbout.sections.length > 0
      ? cmsAbout.sections
      : (() => {
        // Fallback: parse content with headings
        const text = cmsAbout.content || '';
        if (!text) return [];
        const parsedSections = [];
        const lines = text.split('\n');
        let currentSection = { title: null, content: '', image: null };

        lines.forEach((line) => {
          if (line.startsWith('## ')) {
            if (currentSection.title || currentSection.content) {
              parsedSections.push(currentSection);
            }
            currentSection = { title: line.replace('## ', '').trim(), content: '', image: null };
          } else if (line.startsWith('# ')) {
            // Main title - skip, already handled
          } else if (line.trim()) {
            currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
          }
        });

        if (currentSection.title || currentSection.content) {
          parsedSections.push(currentSection);
        }

        return parsedSections.length > 0 ? parsedSections : [{ title: null, content: text, image: null }];
      })();

    const mainImage = cmsAbout.coverImage || cmsAbout.image;

    return (
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            py: { xs: 12, md: 16 },
            bgcolor: '#0A0A0A',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.03) 0%, rgba(0, 255, 153, 0.05) 100%)',
              zIndex: 0,
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: '#00FF99',
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
                  color: '#FFFFFF',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  lineHeight: 1.1,
                }}
              >
                {cmsAbout.title || 'אודות TailorBiz'}
              </Typography>
            </MotionBox>
          </Container>
        </Box>

        {/* Content Sections */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          {mainImage && (
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              sx={{ mb: 6, textAlign: 'center' }}
            >
              <Box
                component="img"
                src={mainImage.url || mainImage}
                alt={mainImage.alt || cmsAbout.title || 'אודות'}
                sx={{
                  width: '100%',
                  maxWidth: 800,
                  height: 'auto',
                  borderRadius: '24px',
                  boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.1)',
                  mx: 'auto',
                }}
              />
            </MotionBox>
          )}

          {sections.map((section, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              sx={{ mb: 6 }}
            >
              <Grid container spacing={4} alignItems="center">
                {section.image?.url && (
                  <Grid item xs={12} md={section.title ? 6 : 12}>
                    <Box
                      component="img"
                      src={getImageUrl(section.image)}
                      alt={section.image.alt || section.title || 'תמונה'}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '24px',
                        boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={section.image?.url && section.title ? 6 : 12}>
                  {section.title && (
                    <Typography
                      variant="h3"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: '#FFFFFF',
                      }}
                    >
                      {section.title}
                    </Typography>
                  )}
                  {section.content && (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        color: '#B0B0B0',
                        lineHeight: 1.8,
                        fontSize: '1.125rem',
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {section.content}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </MotionBox>
          ))}
        </Container>
      </Box>
    );
  }

  const values = [
    {
      icon: RocketLaunchIcon,
      title: 'חדשנות',
      description: 'אנחנו תמיד מחפשים דרכים חדשות ויצירתיות לפתור בעיות עסקיות ולהוביל את השוק קדימה',
      color: '#00FF99',
      bgColor: 'rgba(0, 255, 153, 0.08)',
    },
    {
      icon: PeopleIcon,
      title: 'לקוחות במרכז',
      description: 'הצלחת הלקוחות שלנו היא הצלחה שלנו - אנחנו כאן בשבילכם בכל שלב בדרך',
      color: '#00FF99',
      bgColor: 'rgba(0, 255, 153, 0.08)',
    },
    {
      icon: TrendingUpIcon,
      title: 'שיפור מתמיד',
      description: 'אנחנו משפרים ומעדכנים את המערכת באופן קבוע על בסיס משובים של הלקוחות שלנו',
      color: '#00FF99',
      bgColor: 'rgba(0, 255, 153, 0.08)',
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
            background: 'linear-gradient(135deg, rgba(0,255,153,0.03) 0%, rgba(0,255,153,0.05) 100%)',
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
            background: 'radial-gradient(circle, rgba(0,255,153,0.1) 0%, transparent 70%)',
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
                color: '#00FF99',
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
                background: 'linear-gradient(135deg, #00FF99 0%, #00E676 100%)',
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
                  color: '#00FF99',
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
                  background: 'linear-gradient(135deg, #00FF99 0%, #00E676 100%)',
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
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <InViewMotionBox
                  inViewOptions={{ triggerOnce: true }}
                  initial={{ opacity: 0, y: 30 }}
                  inViewAnimate={{ opacity: 1, y: 0 }}
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
                </InViewMotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* הערכים שלנו */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              color: '#00FF99',
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
            const Icon = value.icon;
            return (
              <Grid item xs={12} md={4} key={index}>
                <InViewMotionPaper
                  inViewOptions={{ triggerOnce: true, threshold: 0.1 }}
                  initial={{ opacity: 0, y: 50 }}
                  inViewAnimate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: '#333333',
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0, 255, 153, 0.1)',
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
                </InViewMotionPaper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* למה לבחור בנו */}
      <Box sx={{ bgcolor: '#1A1A1A', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: '#00FF99',
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
              const Icon = advantage.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <InViewMotionBox
                    inViewOptions={{ triggerOnce: true, threshold: 0.1 }}
                    initial={{ opacity: 0, x: -30 }}
                    inViewAnimate={{ opacity: 1, x: 0 }}
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
                        bgcolor: '#0A0A0A',
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
                          bgcolor: 'rgba(0,255,153,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: '#00FF99', fontSize: 24 }} />
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
                  </InViewMotionBox>
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
                boxShadow: '0 8px 24px rgba(0,255,153,0.3)',
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
