import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const features = [
  {
    icon: PersonOutlineIcon,
    title: 'CRM מותאם אישית',
    description: 'מערכת ניהול לקוחות שמותאמת בדיוק לתהליכי העבודה שלכם, עם מעקב פשוט ונוח ודיווחים מפורטים',
    details: [
      'ניהול מלא של כל פרטי הלקוח במקום אחד',
      'מעקב אחרי היסטוריית פניות וקניות',
      'דיווחים מפורטים על ביצועי מכירות',
      'ניהול משימות ופגישות',
      'אינטגרציה עם כלי תקשורת',
    ],
  },
  {
    icon: NotificationsNoneIcon,
    title: 'תזכורות אוטומטיות',
    description: 'שליחת תזכורות תכנות לפגישות במייל, SMS והוואטסאפ בזמן המדויק, ללא צורך בעבודה ידנית',
    details: [
      'תזכורות אוטומטיות לפני פגישות',
      'שליחה במייל, SMS ו-WhatsApp',
      'התאמה אישית של זמני תזכורות',
      'אישור הגעה אוטומטי',
      'ניהול לוח זמנים חכם',
    ],
  },
  {
    icon: EventNoteIcon,
    title: 'ניהול תורים חכם',
    description: 'מילוי אוטומטי של תורים מבוטלים ואופטימיזציה של לוח הזמנים להגדלת שיעור התפוסה',
    details: [
      'מערכת תורים אוטומטית',
      'מילוי אוטומטי של חלונות ריקים',
      'אופטימיזציה של לוח הזמנים',
      'התראות על ביטולים',
      'ניהול רשימת המתנה',
    ],
  },
  {
    icon: TrendingUpIcon,
    title: 'מעקב אחרי לקוחות',
    description: 'זיהוי אוטומטי של לקוחות שלא חזרו ופניה אליהם בזמן הנכון, הגדלת שיעור ההחזרה המשמעותית',
    details: [
      'זיהוי אוטומטי של לקוחות לא פעילים',
      'פניה אוטומטית בזמן הנכון',
      'מעקב אחרי מחזור רכישות',
      'ניתוח התנהגות לקוחות',
      'הגדלת שיעור ההחזרה',
    ],
  },
  {
    icon: InventoryOutlinedIcon,
    title: 'ניהול מלאי וגביה',
    description: 'מעקב הכם אחרי מלאי, תזכורות לחשבוניות ואופטימיזציה של תהליכי גבייה שליטה מלאה',
    details: [
      'מעקב אחרי רמות מלאי',
      'התראות על מלאי נמוך',
      'תזכורות אוטומטיות לחשבוניות',
      'ניהול תהליכי גבייה',
      'דיווחים פיננסיים מפורטים',
    ],
  },
  {
    icon: IntegrationInstructionsOutlinedIcon,
    title: 'אינטגרציות מלאות',
    description: 'חיבור חלק עם הכלים הקיימים שלכם - WhatsApp, Google, ועוד כדי ליצור מערכת אחת משולבת',
    details: [
      'אינטגרציה עם WhatsApp',
      'חיבור ל-Google Calendar ו-Gmail',
      'אינטגרציה עם מערכות תשלום',
      'חיבור למערכות ERP קיימות',
      'API פתוח להתאמה אישית',
    ],
  },
];

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const Icon = feature.icon;

  return (
    <MotionPaper
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 },
        bgcolor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0px 24px 48px -12px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Icon */}
      <MotionBox
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        sx={{
          width: { xs: 64, md: 80 },
          height: { xs: 64, md: 80 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          borderRadius: '20px',
          bgcolor: 'rgba(0, 113, 227, 0.1)',
          background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.12) 0%, rgba(0, 119, 237, 0.08) 100%)',
        }}
      >
        <Icon sx={{ fontSize: { xs: 32, md: 40 }, color: '#0071E3' }} />
      </MotionBox>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: '#1D1D1F',
          lineHeight: 1.3,
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
        }}
      >
        {feature.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          mb: 3,
          color: '#86868B',
          lineHeight: 1.7,
          fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
          fontSize: '1.125rem',
        }}
      >
        {feature.description}
      </Typography>

      {/* Details List */}
      <Box sx={{ flexGrow: 1 }}>
        {feature.details.map((detail, idx) => (
          <MotionBox
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 + idx * 0.05 }}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              mb: 2,
            }}
          >
            <CheckCircleIcon
              sx={{
                color: '#0071E3',
                fontSize: 20,
                mt: 0.5,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#1D1D1F',
                lineHeight: 1.6,
                fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
              }}
            >
              {detail}
            </Typography>
          </MotionBox>
        ))}
      </Box>
    </MotionPaper>
  );
}

function Features() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          py: { xs: 12, md: 16 },
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.03) 0%, rgba(0, 188, 212, 0.05) 100%)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#0071E3',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '2px',
                mb: 2,
                display: 'block',
              }}
            >
              FEATURES
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                color: '#1D1D1F',
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.1,
              }}
            >
              כל מה שהעסק שלכם צריך
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#86868B',
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              מערכות ניהול ואוטומציות מתקדמות שחוסכות זמן ומגדילות רווחים
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#F5F5F7',
        }}
      >
        <Container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <FeatureCard feature={feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#FFFFFF',
        }}
      >
        <Container maxWidth="md">
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
                fontWeight: 700,
                color: '#1D1D1F',
              }}
            >
              מוכנים להתחיל?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: '#86868B',
                fontWeight: 400,
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
                fontSize: '1.125rem',
                px: 6,
                py: 2,
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

