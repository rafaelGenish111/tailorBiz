import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Card,
  useTheme,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// רישום רכיבי הגרפים
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// הגדרות גלובליות לגרפים כדי להתאים לעיצוב
ChartJS.defaults.font.family = "'Heebo', sans-serif";
ChartJS.defaults.color = '#475569';

const PartnershipPitch = () => {
  const theme = useTheme();
  const [currentView, setCurrentView] = useState('silos');
  const [activeTab, setActiveTab] = useState('logistics');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const LOGO_SRC = '/assets/images/image-removebg-preview.png';

  // --- נתונים ---
  const sectorData = {
    logistics: {
      title: "האתגר: נתק בין המכירה למחסן",
      problem: "העסקה נסגרה במערכת, אבל המחסנאי לא יודע מזה בזמן אמת. התוצאה: מוכרים סחורה שאין, משלוחים מתעכבים, ולקוחות לא מקבלים עדכונים.",
      solutionSteps: [
        { icon: "🔄", title: "סנכרון מלאי", desc: "סגירה במערכת הליבה נועלת מלאי ב-ERP" },
        { icon: "📱", title: "ליקוט דיגיטלי", desc: "טאבלט למחסנאי במקום דפים מודפסים" },
        { icon: "🚚", title: "שילוח אוטומטי", desc: "הפקת תעודת משלוח ומדבקה ללא מגע יד" },
        { icon: "💬", title: "עדכון לקוח", desc: "SMS אוטומטי עם סטטוס ומעקב" }
      ],
      chartType: 'Line',
      chartData: {
        labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
        datasets: [
          {
            label: 'טעויות מלאי (ידני)',
            data: [15, 18, 14, 20, 22, 19],
            borderColor: '#EF4444',
            backgroundColor: '#EF4444',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4
          },
          {
            label: 'טעויות מלאי (אוטומטי)',
            data: [15, 8, 3, 1, 0, 0],
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}1A`,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
            tension: 0.4
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'ירידה בטעויות מלאי לאחר הטמעה', font: { size: 16 } },
          tooltip: { mode: 'index', intersect: false, backgroundColor: '#1e293b' }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { borderDash: [5, 5] } }
        }
      }
    },
    service: {
      title: "האתגר: ניהול עובדי שטח וגבייה",
      problem: "יש לחברה 50 עובדים בשטח. איך יודעים מי הגיע? בסוף החודש צריך להוציא 200 חשבוניות ידנית על בסיס דיווחים חלקיים. סיוט תפעולי.",
      solutionSteps: [
        { icon: "📍", title: "שעון נוכחות", desc: "דיווח בוט וואטסאפ + אימות מיקום GPS" },
        { icon: "⚠️", title: "התראות חריגה", desc: "מנהל מקבל התראה בזמן אמת על איחור" },
        { icon: "💰", title: "בילינג המוני", desc: "הפקת מאות חשבוניות בקליק אחד" },
        { icon: "📉", title: "חיסכון באדמין", desc: "חיסכון של ימי עבודה שלמים בחודש" }
      ],
      chartType: 'Bar',
      chartData: {
        labels: ['שבוע 1', 'שבוע 2', 'שבוע 3', 'שבוע 4'],
        datasets: [
          {
            label: 'שעות אדמין (לפני)',
            data: [40, 42, 38, 45],
            backgroundColor: '#94a3b8',
            borderRadius: 4
          },
          {
            label: 'שעות אדמין (אחרי)',
            data: [5, 4, 6, 5],
            backgroundColor: theme.palette.primary.main,
            borderRadius: 4
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'שעות ניהול שנחסכו (חודשי)', font: { size: 16 } }
        },
        scales: {
          y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
          x: { grid: { display: false } }
        }
      }
    },
    projects: {
      title: "האתגר: רווחיות פרויקט בזמן אמת",
      problem: "פרויקט מורכב עם ספקים רבים. המכירה נסגרה, אבל האם הפרויקט רווחי? לרוב מגלים רק כשהחשבוניות מגיעות חודש אחרי, כשכבר מאוחר מדי.",
      solutionSteps: [
        { icon: "📅", title: "פתיחת פרויקט", desc: "יצירת לוח משימות ותקציב אוטומטי" },
        { icon: "🛒", title: "רכש ספקים", desc: "הזמנות רכש דיגיטליות ומעקב אספקה" },
        { icon: "📊", title: "בקרת תקציב", desc: "קיזוז הוצאות מהתקציב בזמן אמת" },
        { icon: "✅", title: "דשבורד מנכ\"ל", desc: "שליטה מלאה ברווחיות לפני סיום הפרויקט" }
      ],
      chartType: 'Doughnut',
      chartData: {
        labels: ['נוצל (ספקים)', 'נוצל (כ"א)', 'תקציב פנוי', 'רווח צפוי'],
        datasets: [{
          data: [30, 20, 15, 35],
          backgroundColor: ['#EF4444', '#F59E0B', '#E2E8F0', theme.palette.success.main],
          borderWidth: 0
        }]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'סטטוס תקציב אירוע (בזמן אמת)', font: { size: 16 } },
          legend: { position: 'bottom', labels: { padding: 20 } }
        },
        cutout: '70%'
      }
    },
    beauty: {
      title: "האתגר: ביטולים וניהול יומן",
      problem: "היומן מלא, אבל אחוז ניכר מהלקוחות מבטלים ברגע האחרון או לא מגיעים. הצוות משקיע שעות בתיאומים טלפוניים במקום במתן שירות.",
      solutionSteps: [
        { icon: "🤖", title: "בוט זימון", desc: "לקוחות קובעים לבד בוואטסאפ 24/7" },
        { icon: "🔔", title: "מניעת הברזות", desc: "תזכורת אוטומטית + בקשת אישור הגעה מחייב" },
        { icon: "📁", title: "תיק דיגיטלי", desc: "תיעוד היסטוריה, תמונות והעדפות לקוח" },
        { icon: "♻️", title: "שימור לקוחות", desc: "הודעות 'בואי לחדש' אוטומטיות למי שלא חזר" }
      ],
      chartType: 'Bar',
      chartData: {
        labels: ['חודש 1', 'חודש 2', 'חודש 3'],
        datasets: [{
          label: 'אחוז הברזות (No-Show)',
          data: [18, 5, 2],
          backgroundColor: ['#EF4444', '#F59E0B', theme.palette.success.main],
          borderRadius: 8
        }]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'ירידה דרמטית בהברזות', font: { size: 16 } },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { borderDash: [5, 5] }, title: { display: true, text: '% ביטולים' } },
          x: { grid: { display: false } }
        }
      }
    },
    education: {
      title: "האתגר: אדמיניסטרציה ובירוקרטיה",
      problem: "הלידים מגיעים, אבל תהליכי הרישום, החוזים, הגבייה והפקת התעודות נעשים ידנית. המזכירות קורסות תחת עומס הניירת.",
      solutionSteps: [
        { icon: "📝", title: "רישום דיגיטלי", desc: "טופס חכם שפותח כרטיס וקולט נתונים" },
        { icon: "✒️", title: "חתימה מרחוק", desc: "שליחת חוזים לחתימה דיגיטלית ב-SMS" },
        { icon: "💳", title: "הסדרת תשלומים", desc: "הקמת הוראות קבע וחיובים אוטומטיים" },
        { icon: "🎓", title: "תעודות סיום", desc: "הפקה ושליחה אוטומטית לבוגרים בסיום הקורס" }
      ],
      chartType: 'Line',
      chartData: {
        labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
        datasets: [
          {
            label: 'זמן טיפול בסטודנט (דקות בחודש)',
            data: [120, 115, 125, 30, 25, 20],
            borderColor: theme.palette.secondary.main,
            backgroundColor: `${theme.palette.secondary.main}1A`,
            fill: true,
            tension: 0.4
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'זמן אדמיניסטרציה לכל סטודנט', font: { size: 16 } },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
          x: { grid: { display: false } }
        }
      }
    }
  };

  const currentSector = sectorData[activeTab];

  const tabs = [
    { id: 'logistics', label: '📦 לוגיסטיקה' },
    { id: 'service', label: '🛠️ שירות' },
    { id: 'projects', label: '📊 פרויקטים' },
    { id: 'beauty', label: '💇‍♀️ קליניקות' },
    { id: 'education', label: '🎓 מוסדות לימוד' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Logo Header - Only Logo in Center */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'background.default',
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src={LOGO_SRC}
          alt="לוגו"
          sx={{
            height: { xs: 48, md: 56 },
            width: 'auto',
            objectFit: 'contain',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </Box>

      {/* Hero Section */}
      <Box
        id="hero"
        sx={{
          position: 'relative',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        {/* Background Shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: 200, md: 400 },
            height: { xs: 200, md: 400 },
            bgcolor: 'primary.light',
            opacity: 0.1,
            borderRadius: '50%',
            filter: 'blur(60px)',
            transform: 'translate(20%, -20%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: { xs: 200, md: 350 },
            height: { xs: 200, md: 350 },
            bgcolor: 'secondary.light',
            opacity: 0.05,
            borderRadius: '50%',
            filter: 'blur(60px)',
            transform: 'translate(-20%, 20%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            מתוכנות מנותקות
            <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              למערכת הפעלה עסקית מלאה
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.8,
            }}
          >
            מערכות הליבה הן המוח.{' '}
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              אנחנו בונים את הידיים והרגליים.
            </Box>
            <br />
            יחד נהפוך עסקים בצמיחה למכונות משומנות, נחבר את "איי המידע" ונייצר ללקוחות שלכם שקט תעשייתי.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => scrollToSection('sectors')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              איך זה נראה בפועל?
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => scrollToSection('gap')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderColor: 'text.secondary',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(11, 31, 51, 0.05)',
                },
              }}
            >
              למה זה קריטי?
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* The Gap Section */}
      <Box id="gap" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.75rem',
              }}
            >
              The Gap
            </Typography>
            <Typography variant="h2" sx={{ mt: 2, mb: 2, fontWeight: 700 }}>
              איפה אנחנו נכנסים לתמונה?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                maxWidth: '700px',
                mx: 'auto',
                color: 'text.secondary',
                fontSize: '1.125rem',
              }}
            >
              עסקים משקיעים בתוכנות ליבה מצוינות (CRM, ERP), אבל המשרד האחורי (Back Office) והתפעול השוטף עדיין סובלים מנתק. ה"חורים" האלו יוצרים כאוס.
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  bgcolor: 'grey.100',
                  borderRadius: 3,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <Button
                  onClick={() => setCurrentView('silos')}
                  variant={currentView === 'silos' ? 'contained' : 'text'}
                  sx={{
                    borderRadius: 2.5,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: { xs: 120, md: 180 },
                  }}
                >
                  המצב המצוי: "איי מידע"
                </Button>
                <Button
                  onClick={() => setCurrentView('connected')}
                  variant={currentView === 'connected' ? 'contained' : 'text'}
                  sx={{
                    borderRadius: 2.5,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: { xs: 120, md: 180 },
                  }}
                >
                  המצב הרצוי: "אוטומציה"
                </Button>
              </Paper>
            </Box>

            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, md: 400 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                overflow: 'hidden',
                mb: 3,
              }}
            >
              {currentView === 'silos' ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    gap: 2,
                    width: '100%',
                    flexWrap: 'nowrap',
                    px: 2,
                  }}
                >
                  {[
                    { icon: '🤝', label: 'CRM / מכירות' },
                    { icon: '📦', label: 'לוגיסטיקה (אקסל)' },
                    { icon: '🧾', label: 'הנה"ח / כספים' },
                    { icon: '💬', label: 'תקשורת (וואטסאפ)' },
                  ].map((item, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        textAlign: 'center',
                        p: 3,
                        flex: { xs: '1 1 auto', sm: '1 1 0' },
                        minWidth: 0,
                        height: { xs: 'auto', sm: 160 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Typography sx={{ fontSize: '3rem', mb: 1, flexShrink: 0 }}>
                        {item.icon}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'error.dark',
                          fontSize: { xs: '0.875rem', sm: '0.75rem', md: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 2, sm: 2 },
                    width: '100%',
                    flexWrap: 'nowrap',
                    mx: 'auto',
                    px: 2,
                    position: 'relative',
                  }}
                >
                  {[
                    { icon: '🤝', label: 'מכירה' },
                    { icon: '⚙️', label: 'אינטגרציה' },
                    { icon: '📦', label: 'תפעול' },
                    { icon: '💰', label: 'כסף' },
                  ].map((item, idx) => (
                    <React.Fragment key={idx}>
                      <Card
                        sx={{
                          width: { xs: 120, sm: 120, md: 130 },
                          height: { xs: 120, sm: 120, md: 130 },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor:
                            idx === 3 ? 'success.main' : 'primary.main',
                          boxShadow: 4,
                          bgcolor: 'background.default',
                          flexShrink: 0,
                          minWidth: 0,
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' }, mb: 1 }}>
                          {item.icon}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            textAlign: 'center',
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Card>
                      {idx < 3 && (
                        <>
                          <Typography
                            sx={{
                              fontSize: '2rem',
                              color: 'primary.main',
                              display: { xs: 'block', sm: 'none' },
                            }}
                          >
                            ⬇️
                          </Typography>
                          <Box
                            sx={{
                              display: { xs: 'none', sm: 'block' },
                              width: { sm: 40, md: 50 },
                              height: 2,
                              bgcolor: 'primary.light',
                              borderRadius: 1,
                              flexShrink: 0,
                              position: 'relative',
                              zIndex: 2,
                            }}
                          />
                        </>
                      )}
                    </React.Fragment>
                  ))}
                  {/* Animated ball that flows between cards - behind the cards */}
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      position: 'absolute',
                      top: '50%',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
                      transform: 'translateY(-50%)',
                      zIndex: 1,
                      animation: 'flowBall 4s ease-in-out infinite',
                      '@keyframes flowBall': {
                        '0%': {
                          left: 'calc(12.5% - 7px)',
                        },
                        '25%': {
                          left: 'calc(37.5% - 7px)',
                        },
                        '50%': {
                          left: 'calc(62.5% - 7px)',
                        },
                        '75%': {
                          left: 'calc(87.5% - 7px)',
                        },
                        '100%': {
                          left: 'calc(12.5% - 7px)',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                minHeight: 48,
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {currentView === 'silos' ? (
                <>
                  <Box
                    component="span"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 700,
                      color: 'error.dark',
                      ml: 1,
                    }}
                  >
                    הבעיה:
                  </Box>
                  מערכות מנותקות, העתק-הדבק ידני, וטעויות אנוש.
                </>
              ) : (
                <>
                  <Box
                    component="span"
                    sx={{
                      bgcolor: 'rgba(11, 31, 51, 0.1)',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 700,
                      color: 'primary.main',
                      ml: 1,
                    }}
                  >
                    הפתרון:
                  </Box>
                  זרימת מידע אוטומטית מקצה לקצה (End-to-End).
                </>
              )}
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box id="sectors" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.75rem',
              }}
            >
              Use Cases
            </Typography>
            <Typography variant="h2" sx={{ mt: 2, mb: 2, fontWeight: 700 }}>
              דוגמאות מהשטח
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                color: 'text.secondary',
                fontSize: '1.125rem',
              }}
            >
              בחרו סקטור כדי לראות איך אנחנו משלימים את המערכות הקיימות ופותרים בעיות תפעוליות כואבות.
            </Typography>
          </Box>

          {/* Tab Navigation */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1,
              mb: 6,
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderBottom:
                    activeTab === tab.id
                      ? `4px solid ${theme.palette.primary.dark}`
                      : '4px solid transparent',
                  bgcolor:
                    activeTab === tab.id
                      ? 'rgba(11, 31, 51, 0.1)'
                      : 'transparent',
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          {/* Tab Content */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'grey.200',
              minHeight: 600,
            }}
          >
            <Grid container spacing={4} justifyContent="center">
              {/* Left Column: Story */}
              <Grid item xs={12} lg={6} sx={{ maxWidth: { lg: '600px' } }}>
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                  {currentSector.title}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    borderRight: '4px solid',
                    borderColor: 'error.main',
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: 'error.dark',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <span>⚠️</span> הבעיה:
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {currentSector.problem}
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 3,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                      textAlign: 'center',
                    }}
                  >
                    הפתרון (התהליך האוטומטי):
                  </Typography>
                  <Stack spacing={3}>
                    {currentSector.solutionSteps.map((step, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          '&:hover .step-icon': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Box
                          className="step-icon"
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'rgba(11, 31, 51, 0.1)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 0.5 }}
                          >
                            {index + 1}. {step.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', lineHeight: 1.8 }}
                          >
                            {step.desc}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              {/* Right Column: Visualization */}
              <Grid item xs={12} lg={6} sx={{ maxWidth: { lg: '600px' } }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                  }}
                >
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      נתוני ביצועים
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      הדמיית נתונים מלקוחות קיימים
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 300, md: 350 },
                      flex: 1,
                    }}
                  >
                    {currentSector.chartType === 'Line' && (
                      <Line
                        data={currentSector.chartData}
                        options={currentSector.chartOptions}
                      />
                    )}
                    {currentSector.chartType === 'Bar' && (
                      <Bar
                        data={currentSector.chartData}
                        options={currentSector.chartOptions}
                      />
                    )}
                    {currentSector.chartType === 'Doughnut' && (
                      <Doughnut
                        data={currentSector.chartData}
                        options={currentSector.chartOptions}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Model Section */}
      <Box
        id="model"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'primary.dark',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 8,
              fontWeight: 700,
              color: 'white',
            }}
          >
            מודל העבודה המשותף
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: 4,
              width: '100%',
            }}
          >
            {[
              {
                icon: '🔍',
                title: '1. מיפוי (Mapping)',
                text: 'אני נכנס ללקוח לביצוע "תמונת רנטגן" לעסק. מזהים איפה המערכת הקיימת נגמרת ואיפה הבעיות מתחילות.',
              },
              {
                icon: '⚙️',
                title: '2. בנייה (Building)',
                text: 'פיתוח המודולים המשלימים (לוגיסטיקה, כספים, תפעול) וחיבורם ב-API למערכות הליבה.',
              },
              {
                icon: '🚀',
                title: '3. תוצאה (Results)',
                text: 'הלקוח מקבל פתרון הוליסטי (Enterprise). שביעות הרצון עולה, והפתרון שלכם הופך לבלתי ניתן להחלפה.',
              },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flex: { xs: '1 1 auto', sm: '1 1 0' },
                  minWidth: 0,
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 'none' },
                    height: '100%',
                    p: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {idx < 2 && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: '50%',
                        left: -32,
                        transform: 'translateY(-50%)',
                        fontSize: '2rem',
                        color: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      ➔
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      mb: 3,
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    {item.icon}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.8,
                      textAlign: 'center',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              mt: 8,
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
              p: 5,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'white',
              }}
            >
              השורה התחתונה
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.8,
              }}
            >
              "אנחנו לא מחליפים את הקיים. אנחנו מחברים את הנקודות והופכים את הפתרון שלכם לחלק בלתי נפרד מהצלחת העסק."
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PartnershipPitch;
