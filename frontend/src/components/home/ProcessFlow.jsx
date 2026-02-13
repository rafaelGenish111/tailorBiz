import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

const MotionBox = motion.create(Box);

const steps = [
  {
    number: '1',
    icon: ContactPhoneOutlinedIcon,
    title: 'יצירת קשר',
    description: 'שיחת ייעוץ ראשונית להבנת צרכי העסק שלכם',
  },
  {
    number: '2',
    icon: SettingsSuggestOutlinedIcon,
    title: 'התאמה אישית',
    description: 'בניית מערכת מותאמת בדיוק לתהליכי העבודה שלכם',
  },
  {
    number: '3',
    icon: RocketLaunchOutlinedIcon,
    title: 'השקה והטמעה',
    description: 'הדרכה מקיפה והשקת המערכת בעסק',
  },
  {
    number: '4',
    icon: TrendingUpOutlinedIcon,
    title: 'צמיחה',
    description: 'ליווי שוטף וחיסכון מיידי בזמן ובכסף',
  },
];

function ProcessStep({ step, index, isLast }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const Icon = step.icon;

  return (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <Box
            sx={{
              position: 'relative',
              textAlign: 'center',
              px: 2,
            }}
          >
            {/* מספר גדול ברקע */}
            <Typography
              sx={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '6rem',
                fontWeight: 900,
                color: 'rgba(0, 255, 153, 0.06)',
                lineHeight: 1,
                zIndex: 0,
              }}
            >
              {step.number}
            </Typography>

            {/* אייקון */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: '#262626',
                border: '4px solid',
                borderColor: '#00FF99',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0px 8px 24px rgba(0, 255, 153, 0.2)',
              }}
            >
              <Icon sx={{ fontSize: 50, color: '#00FF99' }} aria-hidden="true" />
            </Box>

            {/* כותרת */}
            <Typography
              variant="h5"
              sx={{
                mb: 1.5,
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {step.title}
            </Typography>

            {/* תיאור */}
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.7,
              }}
            >
              {step.description}
            </Typography>
          </Box>
        </MotionBox>
      </Grid>

      {/* חץ מחבר (רק אם זה לא השלב האחרון) */}
      {!isLast && (
        <Grid
          item
          xs={12}
          md="auto"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: (index + 0.5) * 0.2 }}
          >
            <ArrowBackIcon
              sx={{
                fontSize: 40,
                color: '#00FF99',
                opacity: 0.5,
              }}
              aria-hidden="true"
            />
          </MotionBox>
        </Grid>
      )}
    </>
  );
}

function ProcessFlow() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#1A1A1A',
      }}
    >
      <Container maxWidth="lg">
        {/* כותרת */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            איך זה עובד?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            4 שלבים פשוטים למהפכה בניהול העסק שלכם
          </Typography>
        </Box>

        {/* תהליך */}
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'relative' }}
        >
          {steps.map((step, index) => (
            <ProcessStep
              key={index}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default ProcessFlow;

