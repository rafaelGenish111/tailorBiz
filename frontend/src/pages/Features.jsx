import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const MotionBox = motion.create(Box);

const features = [
  {
    title: 'המוח המרכזי של העסק',
    description: 'לא עוד אקסלים פזורים. כל המידע על הלקוחות, ההזמנות והתהליכים מתנקז למקום אחד חכם. כשהנתונים מסודרים, קבלת ההחלטות הופכת לקלה.',
    bullets: [
      'תמונת מצב בזמן אמת (360 מעלות)',
      'היסטוריית התקשרות מלאה לכל לקוח',
      'דוחות ניהוליים בלחיצת כפתור',
    ],
    position: 'right', // Text on right, image on left
    image: '/assets/images/hero-control.png',
  },
  {
    title: 'אפס חיכוך בתקשורת',
    description: 'המערכת עובדת בשבילך גם כשאתה ישן. עדכונים אוטומטיים ללקוחות, תזכורות לצוות, וסנכרון מלא בוואטסאפ - כדי שאף ליד או משימה לא יפלו בין הכיסאות.',
    bullets: [
      'בוט חכם לוואטסאפ ותזכורות SMS',
      'מניעת "No-Show" לפגישות',
      'עדכון סטטוס אוטומטי ללקוח (בייצור/במשלוח)',
    ],
    position: 'left', // Text on left, image on right
    image: '/assets/images/automation-chat.png',
  },
  {
    title: 'השטח והמשרד - גוף אחד',
    description: 'נתק בין הנהג/הטכנאי למשרד עולה לך כסף. אנחנו מחברים את כולם. הדיווח מהשטח מתעדכן מיידית במערכת, והחשבונית יוצאת לבד.',
    bullets: [
      'אפליקציית שטח פשוטה לעובדים',
      'סנכרון מלאי בזמן אמת',
      'חיבור למערכות הנהלת חשבונות (חשבשבת/פריוריטי ועוד)',
    ],
    position: 'right', // Text on right, image on left
    image: '/assets/images/sync-mobile.png',
  },
];

function FeatureSection({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const isTextRight = feature.position === 'right';

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: index % 2 === 0 ? '#0A0A0A' : '#1A1A1A',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: index % 2 === 0
            ? 'linear-gradient(135deg, rgba(0, 255, 153, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(0, 255, 153, 0.02) 100%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
          direction={isTextRight ? 'row-reverse' : 'row'}
        >
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: isTextRight ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="h2"
                sx={{
                  mb: 3,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontSize: { xs: '2rem', md: '3rem' },
                  lineHeight: 1.2,
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: '#B0B0B0',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                {feature.description}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {feature.bullets.map((bullet, idx) => (
                  <MotionBox
                    key={idx}
                    initial={{ opacity: 0, x: isTextRight ? -30 : 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 255, 153, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      <Check
                        size={16}
                        style={{ color: '#00FF99', strokeWidth: 3 }}
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#FFFFFF',
                        lineHeight: 1.7,
                        fontSize: { xs: '0.95rem', md: '1.0625rem' },
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {bullet}
                    </Typography>
                  </MotionBox>
                ))}
              </Box>
            </MotionBox>
          </Grid>

          {/* Visual/Image */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {feature.image ? (
                <Box
                  component="img"
                  src={feature.image}
                  alt={feature.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '24px', // rounded-2xl equivalent
                    boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl equivalent
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              ) : (
                // Glassmorphism placeholder for first section
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 300, md: 500 },
                    background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0px 20px 60px -10px rgba(0, 255, 153, 0.15)',
                  }}
                >
                  {/* Animated gradient orbs */}
                  <MotionBox
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    sx={{
                      position: 'absolute',
                      top: '-20%',
                      right: '-20%',
                      width: '60%',
                      height: '60%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(0, 255, 153, 0.2) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }}
                  />
                  <MotionBox
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: '-15%',
                      left: '-15%',
                      width: '50%',
                      height: '50%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center',
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 120, md: 180 },
                        height: { xs: 120, md: 180 },
                        mx: 'auto',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        border: '2px dashed rgba(0, 255, 153, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#B0B0B0',
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                        }}
                      >
                        תמונת מסך
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function Features() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <Box sx={{ bgcolor: '#0A0A0A', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          py: { xs: 12, md: 20 },
          overflow: 'hidden',
          bgcolor: '#0A0A0A',
        }}
      >
        {/* Subtle background gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
            zIndex: 0,
          }}
        />

        {/* Decorative orbs */}
        <MotionBox
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />
        <MotionBox
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                lineHeight: 1.1,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              להחזיר את השליטה לידיים שלך
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: '#B0B0B0',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1.125rem', md: '1.5rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              הטכנולוגיה היא רק האמצעי. המטרה היא עסק שעובד בשבילך, מסונכרן, יעיל ושקט.
            </Typography>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="large"
                component={Link}
                to="/contact"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  px: { xs: 5, md: 7 },
                  py: { xs: 1.5, md: 2 },
                  background: 'linear-gradient(135deg, #00FF99 0%, #8B5CF6 100%)',
                  boxShadow: '0px 8px 24px rgba(0, 255, 153, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00E676 0%, #7C3AED 100%)',
                    boxShadow: '0px 12px 32px rgba(0, 255, 153, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                לבדיקת היתכנות ואפיון
              </Button>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* Feature Sections - Zig-Zag Layout */}
      {features.map((feature, index) => (
        <FeatureSection key={index} feature={feature} index={index} />
      ))}

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          bgcolor: '#0A0A0A',
          position: 'relative',
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
            background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)',
            zIndex: 0,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={{ textAlign: 'center' }}
          >
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              מוכנים להחזיר את השליטה?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: '#B0B0B0',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                lineHeight: 1.7,
              }}
            >
              בואו נדבר על איך נוכל להתאים את המערכת בדיוק לעסק שלכם
            </Typography>
            <Button
              variant="primary"
              size="large"
              component={Link}
              to="/contact"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                px: { xs: 5, md: 7 },
                py: { xs: 1.5, md: 2 },
                background: 'linear-gradient(135deg, #00FF99 0%, #8B5CF6 100%)',
                boxShadow: '0px 8px 24px rgba(0, 255, 153, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00E676 0%, #7C3AED 100%)',
                  boxShadow: '0px 12px 32px rgba(0, 255, 153, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              לבדיקת היתכנות ואפיון
            </Button>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
}

export default Features;
