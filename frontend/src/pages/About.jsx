import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StorageIcon from '@mui/icons-material/Storage';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Button from '../components/ui/Button';
import PageSEO from '../components/seo/PageSEO';

const MotionBox = motion.create(Box);

function SectionBlock({ children, delay = 0, style }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={style}
    >
      {children}
    </MotionBox>
  );
}

const philosophyItems = [
  {
    icon: PsychologyIcon,
    title: 'אפס עומס קוגניטיבי',
    description:
      'המערכות שלנו בנויות עם ממשקים נקיים, רזים ופשוטים להבנה (Clean UI). בלי כפתורים מיותרים ובלי בלבול. בדיוק מה שצריך, מתי שצריך.',
  },
  {
    icon: StorageIcon,
    title: 'המוח (The Brain) נשאר אצלנו',
    description:
      'להסתמך על טלאים של מערכות צד-שלישי שנוטות לקרוס זו פרקטיקה בעייתית. במקום זה, בנינו ארכיטקטורה טכנולוגית מאובטחת בשרתים שלנו, שפועלת בשקט ב-Backend שלכם, 24/7.',
  },
  {
    icon: HandshakeIcon,
    title: 'שותפות ארוכת טווח',
    description:
      'המודל שלנו נועד להעניק לכם בית טכנולוגי יציב. אנחנו מלווים אתכם צעד אחר צעד, מניהול הליד (Lead management) הראשון ועד סגירת המחזור של הקורס הבא שלכם.',
  },
];

function About() {
  return (
    <Box sx={{ bgcolor: '#0A0A0A' }}>
      <PageSEO
        title="אודות TailorBiz | הסיפור שלנו ומה מניע אותנו"
        description="TailorBiz נוסדה מתוך שטח - הסיפור שלנו, הפילוסופיה שלנו ולמה אנחנו מאמינים שטכנולוגיה צריכה לעבוד בשבילך, לא להפך."
      />
      {/* Hero Section */}
      <Box
        id="about-us"
        sx={{
          position: 'relative',
          py: { xs: 14, md: 20 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,153,0.04) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6 } }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}
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
              הסיפור שלנו
            </Typography>
            <Typography
              component="h1"
              sx={{
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              מפתחים טכנולוגיה,
              <br />
              מחסלים את כאוס האקסלים
            </Typography>
          </MotionBox>
        </Container>
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

      {/* Story Section */}
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 } }}>
        <SectionBlock>
          <Typography
            sx={{
              color: '#B0B0B0',
              fontSize: { xs: '1.05rem', md: '1.2rem' },
              lineHeight: 2,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              mb: 4,
            }}
          >
            הסיפור שלנו מתחיל מהשטח. במהלך העבודה שלנו עם לקוחות רבים, זיהינו דפוס כואב שחזר על
            עצמו שוב ושוב: האנשים המוכשרים ביותר – מאמנים, יועצים, יוצרי תוכן ומנהלי מרכזי הכשרה –
            קורסים תחת הנטל התפעולי.
          </Typography>
        </SectionBlock>

        <SectionBlock delay={0.1}>
          <Typography
            sx={{
              color: '#B0B0B0',
              fontSize: { xs: '1.05rem', md: '1.2rem' },
              lineHeight: 2,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              mb: 4,
            }}
          >
            ראינו מנטורים שרודפים אחרי תשלומים בביט כאילו אנחנו עדיין ב-2015. ראינו יועצי לימודים
            שחוקים, ומערכות שקורסות בדיוק ברגע האמת של ההשקה. הבנו שהטכנולוגיה, שהייתה אמורה לשמש
            כ-Enabler ולשחרר אותם, הפכה לסבך של קבצי אקסל מפוזרים, אוטומציות שבירות ולידים שהולכים
            לאיבוד בלילה.
          </Typography>
        </SectionBlock>
      </Container>

      {/* Breaking the method */}
      <Box sx={{ bgcolor: '#111111', py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 3, md: 6 } }}>
          <SectionBlock>
            <Typography
              sx={{
                color: '#00FF99',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              המשימה
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                mb: 4,
              }}
            >
              לשבור את השיטה: טכנולוגיה שעובדת בשבילכם
            </Typography>
          </SectionBlock>

          <SectionBlock delay={0.1}>
            <Typography
              sx={{
                color: '#B0B0B0',
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                lineHeight: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                mb: 4,
              }}
            >
              בשלב מסוים, נפל לנו האסימון. הבנו שמישהו חייב להעניק לאנשי החינוך וההדרכה של ישראל את
              מה שהם באמת צריכים: שליטה, סדר ושקט נפשי.
            </Typography>
          </SectionBlock>

          <SectionBlock delay={0.15}>
            <Typography
              sx={{
                color: '#B0B0B0',
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                lineHeight: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              לכן, אנחנו ב-TailorBiz מקדישים את המשאבים הטכנולוגיים שלנו לפיתוח מערכות ליבה יציבות
              וחכמות עבור עולמות ה-EdTech, ההדרכה ויצירת התוכן.
            </Typography>
          </SectionBlock>
        </Container>
      </Box>

      {/* Philosophy Section */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
          <SectionBlock>
            <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 }, maxWidth: 700, mx: 'auto' }}>
              <Typography
                sx={{
                  color: '#00FF99',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                הפילוסופיה שלנו
              </Typography>
              <Typography
                component="h2"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                איך אנחנו גורמים לזה לעבוד?
              </Typography>
            </Box>
          </SectionBlock>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {philosophyItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <SectionBlock key={index} delay={index * 0.12} style={{ display: 'flex' }}>
                    <Box
                      sx={{
                        width: '100%',
                        minHeight: { md: 320 },
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 4, md: 5 },
                        bgcolor: '#383838',
                        border: '1px solid #4a4a4a',
                        borderRadius: '2px',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: '#00FF99',
                          '& .philosophy-icon': {
                            color: '#0A0A0A',
                            bgcolor: '#00FF99',
                            borderColor: '#00FF99',
                          },
                        },
                      }}
                    >
                      <Box
                        className="philosophy-icon"
                        sx={{
                          width: 52,
                          height: 52,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 4,
                          bgcolor: '#1A1A1A',
                          border: '1px solid #333333',
                          borderRadius: '2px',
                          color: '#00FF99',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Icon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontSize: { xs: '1.35rem', md: '1.5rem' },
                          lineHeight: 1.2,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#B0B0B0',
                          lineHeight: 1.8,
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                </SectionBlock>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Closing + CTA */}
      <Box sx={{ bgcolor: '#111111', py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 3, md: 6 }, textAlign: 'center' }}>
          <SectionBlock>
            <Typography
              sx={{
                color: '#B0B0B0',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                mb: 6,
              }}
            >
              ב-TailorBiz אנחנו מאמינים שהטכנולוגיה צריכה לעבוד בשבילכם, ולא להפך. אנחנו כאן כדי
              להיות מערכת ההפעלה של העסק שלכם, כדי שתוכלו סוף סוף לשחרר את התפעול ולחזור לעשות את מה
              שאתם אוהבים באמת.
            </Typography>
          </SectionBlock>

          <SectionBlock delay={0.15}>
            <Typography
              component="h2"
              sx={{
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                lineHeight: 1.15,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                mb: 5,
              }}
            >
              מוכנים לקחת חזרה את השליטה?
            </Typography>
            <Button variant="primary" size="large" to="/contact">
              בואו נדבר
            </Button>
          </SectionBlock>
        </Container>
      </Box>
    </Box>
  );
}

export default About;
