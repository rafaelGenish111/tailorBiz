import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';

const MotionBox = motion(Box);

const features = [
  {
    icon: PersonOutlineIcon,
    title: 'CRM מותאם אישית',
    description: 'מערכת ניהול לקוחות שמותאמת בדיוק לתהליכי העבודה שלכם, עם מעקב פשוט ונוח ודיווחים מפורטים',
    span: 1, // Regular card
  },
  {
    icon: NotificationsNoneIcon,
    title: 'תזכורות אוטומטיות',
    description: 'שליחת תזכורות תכנות לפגישות במייל, SMS והוואטסאפ בזמן המדויק, ללא צורך בעבודה ידנית',
    span: 2, // Spans 2 columns (Bento style)
  },
  {
    icon: EventNoteIcon,
    title: 'ניהול תורים חכם',
    description: 'מילוי אוטומטי של תורים מבוטלים ואופטימיזציה של לוח הזמנים להגדלת שיעור התפוסה',
    span: 1,
  },
  {
    icon: TrendingUpIcon,
    title: 'מעקב אחרי לקוחות',
    description: 'זיהוי אוטומטי של לקוחות שלא חזרו ופניה אליהם בזמן הנכון, הגדלת שיעור ההחזרה המשמעותית',
    span: 1,
  },
  {
    icon: InventoryOutlinedIcon,
    title: 'ניהול מלאי וגביה',
    description: 'מעקב הכם אחרי מלאי, תזכורות לחשבוניות ואופטימיזציה של תהליכי גבייה שליטה מלאה',
    span: 2, // Spans 2 columns (Bento style)
  },
  {
    icon: IntegrationInstructionsOutlinedIcon,
    title: 'אינטגרציות מלאות',
    description: 'חיבור חלק עם הכלים הקיימים שלכם - WhatsApp, Google, ועוד כדי ליצור מערכת אחת משולבת',
    span: 1,
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
        gridColumn: {
          xs: 'span 1',
          md: feature.span === 2 ? 'span 2' : 'span 1',
        },
        height: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: { xs: 280, md: 320 },
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 4, md: 8 },
          bgcolor: '#FFFFFF', // White cards
          border: 'none', // No hard borders
          borderRadius: '24px', // rounded-3xl
          boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.05)', // Super soft shadow
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0px 24px 48px -12px rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* Icon at top left - large size */}
        <Box
          sx={{
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            borderRadius: '16px',
            bgcolor: 'rgba(0, 113, 227, 0.1)', // Electric Blue with transparency
            background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.12) 0%, rgba(0, 119, 237, 0.08) 100%)',
          }}
        >
          <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: '#0071E3' }} />
        </Box>

        {/* Headline - Bold, Charcoal Gray */}
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: '#1D1D1F', // Deep charcoal gray
            lineHeight: 1.3,
            fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          {feature.title}
        </Typography>

        {/* Description text at bottom - Medium Gray, readable */}
        <Typography
          variant="body1"
          sx={{
            color: '#86868B', // Medium gray
            lineHeight: 1.7,
            flexGrow: 1,
            fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
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
        py: { xs: 24, md: 32 },
        bgcolor: '#F5F5F7', // Very light gray/off-white for sections
      }}
    >
      <Container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            כל מה שהעסק שלכם צריך
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            פתרונות אוטומציה מתקדמים שחוסכים זמן ומגדילים רווחים
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(4, 1fr)', // 4 columns for Bento grid
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
