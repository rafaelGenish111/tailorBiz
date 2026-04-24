import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import PageSEO from '../../components/seo/PageSEO';
import { Sparkles, GraduationCap, ArrowLeft } from 'lucide-react';
import ServiceQuiz from '../../components/services/ServiceQuiz';

const MotionBox = motion.create(Box);

const pathways = [
  {
    id: 'saas-creators',
    icon: Sparkles,
    label: 'לבתי ספר ואקדמיות דיגיטליות',
    title: 'מערכת ההפעלה החכמה לאקדמיה שלכם',
    description:
      'CRM, סליקה, ניהול תלמידים וקליטת לידים - תשתית טכנולוגית מושלמת למאמנים שעושים את הקפיצה לקורסים מרובי משתתפים.',
    path: '/services/saas-creators',
    accentColor: '#6fef93',
    gradient: 'linear-gradient(135deg, rgba(111, 239, 147, 0.12) 0%, rgba(111, 239, 147, 0.03) 100%)',
    hoverGradient: 'linear-gradient(135deg, rgba(111, 239, 147, 0.18) 0%, rgba(111, 239, 147, 0.06) 100%)',
  },
  {
    id: 'ai-institutions',
    icon: GraduationCap,
    label: 'למרכזי הכשרה ומוסדות',
    title: 'AI למרכזי הכשרה ומוסדות',
    description:
      'סוכן AI חכם שמשיב לפניות 24/7, מומחה בסילבוס שלכם, רושם נרשמים ולא מפספס אף ליד - גם בשלוש בלילה.',
    path: '/services/ai-institutions',
    accentColor: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.03) 100%)',
    hoverGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.06) 100%)',
  },
];

function PathwayCard({ pathway, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const Icon = pathway.icon;

  return (
    <MotionBox
      ref={ref}
      component={Link}
      to={pathway.path}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: { xs: 4, md: 6 },
        borderRadius: '12px',
        border: '1px solid',
        borderColor: '#383838',
        background: pathway.gradient,
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 340, md: 420 },
        justifyContent: 'center',
        '&:hover': {
          borderColor: pathway.accentColor,
          background: pathway.hoverGradient,
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 60px ${pathway.accentColor}20`,
          '& .pathway-arrow': {
            transform: 'translateX(-4px)',
            color: pathway.accentColor,
          },
          '& .pathway-icon-box': {
            borderColor: pathway.accentColor,
            bgcolor: `${pathway.accentColor}18`,
          },
        },
      }}
    >
      {/* Icon */}
      <Box
        className="pathway-icon-box"
        sx={{
          width: 80,
          height: 80,
          borderRadius: '12px',
          border: '1px solid #4d4f51',
          bgcolor: '#323436',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          transition: 'all 0.4s ease',
        }}
      >
        <Icon size={36} style={{ color: pathway.accentColor }} />
      </Box>

      {/* Label */}
      <Typography
        sx={{
          color: pathway.accentColor,
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          mb: 1.5,
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
        }}
      >
        {pathway.label}
      </Typography>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: { xs: '1.5rem', md: '2rem' },
          lineHeight: 1.2,
          mb: 2,
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
        }}
      >
        {pathway.title}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          color: '#B0B0B0',
          fontSize: { xs: '0.95rem', md: '1.0625rem' },
          lineHeight: 1.8,
          mb: 4,
          maxWidth: 400,
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
        }}
      >
        {pathway.description}
      </Typography>

      {/* CTA arrow */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '1rem',
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
          transition: 'all 0.3s ease',
        }}
      >
        למידע נוסף
        <ArrowLeft
          size={20}
          className="pathway-arrow"
          style={{ transition: 'all 0.3s ease' }}
        />
      </Box>
    </MotionBox>
  );
}

function ServicesPage() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <Box sx={{ bgcolor: '#222325', minHeight: '100vh' }}>
      <PageSEO
        title="שירותים | TailorBiz - פתרונות טכנולוגיים חכמים"
        description="פתרונות SaaS למאמנים ויוצרי תוכן וסוכן AI למרכזי הכשרה ומוסדות חינוך. בחרו את המסלול המתאים לכם."
      />

      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          py: { xs: 12, md: 18 },
          overflow: 'hidden',
        }}
      >
        {/* Background gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(111, 239, 147, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
            zIndex: 0,
          }}
        />

        {/* Decorative orbs */}
        <MotionBox
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            top: '5%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111, 239, 147, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />
        <MotionBox
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '15%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: { xs: 8, md: 10 } }}
          >
            <Typography
              sx={{
                color: '#6fef93',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              השירותים שלנו
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
              טכנולוגיה שעובדת בשבילכם
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#B0B0B0',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              בחרו את המסלול המתאים לעסק שלכם - ותנו לנו לעשות את השאר.
            </Typography>
          </MotionBox>

          {/* Pathway Cards - Split Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 3, md: 4 },
              maxWidth: 1000,
              mx: 'auto',
            }}
          >
            {pathways.map((pathway, index) => (
              <PathwayCard key={pathway.id} pathway={pathway} index={index} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: '#383838' }} />

      {/* Smart Quiz Section */}
      <ServiceQuiz />
    </Box>
  );
}

export default ServicesPage;
