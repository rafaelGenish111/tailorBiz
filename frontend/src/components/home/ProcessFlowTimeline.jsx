import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const steps = [
  {
    step: 'שלב 1',
    title: 'אפיון עמוק',
    description: 'הבנה מעמיקה של התהליכים, הכאבים והצרכים של העסק.',
    details: 'כל פרויקט מתחיל באיסוף מידע מקיף של התהליכים בעסק – בשיווק, במכירות, בפיננסים ובתפעול. אנחנו מבינים את האתגרים לעומק לפני שמתחילים לפתח.',
    icon: SearchOutlinedIcon,
    position: 'right',
    highlight: true,
  },
  {
    step: 'שלב 2',
    title: 'פיתוח מהיר וגמיש',
    description: 'בניית המערכת בדיוק לפי האפיון, עם אינטגרציות ודשבורדים.',
    details: 'פיתוח \'חליפה לפי מידה\' – אנחנו בונים את המערכת בדיוק לפי האפיון, מחברים בין הכלים הקיימים ומקימים דשבורדים לניהול בזמן אמת.',
    icon: CodeOutlinedIcon,
    position: 'left',
    highlight: false,
  },
  {
    step: 'שלב 3',
    title: 'הטמעה והדרכה',
    description: 'הדרכה מקיפה, ליווי שוטף, וחיסכון מיידי בזמן ובכסף.',
    details: 'ליווי צמוד עד להטמעה מלאה. אנחנו כאן לכל שאלה ובעיה, ומוודאים שהצוות שלכם יודע להשתמש במערכת בצורה מיטבית.',
    icon: SchoolOutlinedIcon,
    position: 'right',
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
          bgcolor: step.highlight ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: step.highlight ? '#00E676' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: step.highlight
            ? '0 8px 32px rgba(0, 230, 118, 0.2)'
            : '0 4px 16px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            borderColor: step.highlight ? '#00FF99' : 'rgba(0, 230, 118, 0.3)',
            boxShadow: step.highlight
              ? '0 12px 48px rgba(0, 230, 118, 0.3)'
              : '0 8px 32px rgba(0, 230, 118, 0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            [isLeft ? 'right' : 'left']: -15,
            transform: 'translateY(-50%)',
            width: 15,
            height: 15,
            bgcolor: step.highlight ? '#00E676' : 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: { xs: 'none', md: 'block' },
            boxShadow: step.highlight ? '0 0 20px rgba(0, 230, 118, 0.8)' : 'none',
          },
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 1,
            bgcolor: step.highlight
              ? 'rgba(0, 230, 118, 0.1)'
              : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: '1px solid',
            borderColor: step.highlight ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            boxShadow: step.highlight ? '0 4px 20px rgba(0, 230, 118, 0.3)' : 'none',
          }}
        >
          <Icon
            sx={{
              fontSize: 30,
              color: step.highlight ? '#00E676' : 'rgba(255, 255, 255, 0.7)',
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
              ? 'linear-gradient(135deg, #00E676 0%, #00FF99 100%)'
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
          bgcolor: step.highlight ? '#00E676' : 'rgba(255, 255, 255, 0.3)',
          border: '3px solid',
          borderColor: step.highlight ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          zIndex: 2,
          display: { xs: 'none', md: 'block' },
          boxShadow: step.highlight ? '0 0 20px rgba(0, 230, 118, 0.8)' : 'none',
          animation: step.highlight ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow: '0 0 20px rgba(0, 230, 118, 0.8)',
            },
            '50%': {
              boxShadow: '0 0 40px rgba(0, 230, 118, 1), 0 0 60px rgba(0, 230, 118, 0.6)',
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
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
            linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px)
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
          background: 'radial-gradient(circle, rgba(0, 230, 118, 0.10) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(0, 230, 118, 0.06) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'float 10s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="overline"
            sx={{
              color: '#00E676',
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
              background: 'linear-gradient(135deg, #ffffff 0%, #00E676 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            איך אנחנו עובדים?
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
            3 שלבים פשוטים למהפכה בניהול העסק שלכם
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
          {/* Vertical timeline line */}
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
              background: 'linear-gradient(180deg, rgba(0, 230, 118, 0.1) 0%, rgba(0, 230, 118, 0.5) 50%, rgba(0, 230, 118, 0.1) 100%)',
              transform: 'translateX(-50%)',
              transformOrigin: 'top',
              display: { xs: 'none', md: 'block' },
              boxShadow: '0 0 20px rgba(0, 230, 118, 0.5)',
            }}
          />

          {steps.map((step, index) => (
            <TimelineStep key={index} step={step} index={index} />
          ))}
        </Box>

        {/* Quote */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#E0E0E0',
              fontStyle: 'italic',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.8,
              position: 'relative',
              '&::before': {
                content: '"\\201D"',
                fontSize: '3rem',
                color: '#00E676',
                position: 'absolute',
                top: -20,
                right: -10,
              },
            }}
          >
            הפתרון נבנה סביב העסק - לא העסק צריך להתאים את עצמו למערכת.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default ProcessFlowTimeline;
