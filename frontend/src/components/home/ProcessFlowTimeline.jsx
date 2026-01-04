import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const steps = [
  {
    step: 'שלב 1',
    title: 'יצירת קשר',
    description: 'שיחת ייעוץ ראשונית להבנת צרכי העסק שלכם',
    details: 'כל פרויקט מתחיל באיסוף מידע של התהליכים בעסק בשיווק, במכירות, בפיננסים ובתפעול. בפגישה נראה איזה אוטומציות נשלב בפרויקט ואיך נראה האסטרטגיה של כל חבר צוות.',
    icon: ContactPhoneOutlinedIcon,
    position: 'right',
    highlight: false,
  },
  {
    step: 'שלב 2',
    title: 'מפתחים',
    description: 'בשלב הזה מפתחים שרותים ומחברים לבנות את המערכת',
    details: 'פיתוח \'חליפה לפי מידה\' – אנחנו בונים את המערכת בדיוק לפי האפיון, מחברים בין הכלים הקיימים (אינטגרציות) ומקימים דשבורדים לניהול בזמן אמת.',
    icon: SettingsSuggestOutlinedIcon,
    position: 'left',
    highlight: true,
  },
  {
    step: 'שלב 3',
    title: 'בודקים',
    description: 'בדיקות מקיפות לפני השקה',
    details: 'בקרת איכות (QA) – אנחנו מבצעים בדיקות קפדניות כדי לוודא שכל אוטומציה עובדת חלק, גם במקרי קיצון, לפני העלייה לאוויר.',
    icon: RocketLaunchOutlinedIcon,
    position: 'right',
    highlight: false,
  },
  {
    step: 'שלב 4',
    title: 'השקה והטמעה',
    description: 'הדרכה מקיפה והשקת המערכת בעסק',
    details: 'ליווי שוטף וחיסכון מיידי בזמן ובכסף. אנחנו כאן לכל שאלה ובעיה.',
    icon: TrendingUpOutlinedIcon,
    position: 'left',
    highlight: false,
  },
];

function TimelineStep({ step, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const Icon = step.icon;
  const isLeft = step.position === 'left';

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        alignItems: 'center',
        mb: 8,
        minHeight: 200,
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        whileHover={{
          scale: 1.05,
          x: isLeft ? -10 : 10,
          transition: { duration: 0.3 },
        }}
        elevation={step.highlight ? 8 : 2}
        sx={{
          position: 'relative',
          width: { xs: '100%', md: '45%' },
          p: 4,
          bgcolor: step.highlight ? 'rgba(0, 188, 212, 0.05)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: step.highlight ? 'secondary.main' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: step.highlight 
            ? '0 8px 32px rgba(0, 188, 212, 0.2)' 
            : '0 4px 16px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            borderColor: step.highlight ? 'secondary.light' : 'rgba(0, 188, 212, 0.3)',
            boxShadow: step.highlight
              ? '0 12px 48px rgba(0, 188, 212, 0.3)'
              : '0 8px 32px rgba(0, 188, 212, 0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            [isLeft ? 'right' : 'left']: -15,
            transform: 'translateY(-50%)',
            width: 15,
            height: 15,
            bgcolor: step.highlight ? 'secondary.main' : 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: { xs: 'none', md: 'block' },
            boxShadow: step.highlight ? '0 0 20px rgba(0, 188, 212, 0.8)' : 'none',
          },
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 1,
            bgcolor: step.highlight 
              ? 'linear-gradient(135deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 188, 212, 0.1) 100%)'
              : 'rgba(26, 35, 126, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: '1px solid',
            borderColor: step.highlight ? 'rgba(0, 188, 212, 0.3)' : 'rgba(26, 35, 126, 0.1)',
            boxShadow: step.highlight ? '0 4px 20px rgba(0, 188, 212, 0.3)' : 'none',
          }}
        >
          <Icon
            sx={{
              fontSize: 30,
              color: step.highlight ? 'secondary.main' : 'rgba(255, 255, 255, 0.7)',
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1,
            fontWeight: 700,
            opacity: 0.8,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {step.step}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'white',
            background: step.highlight 
              ? 'linear-gradient(135deg, #00bcd4 0%, #00e5ff 100%)'
              : 'none',
            backgroundClip: step.highlight ? 'text' : 'none',
            WebkitBackgroundClip: step.highlight ? 'text' : 'none',
            WebkitTextFillColor: step.highlight ? 'transparent' : 'white',
          }}
        >
          {step.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 2,
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {step.description}
        </Typography>

        {step.details && (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.875rem',
            }}
          >
            {step.details}
          </Typography>
        )}
      </MotionPaper>

      <Box
        sx={{
          position: 'absolute',
          left: { xs: '50%', md: '50%' },
          top: { xs: 0, md: '50%' },
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: step.highlight ? 'secondary.main' : 'rgba(255, 255, 255, 0.3)',
          border: '3px solid',
          borderColor: step.highlight ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          zIndex: 2,
          display: { xs: 'none', md: 'block' },
          boxShadow: step.highlight ? '0 0 20px rgba(0, 188, 212, 0.8)' : 'none',
          animation: step.highlight ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow: '0 0 20px rgba(0, 188, 212, 0.8)',
            },
            '50%': {
              boxShadow: '0 0 40px rgba(0, 188, 212, 1), 0 0 60px rgba(0, 188, 212, 0.6)',
            },
          },
        }}
      />
    </Box>
  );
}

function ProcessFlowTimeline() {
  const [containerRef, containerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #0a1628 0%, #1a237e 50%, #000051 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Grid Pattern Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 188, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 188, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glowing Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(30px, -30px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,35,126,0.2) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'float 10s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* כותרת */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
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
            OUR PROCESS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #00bcd4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            איך זה עובד?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            4 שלבים פשוטים למהפכה בניהול העסק שלכם
          </Typography>
        </Box>

        {/* Timeline Container */}
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            maxWidth: 1000,
            mx: 'auto',
          }}
        >
          {/* קו אנכי מרכזי עם אנימציה */}
          <MotionBox
            initial={{ scaleY: 0 }}
            animate={containerInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              background: 'linear-gradient(180deg, rgba(0,188,212,0.1) 0%, rgba(0,188,212,0.5) 50%, rgba(0,188,212,0.1) 100%)',
              transform: 'translateX(-50%)',
              transformOrigin: 'top',
              display: { xs: 'none', md: 'block' },
              boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)',
            }}
          />

          {/* שלבים */}
          {steps.map((step, index) => (
            <TimelineStep key={index} step={step} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ProcessFlowTimeline;
