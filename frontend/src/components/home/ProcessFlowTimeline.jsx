import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

const MotionBox = motion.create(Box);

const STEP_DURATION = 5000; // ms per step

const steps = [
  {
    number: '01',
    title: 'אפיון עמוק',
    subtitle: 'הבנה מעמיקה של התהליכים, הכאבים והצרכים של העסק.',
    description: 'כל פרויקט מתחיל באיסוף מידע מקיף של התהליכים בעסק — בשיווק, במכירות, בפיננסים ובתפעול. אנחנו מבינים את האתגרים לעומק לפני שמתחילים לפתח.',
    icon: SearchOutlinedIcon,
  },
  {
    number: '02',
    title: 'פיתוח מהיר וגמיש',
    subtitle: 'בניית המערכת בדיוק לפי האפיון, עם אינטגרציות ודשבורדים.',
    description: 'פיתוח \'חליפה לפי מידה\' — אנחנו בונים את המערכת בדיוק לפי האפיון, מחברים בין הכלים הקיימים ומקימים דשבורדים לניהול בזמן אמת.',
    icon: CodeOutlinedIcon,
  },
  {
    number: '03',
    title: 'הטמעה והדרכה',
    subtitle: 'הדרכה מקיפה, ליווי שוטף, וחיסכון מיידי בזמן ובכסף.',
    description: 'ליווי צמוד עד להטמעה מלאה. אנחנו כאן לכל שאלה ובעיה, ומוודאים שהצוות שלכם יודע להשתמש במערכת בצורה מיטבית.',
    icon: SchoolOutlinedIcon,
  },
];

function ProcessFlowTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [sectionRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const goToStep = useCallback((index) => {
    setActiveStep(index);
    setProgress(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!inView || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s + 1) % steps.length);
          return 0;
        }
        return prev + (100 / (STEP_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [inView, isPaused]);

  const currentStep = steps[activeStep];
  const Icon = currentStep.icon;

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: 'relative',
        py: { xs: 16, md: 24 },
        bgcolor: '#0A0A0A',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top architectural line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: '#333333',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6 } }}>
        {/* Section Header */}
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          sx={{ mb: { xs: 8, md: 12 } }}
        >
          <Typography
            sx={{
              color: '#00FF99',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: 3,
            }}
          >
            איך אנחנו עובדים
          </Typography>

          <Typography
            component="h2"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 600,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            }}
          >
            3 שלבים פשוטים.
          </Typography>
        </MotionBox>

        {/* Step Indicators — horizontal row with progress bars */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          sx={{
            display: 'flex',
            gap: { xs: 0, md: 0 },
            mb: { xs: 6, md: 8 },
            borderBottom: '1px solid #333333',
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              onClick={() => goToStep(index)}
              sx={{
                flex: 1,
                cursor: 'pointer',
                pb: 3,
                position: 'relative',
                pr: { xs: 2, md: 4 },
              }}
            >
              {/* Step number + title */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
                <Typography
                  sx={{
                    color: activeStep === index ? '#00FF99' : '#4D4D4D',
                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                    fontWeight: 600,
                    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    transition: 'color 0.3s',
                  }}
                >
                  {step.number}
                </Typography>
                <Typography
                  sx={{
                    color: activeStep === index ? '#FFFFFF' : '#4D4D4D',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                    fontWeight: 600,
                    transition: 'color 0.3s',
                    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                  }}
                >
                  {step.title}
                </Typography>
              </Box>

              {/* Progress bar at bottom */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  right: 0,
                  left: 0,
                  height: '2px',
                  bgcolor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#00FF99',
                    width: activeStep === index ? `${progress}%` : index < activeStep ? '100%' : '0%',
                    transition: activeStep === index ? 'none' : 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
          ))}
        </MotionBox>

        {/* Active Step Content */}
        <AnimatePresence mode="wait">
          <MotionBox
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 8 },
              alignItems: 'start',
            }}
          >
            {/* Left side — large step number + title */}
            <Box>
              <Typography
                sx={{
                  color: 'rgba(0, 255, 153, 0.15)',
                  fontSize: { xs: '6rem', md: '10rem' },
                  fontWeight: 900,
                  lineHeight: 0.85,
                  letterSpacing: '-0.05em',
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                  mb: 2,
                  userSelect: 'none',
                }}
              >
                {currentStep.number}
              </Typography>

              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                {currentStep.subtitle}
              </Typography>
            </Box>

            {/* Right side — description + icon */}
            <Box sx={{ pt: { xs: 0, md: 4 } }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  border: '1px solid #333333',
                  borderRadius: '2px',
                  color: '#00FF99',
                }}
              >
                <Icon sx={{ fontSize: 24 }} />
              </Box>

              <Typography
                sx={{
                  color: '#B0B0B0',
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.8,
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                  mb: 4,
                }}
              >
                {currentStep.description}
              </Typography>
            </Box>
          </MotionBox>
        </AnimatePresence>

        {/* Quote */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{
            mt: { xs: 10, md: 14 },
            pt: { xs: 6, md: 8 },
            borderTop: '1px solid #333333',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#B0B0B0',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.35rem' },
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.8,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            }}
          >
            ״הפתרון נבנה סביב העסק — לא העסק צריך להתאים את עצמו למערכת.״
          </Typography>
        </MotionBox>
      </Container>

      {/* Bottom architectural line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: '#333333',
        }}
      />
    </Box>
  );
}

export default ProcessFlowTimeline;
