import { Box, Container, Typography, Paper } from '@mui/material';
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
    number: '01',
    icon: PersonOutlineIcon,
    title: 'CRM מותאם אישית',
    description: 'מערכת ניהול לקוחות שמותאמת בדיוק לתהליכי העבודה שלכם, עם מעקב פשוט ונוח ודיווחים מפורטים',
    color: '#1a237e',
    bgColor: 'rgba(26, 35, 126, 0.08)',
  },
  {
    number: '02',
    icon: NotificationsNoneIcon,
    title: 'תזכורות אוטומטיות',
    description: 'שליחת תזכורות תכנות לפגישות במייל, SMS והוואטסאפ בזמן המדויק, ללא צורך בעבודה ידנית',
    color: '#00bcd4',
    bgColor: 'rgba(0, 188, 212, 0.08)',
  },
  {
    number: '03',
    icon: EventNoteIcon,
    title: 'ניהול תורים חכם',
    description: 'מילוי אוטומטי של תורים מבוטלים ואופטימיזציה של לוח הזמנים להגדלת שיעור התפוסה',
    color: '#1a237e',
    bgColor: 'rgba(26, 35, 126, 0.08)',
  },
  {
    number: '04',
    icon: TrendingUpIcon,
    title: 'מעקב אחרי לקוחות',
    description: 'זיהוי אוטומטי של לקוחות שלא חזרו ופניה אליהם בזמן הנכון, הגדלת שיעור ההחזרה המשמעותית',
    color: '#00bcd4',
    bgColor: 'rgba(0, 188, 212, 0.08)',
  },
  {
    number: '05',
    icon: InventoryOutlinedIcon,
    title: 'ניהול מלאי וגביה',
    description: 'מעקב הכם אחרי מלאי, תזכורות לחשבוניות ואופטימיזציה של תהליכי גבייה שליטה מלאה',
    color: '#1a237e',
    bgColor: 'rgba(26, 35, 126, 0.08)',
  },
  {
    number: '06',
    icon: IntegrationInstructionsOutlinedIcon,
    title: 'אינטגרציות מלאות',
    description: 'חיבור חלק עם הכלים הקיימים שלכם - WhatsApp, Google, ועוד כדי ליצור מערכת אחת משולבת',
    color: '#00bcd4',
    bgColor: 'rgba(0, 188, 212, 0.08)',
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
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      sx={{ height: '100%' }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          p: 5,
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1,
          boxSizing: 'border-box',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 32px rgba(0,0,0,0.08)',
            borderColor: feature.color,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: feature.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: feature.color,
          }}
        >
          {feature.number}
        </Box>

        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: feature.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Icon sx={{ fontSize: 40, color: feature.color }} />
        </Box>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {feature.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.7,
            flexGrow: 1,
          }}
        >
          {feature.description}
        </Typography>
      </Paper>
    </MotionBox>
  );
}

function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
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
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
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
