import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Magnet,
  CreditCard,
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import Button from '../../components/ui/Button';

const MotionBox = motion.create(Box);

/* ── Palette ─────────────────────────────────────────────────── */
const C = {
  bgDeep: '#222325',
  bgSurface: '#2c2e30',
  bgCard: '#323436',
  border: '#383838',
  borderLight: '#4d4f51',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  accent: '#6fef93',
  accentHover: '#5cd680',
  accentGlow: 'rgba(111, 239, 147, 0.25)',
  accentSubtle: 'rgba(111, 239, 147, 0.08)',
  teal: '#06B6D4',
  tealSubtle: 'rgba(6, 182, 212, 0.08)',
  warning: '#F59E0B',
  warningSubtle: 'rgba(245, 158, 11, 0.08)',
  warningBorder: 'rgba(245, 158, 11, 0.20)',
};

const FONT = "'Heebo', system-ui, -apple-system, sans-serif";

/* ── Solution Features ───────────────────────────────────────── */
const features = [
  {
    icon: Magnet,
    title: 'קליטת לידים חכמה מהשקות',
    description:
      'כל ליד מהקמפיין, מדף הנחיתה או מהוובינר נכנס אוטומטית למערכת — עם תיוג, מקור ותעדוף מובנה.',
  },
  {
    icon: CreditCard,
    title: 'סליקה אוטומטית וחשבוניות',
    description:
      'הוראות קבע, תשלומים בכרטיס, חשבוניות מס אוטומטיות ותזכורות חוב — בלי לרדוף אחרי אף אחד.',
  },
  {
    icon: LayoutDashboard,
    title: 'דשבורד CRM ייעודי לקורסים',
    description:
      'תמונת מצב בזמן אמת: לידים, מכירות, נרשמים, תשלומים פתוחים ושיעורי המרה — הכל במבט אחד.',
  },
  {
    icon: Users,
    title: 'ניהול תלמידים מקצה לקצה',
    description:
      'מרגע ההרשמה ועד סיום הקורס: נוכחות, התקדמות, גישה לתכנים ותקשורת אישית — הכל אוטומטי.',
  },
];

/* ================================================================ */

function SaasCreators() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [painRef, painInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [leadRef, leadInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <Box sx={{ bgcolor: C.bgDeep, minHeight: '100vh' }}>
      <Helmet>
        <title>מערכת ניהול לבתי ספר ואקדמיות דיגיטליות | TailorBiz</title>
        <meta
          name="description"
          content="מערכת ההפעלה החכמה לבתי ספר, מכללות דיגיטליות ומרכזי קורסים. CRM, סליקה, ניהול תלמידים — הכל במקום אחד."
        />
      </Helmet>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          pt: { xs: 10, md: 14 },
          pb: { xs: 10, md: 16 },
          overflow: 'hidden',
        }}
      >
        {/* BG gradient wash */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, ${C.accentSubtle} 0%, transparent 40%, ${C.tealSubtle} 100%)`,
            zIndex: 0,
          }}
        />
        {/* Decorative orb — blue */}
        <MotionBox
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            top: '-5%',
            right: '-5%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`,
            filter: 'blur(100px)',
            zIndex: 0,
          }}
        />
        {/* Decorative orb — teal */}
        <MotionBox
          animate={{ x: [0, -15, 0], y: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '5%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            filter: 'blur(90px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Box
              component={Link}
              to="/services"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: C.textMuted,
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontFamily: FONT,
                mb: 5,
                transition: 'color 0.3s',
                '&:hover': { color: C.accent },
              }}
            >
              <ArrowRight size={14} />
              חזרה לשירותים
            </Box>
          </MotionBox>

          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            {/* Text column */}
            <Grid item xs={12} md={7}>
              <MotionBox
                initial={{ opacity: 0, y: 40 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                {/* Tag */}
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    mb: 3,
                    borderRadius: '6px',
                    bgcolor: C.accentSubtle,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: C.accent,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontFamily: FONT,
                    }}
                  >
                    DIGITAL ACADEMY PLATFORM
                  </Typography>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    color: C.textPrimary,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                    lineHeight: 1.15,
                    fontFamily: FONT,
                  }}
                >
                  מערכת ההפעלה החכמה לבתי ספר, מכללות דיגיטליות ומרכזי קורסים.
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    mb: 5,
                    fontWeight: 400,
                    color: C.textSecondary,
                    fontSize: { xs: '1rem', md: '1.1875rem' },
                    lineHeight: 1.75,
                    fontFamily: FONT,
                    maxWidth: 580,
                  }}
                >
                  בנינו את התשתית הטכנולוגית המושלמת עבור יועצים, מטפלים ומאמנים שעושים את קפיצת
                  המדרגה מליווי אישי (1:1) — להקמת אקדמיה וניהול קורסים מרובי משתתפים.
                </Typography>

                {/* CTAs */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                  }}
                >
                  <Button
                    variant="primary"
                    size="large"
                    to="/contact"
                  >
                    קבעו שיחת אפיון לאקדמיה שלכם
                  </Button>
                  <Button
                    variant="secondary"
                    size="large"
                    to="/services"
                  >
                    האם העסק שלי מוכן למעבר לאקדמיה?
                  </Button>
                </Box>
              </MotionBox>
            </Grid>

            {/* Dashboard mockup */}
            <Grid item xs={12} md={5}>
              <MotionBox
                initial={{ opacity: 0, x: -40 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{
                  width: '100%',
                  borderRadius: '20px',
                  border: `1px solid ${C.border}`,
                  bgcolor: C.bgDeep,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${C.borderLight}`,
                }}
              >
                {/* Browser top bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 1.25,
                    borderBottom: `1px solid ${C.border}`,
                    bgcolor: C.bgSurface,
                  }}
                >
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#22C55E' }} />
                  <Box
                    sx={{
                      flex: 1,
                      mx: 1.5,
                      height: 20,
                      borderRadius: '6px',
                      bgcolor: C.bgCard,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        color: C.textMuted,
                        fontSize: '0.55rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.03em',
                      }}
                    >
                      app.tailorbiz.co.il/dashboard
                    </Typography>
                  </Box>
                </Box>

                {/* Dashboard body */}
                <Box sx={{ display: 'flex', minHeight: { xs: 220, md: 300 } }}>
                  {/* Sidebar */}
                  <Box
                    sx={{
                      width: { xs: 44, md: 56 },
                      borderLeft: `1px solid ${C.border}`,
                      bgcolor: C.bgSurface,
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    {/* Logo placeholder */}
                    <Box
                      sx={{
                        width: { xs: 24, md: 28 },
                        height: { xs: 24, md: 28 },
                        borderRadius: '8px',
                        bgcolor: C.accent,
                        opacity: 0.9,
                        mb: 1,
                      }}
                    />
                    {/* Nav icons */}
                    {[true, false, false, false, false].map((active, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: { xs: 20, md: 24 },
                          height: { xs: 20, md: 24 },
                          borderRadius: '6px',
                          bgcolor: active ? `${C.accent}22` : 'transparent',
                          border: active ? `1px solid ${C.accent}44` : '1px solid transparent',
                        }}
                      />
                    ))}
                  </Box>

                  {/* Main content */}
                  <Box sx={{ flex: 1, p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Stats row */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {[
                        { value: '247', label: 'לידים', color: C.accent, change: '+18%' },
                        { value: '₪89K', label: 'הכנסות', color: C.teal, change: '+23%' },
                        { value: '76%', label: 'המרה', color: '#8B5CF6', change: '+5%' },
                      ].map((stat, i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            p: { xs: 1, md: 1.25 },
                            borderRadius: '8px',
                            bgcolor: C.bgCard,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <Typography
                            sx={{
                              color: stat.color,
                              fontSize: { xs: '0.7rem', md: '0.95rem' },
                              fontWeight: 800,
                              fontFamily: FONT,
                              lineHeight: 1.2,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              sx={{
                                color: C.textMuted,
                                fontSize: { xs: '0.45rem', md: '0.6rem' },
                                fontFamily: FONT,
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography
                              sx={{
                                color: C.accent,
                                fontSize: { xs: '0.4rem', md: '0.5rem' },
                                fontWeight: 600,
                                fontFamily: 'monospace',
                              }}
                            >
                              {stat.change}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Mini chart area */}
                    <Box
                      sx={{
                        borderRadius: '8px',
                        bgcolor: C.bgCard,
                        border: `1px solid ${C.border}`,
                        p: { xs: 1, md: 1.5 },
                        flex: 1,
                        minHeight: { xs: 50, md: 70 },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        sx={{
                          color: C.textSecondary,
                          fontSize: { xs: '0.45rem', md: '0.6rem' },
                          fontWeight: 600,
                          fontFamily: FONT,
                          mb: 0.5,
                        }}
                      >
                        נרשמים חדשים — 7 ימים אחרונים
                      </Typography>
                      {/* Fake bar chart */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: { xs: '3px', md: '5px' },
                          height: { xs: 30, md: 44 },
                          mt: 0.5,
                        }}
                      >
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <Box
                            key={i}
                            sx={{
                              flex: 1,
                              height: `${h}%`,
                              borderRadius: '3px 3px 0 0',
                              bgcolor: i === 5 ? C.accent : `${C.accent}55`,
                              transition: 'all 0.3s',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Table */}
                    <Box
                      sx={{
                        borderRadius: '8px',
                        bgcolor: C.bgCard,
                        border: `1px solid ${C.border}`,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Table header */}
                      <Box
                        sx={{
                          display: 'flex',
                          px: { xs: 1, md: 1.5 },
                          py: 0.5,
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {['שם', 'סטטוס', 'תאריך'].map((col) => (
                          <Typography
                            key={col}
                            sx={{
                              flex: 1,
                              color: C.textMuted,
                              fontSize: { xs: '0.4rem', md: '0.55rem' },
                              fontWeight: 600,
                              fontFamily: FONT,
                            }}
                          >
                            {col}
                          </Typography>
                        ))}
                      </Box>
                      {/* Table rows */}
                      {[
                        { name: 'דנה כהן', status: 'נרשם', statusColor: C.accent },
                        { name: 'יוסי לוי', status: 'ממתין', statusColor: C.warning },
                        { name: 'מיכל אברהם', status: 'נרשם', statusColor: C.accent },
                      ].map((row, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: { xs: 1, md: 1.5 },
                            py: { xs: 0.5, md: 0.75 },
                            borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                          }}
                        >
                          <Typography
                            sx={{
                              flex: 1,
                              color: C.textPrimary,
                              fontSize: { xs: '0.45rem', md: '0.6rem' },
                              fontWeight: 500,
                              fontFamily: FONT,
                            }}
                          >
                            {row.name}
                          </Typography>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                bgcolor: row.statusColor,
                              }}
                            />
                            <Typography
                              sx={{
                                color: row.statusColor,
                                fontSize: { xs: '0.4rem', md: '0.55rem' },
                                fontWeight: 600,
                                fontFamily: FONT,
                              }}
                            >
                              {row.status}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              flex: 1,
                              color: C.textMuted,
                              fontSize: { xs: '0.4rem', md: '0.5rem' },
                              fontFamily: 'monospace',
                            }}
                          >
                            {`${22 - i}/02/26`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Bottom glow */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '20%',
                    background: `linear-gradient(to top, ${C.bgDeep} 0%, transparent 100%)`,
                    pointerEvents: 'none',
                  }}
                />
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: C.border }} />

      {/* ═══════════════════ PAIN & SOLUTION ═══════════════════ */}
      <Box
        ref={painRef}
        sx={{
          py: { xs: 12, md: 16 },
          bgcolor: C.bgSurface,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          {/* Section intro */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={painInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: 'center', mb: { xs: 5, md: 7 }, maxWidth: 750, mx: 'auto' }}
          >
            <Typography
              sx={{
                color: C.accent,
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                fontFamily: FONT,
              }}
            >
              הבעיה והפתרון
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: C.textPrimary,
                fontSize: { xs: '1.625rem', md: '2.5rem' },
                lineHeight: 1.25,
                mb: 3,
                fontFamily: FONT,
              }}
            >
              כשהעסק גדל — הכלים הישנים נשברים
            </Typography>
            <Typography
              sx={{
                color: C.textSecondary,
                fontSize: { xs: '0.95rem', md: '1.0625rem' },
                lineHeight: 1.8,
                fontFamily: FONT,
              }}
            >
              כשהעסק גדל מ&quot;רק אני&quot; לבית ספר של ממש, וואטסאפ ואקסל כבר לא מספיקים. המערכת
              שלנו מחליפה את הבלגן התפעולי בתשתית ניהול מוסדית.
            </Typography>
          </MotionBox>

          {/* Feature cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              maxWidth: 920,
              mx: 'auto',
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionBox
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={painInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '16px',
                    border: `1px solid ${C.border}`,
                    bgcolor: C.bgCard,
                    transition: 'all 0.35s ease',
                    '&:hover': {
                      borderColor: C.accent,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 48px rgba(111, 239, 147, 0.10)`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      bgcolor: C.accentSubtle,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                    <Icon size={26} style={{ color: C.accent }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: C.textPrimary,
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1rem', md: '1.0625rem' },
                      fontFamily: FONT,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: C.textSecondary,
                      lineHeight: 1.75,
                      fontSize: { xs: '0.85rem', md: '0.9375rem' },
                      fontFamily: FONT,
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
      <Box sx={{ height: '1px', bgcolor: C.border }} />

      {/* ═══════════════════ LEAD MAGNET ═══════════════════ */}
      <Box
        ref={leadRef}
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={leadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '20px',
              border: `1px solid ${C.warningBorder}`,
              bgcolor: C.warningSubtle,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle glow */}
            <Box
              sx={{
                position: 'absolute',
                top: '-30%',
                right: '-10%',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  border: `1px solid ${C.warningBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <AlertTriangle size={28} style={{ color: C.warning }} />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: C.textPrimary,
                  fontSize: { xs: '1.5rem', md: '2.25rem' },
                  lineHeight: 1.25,
                  mb: 2,
                  fontFamily: FONT,
                }}
              >
                כמה עסקאות נופלות לכם בין הכיסאות
                <br />
                בגלל אקסל מבולגן?
              </Typography>

              <Typography
                sx={{
                  color: C.textSecondary,
                  fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  fontFamily: FONT,
                }}
              >
                אבחון חינם של 5 דקות שיראה לכם בדיוק כמה כסף אתם משאירים על השולחן — ואיך לשנות את
                זה.
              </Typography>

              <Button
                variant="primary"
                size="large"
                to="/contact"
                sx={{
                  bgcolor: C.warning,
                  color: '#222325',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#D97706',
                    boxShadow: '0 8px 28px rgba(245, 158, 11, 0.25)',
                    transform: 'scale(1.03)',
                  },
                }}
              >
                התחילו אבחון חינם למערכת ההשקות
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* ═══════════════════ TRUST / COMPLIANCE FOOTER ═══════════════════ */}
      <Box
        sx={{
          py: { xs: 5, md: 6 },
          borderTop: `1px solid ${C.border}`,
          bgcolor: C.bgSurface,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 2, md: 3 },
              textAlign: { xs: 'center', md: 'right' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: C.accentSubtle,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} style={{ color: C.accent }} />
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: C.accentSubtle,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileCheck2 size={20} style={{ color: C.accent }} />
              </Box>
            </Box>
            <Typography
              sx={{
                color: C.textMuted,
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                lineHeight: 1.7,
                fontFamily: FONT,
              }}
            >
              המערכת שלנו כוללת איסוף אישורי דיוור (Opt-in) אוטומטיים להגנה מלאה מפני חוק הספאם,
              ומבוססת על תקני אבטחת המידע המחמירים ביותר.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default SaasCreators;
