import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

const MotionBox = motion.create(Box);

const features = [
  {
    icon: ContentCutOutlinedIcon,
    title: 'תפירה אישית',
    description: 'לא מוצר מדף - אלא מערכת המותאמת ב-100% לצרכים שלכם.',
  },
  {
    icon: HubOutlinedIcon,
    title: 'סדר ושליטה',
    description: 'מערכת אחת שמרכזת הכול וחוסכת זמן וכסף.',
  },
  {
    icon: ShieldOutlinedIcon,
    title: 'שקט ניהולי',
    description: 'ביטחון תפעולי ומערכת שעובדת בשבילכם.',
  },
  {
    icon: BoltOutlinedIcon,
    title: 'אוטומציה',
    description: 'חיסכון בכוח אדם ושיפור תהליכים.',
  },
];

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const Icon = feature.icon;

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      sx={{
        gridColumn: 'span 1',
        height: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 4, md: 5 },
          bgcolor: 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #333333',
          borderRadius: '24px',
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            borderColor: '#00E676',
            boxShadow: '0px 24px 48px -12px rgba(0, 230, 118, 0.15)',
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            borderRadius: '16px',
            bgcolor: 'rgba(0, 230, 118, 0.1)',
            border: '1px solid rgba(0, 230, 118, 0.2)',
          }}
        >
          <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: '#00E676' }} />
        </Box>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          {feature.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#E0E0E0',
            lineHeight: 1.7,
            flexGrow: 1,
            fontSize: { xs: '0.95rem', md: '1.125rem' },
          }}
        >
          {feature.description}
        </Typography>
      </Box>
    </MotionBox>
  );
}

function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 12, md: 16 },
        bgcolor: '#1A1A1A',
      }}
    >
      <Container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            האתגר: עסקים מגיעים עם הרבה נקודות
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#E0E0E0',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            אנחנו מחברים את הנקודות למערכת אחת חכמה
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 3, md: 4 },
            width: '100%',
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default FeaturesSection;
