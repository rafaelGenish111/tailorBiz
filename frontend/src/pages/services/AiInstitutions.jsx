import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BotMessageSquare,
  BookOpen,
  Clock,
  UserCheck,
  ArrowRight,
  Shield,
  Lock,
  Scale,
  MessageSquare,
  Check,
} from 'lucide-react';
import Button from '../../components/ui/Button';

const MotionBox = motion.create(Box);

/* ---------- Solution Features ---------- */
const solutionFeatures = [
  {
    icon: BotMessageSquare,
    title: 'סוכן AI מבוסס RAG',
    description:
      'הסוכן לומד את הסילבוס, מחירונים ותהליכי הרשמה שלכם - ועונה לכל שאלה כמו יועץ מומחה.',
  },
  {
    icon: Clock,
    title: 'זמינות 24/7',
    description:
      'לידים פונים גם בשעה 2 בלילה. הסוכן משיב מיידית, אוסף פרטים ומתחיל תהליך רישום - בלי המתנה.',
  },
  {
    icon: UserCheck,
    title: 'רישום אוטומטי',
    description:
      'מהפנייה הראשונה ועד להרשמה מלאה - הסוכן מוביל את הנרשם דרך כל השלבים בצורה חלקה.',
  },
  {
    icon: BookOpen,
    title: 'מומחה סילבוס',
    description:
      'מענה מדויק על תוכניות לימוד, דרישות קדם, משך הקורס, הסמכות ומחירים - מתוך המידע האמיתי שלכם.',
  },
];

/* ---------- Security Items ---------- */
const securityItems = [
  { icon: Shield, label: 'Zero Trust Architecture' },
  { icon: Lock, label: 'הצפנת מידע End-to-End' },
  { icon: Scale, label: 'עמידה בתקנות הגנת הפרטיות' },
];

function AiInstitutions() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [solutionRef, solutionInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [demoRef, demoInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <Box sx={{ bgcolor: '#222325', minHeight: '100vh' }}>
      <Helmet>
        <title>AI למרכזי הכשרה ומוסדות | TailorBiz</title>
        <meta
          name="description"
          content="סוכן AI חכם שמשיב לפניות 24/7, מומחה בסילבוס שלכם, רושם נרשמים ולא מפספס אף ליד."
        />
      </Helmet>

      {/* =========== HERO SECTION =========== */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          py: { xs: 12, md: 20 },
          overflow: 'hidden',
        }}
      >
        {/* BG gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(111, 239, 147, 0.02) 100%)',
            zIndex: 0,
          }}
        />
        {/* Decorative orb */}
        <MotionBox
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            top: '8%',
            left: '8%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 850, mx: 'auto' }}
          >
            {/* Breadcrumb */}
            <Box
              component={Link}
              to="/services"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#808080',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                mb: 4,
                transition: 'color 0.3s',
                '&:hover': { color: '#8B5CF6' },
              }}
            >
              <ArrowRight size={16} />
              חזרה לשירותים
            </Box>

            <Typography
              sx={{
                color: '#8B5CF6',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              AI למרכזי הכשרה ומוסדות
            </Typography>

            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '2.25rem', md: '4rem' },
                lineHeight: 1.1,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              הלידים שלכם לא מחכים
              <br />
              <Box component="span" sx={{ color: '#8B5CF6' }}>
                לשעות העבודה.
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: '#B0B0B0',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                maxWidth: 680,
                mx: 'auto',
              }}
            >
              כל לילה נרשמים פוטנציאליים שולחים פניה ולא מקבלים מענה. כל שעה שעוברת - הליד מתקרר.
              סוכן AI שמכיר את הסילבוס שלכם לעומק, עונה מיידית ורושם נרשמים - 24 שעות ביממה.
            </Typography>

            {/* Pain point visual */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2,
                borderRadius: '9999px',
                bgcolor: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
              }}
            >
              <Clock size={24} style={{ color: '#8B5CF6' }} />
              <Typography
                sx={{
                  color: '#C4B5FD',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 500,
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                &quot;63% מהפניות מגיעות מחוץ לשעות העבודה&quot;
              </Typography>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: '#383838' }} />

      {/* =========== SOLUTION SECTION =========== */}
      <Box
        ref={solutionRef}
        sx={{
          py: { xs: 12, md: 16 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={solutionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}
          >
            <Typography
              sx={{
                color: '#8B5CF6',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              הפתרון
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.75rem', md: '2.75rem' },
                lineHeight: 1.2,
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              סוכן הרישום החכם
            </Typography>
            <Typography
              sx={{
                color: '#B0B0B0',
                fontSize: { xs: '0.95rem', md: '1.125rem' },
                lineHeight: 1.7,
                maxWidth: 620,
                mx: 'auto',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              סוכן AI מבוסס RAG שלומד את כל המידע של המוסד שלכם - ומספק מענה מומחה לכל פנייה.
            </Typography>
          </MotionBox>

          {/* Feature cards grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' },
              gap: 3,
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            {solutionFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionBox
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={solutionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '20px',
                    border: '1px solid #383838',
                    bgcolor: '#2c2e30',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#8B5CF6',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(139, 92, 246, 0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '14px',
                      bgcolor: 'rgba(139, 92, 246, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                    <Icon size={28} style={{ color: '#8B5CF6' }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.0625rem', md: '1.125rem' },
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#B0B0B0',
                      lineHeight: 1.7,
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </MotionBox>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: '#383838' }} />

      {/* =========== LIVE DEMO SECTION =========== */}
      <Box
        ref={demoRef}
        sx={{
          py: { xs: 12, md: 16 },
          bgcolor: '#2c2e30',
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}
          >
            <Typography
              sx={{
                color: '#8B5CF6',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              ראו בפעולה
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.75rem', md: '2.75rem' },
                lineHeight: 1.2,
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              דמו חי של סוכן ה-AI
            </Typography>
            <Typography
              sx={{
                color: '#B0B0B0',
                fontSize: { xs: '0.95rem', md: '1.125rem' },
                lineHeight: 1.7,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              שאלו כל שאלה על תוכנית לימודים לדוגמה - וראו איך הסוכן עונה בזמן אמת.
            </Typography>
          </MotionBox>

          {/* Chat demo placeholder */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{
              borderRadius: '24px',
              border: '1px solid #383838',
              bgcolor: '#222325',
              overflow: 'hidden',
            }}
          >
            {/* Chat header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2.5,
                borderBottom: '1px solid #323436',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'rgba(139, 92, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BotMessageSquare size={22} style={{ color: '#8B5CF6' }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                  }}
                >
                  סוכן הרישום AI
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#6fef93',
                    }}
                  />
                  <Typography
                    sx={{
                      color: '#808080',
                      fontSize: '0.75rem',
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    מחובר
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Chat body placeholder */}
            <Box
              sx={{
                minHeight: { xs: 300, md: 400 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                gap: 3,
              }}
            >
              {/* Sample messages */}
              <Box sx={{ width: '100%', maxWidth: 500 }}>
                {/* Bot greeting */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: 'rgba(139, 92, 246, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BotMessageSquare size={16} style={{ color: '#8B5CF6' }} />
                  </Box>
                  <Box
                    sx={{
                      bgcolor: '#323436',
                      borderRadius: '16px',
                      borderTopRight: '4px',
                      px: 3,
                      py: 2,
                      maxWidth: '85%',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#FFFFFF',
                        fontSize: '0.9375rem',
                        lineHeight: 1.7,
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                      }}
                    >
                      שלום! אני הסוכן הדיגיטלי של המכללה. אשמח לעזור לך עם מידע על
                      הקורסים שלנו, תהליך ההרשמה או כל שאלה אחרת. במה אוכל לעזור?
                    </Typography>
                  </Box>
                </Box>

                {/* User example */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: '16px',
                      px: 3,
                      py: 2,
                      maxWidth: '85%',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#FFFFFF',
                        fontSize: '0.9375rem',
                        lineHeight: 1.7,
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                      }}
                    >
                      מה נלמד בקורס UX/UI ומה המחיר?
                    </Typography>
                  </Box>
                </Box>

                {/* Bot response placeholder */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: 'rgba(139, 92, 246, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BotMessageSquare size={16} style={{ color: '#8B5CF6' }} />
                  </Box>
                  <Box
                    sx={{
                      bgcolor: '#323436',
                      borderRadius: '16px',
                      px: 3,
                      py: 2,
                      maxWidth: '85%',
                    }}
                  >
                    <MotionBox
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                    </MotionBox>
                  </Box>
                </Box>
              </Box>

              {/* Embed area note */}
              <Typography
                sx={{
                  color: '#4d4f51',
                  fontSize: '0.8125rem',
                  fontStyle: 'italic',
                  mt: 2,
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                כאן ישולב צ׳אט AI חי - דמו אינטראקטיבי בזמן אמת
              </Typography>
            </Box>

            {/* Chat input placeholder */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2.5,
                borderTop: '1px solid #323436',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#2c2e30',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  border: '1px solid #383838',
                }}
              >
                <Typography
                  sx={{
                    color: '#4d4f51',
                    fontSize: '0.9375rem',
                    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                  }}
                >
                  הקלידו שאלה...
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: '#7C3AED' },
                }}
              >
                <MessageSquare size={20} style={{ color: '#FFFFFF' }} />
              </Box>
            </Box>
          </MotionBox>

          {/* CTA under demo */}
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="primary"
              size="large"
              component={Link}
              to="/contact"
              sx={{
                px: { xs: 5, md: 7 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '0.95rem', md: '1.0625rem' },
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6fef93 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5cd680 100%)',
                },
              }}
            >
              רוצים סוכן כזה? דברו איתנו
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: '#383838' }} />

      {/* =========== SECURITY & COMPLIANCE =========== */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#222325' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 1.5,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              אבטחה ותאימות
            </Typography>
            <Typography
              sx={{
                color: '#808080',
                fontSize: '0.9375rem',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              המידע של המוסד והנרשמים מוגן בסטנדרטים הגבוהים ביותר.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            {securityItems.map((item) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 1.5,
                    borderRadius: '12px',
                    border: '1px solid #323436',
                    bgcolor: '#2c2e30',
                  }}
                >
                  <Icon size={20} style={{ color: '#8B5CF6' }} />
                  <Typography
                    sx={{
                      color: '#B0B0B0',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default AiInstitutions;
