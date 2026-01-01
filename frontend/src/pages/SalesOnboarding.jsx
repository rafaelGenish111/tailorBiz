import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Import logo to ensure it's included in build
import logoImage from '../assets/images/image-removebg-preview.png';

const drawerWidth = 300;
const LOGO_SRC = logoImage;

const NAV = [
  { id: 'home', label: 'ברוכים הבאים', icon: <MenuBookOutlinedIcon /> },
  { id: 'philosophy', label: 'הפילוסופיה שלנו', icon: <PsychologyOutlinedIcon /> },
  { id: 'product', label: 'מה אנחנו מוכרים?', icon: <BoltOutlinedIcon /> },
  { id: 'roadmap', label: 'מוצר החדירה', icon: <MapOutlinedIcon /> },
  { id: 'icp', label: 'הלקוח האידאלי', icon: <TrackChangesOutlinedIcon /> },
  { id: 'playbook', label: 'תסריטי שיחה', icon: <GroupsOutlinedIcon /> },
  { id: 'simulation', label: 'סימולטור מכירה', icon: <EmojiEventsOutlinedIcon /> }
];

const SectionHeader = ({ icon, title, subtitle }) => (
  <Stack spacing={0.75} sx={{ mb: 2 }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color: 'secondary.main' }}>{icon}</Box>
      <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
    </Stack>
    {subtitle ? (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    ) : null}
  </Stack>
);

const EqualGrid = ({ columns, children }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      alignItems: 'stretch',
      gridTemplateColumns: columns
    }}
  >
    {children}
  </Box>
);

const CardSurface = ({ children, sx }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      borderRadius: 3,
      borderColor: 'grey.200',
      bgcolor: 'background.paper',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...sx
    }}
  >
    {children}
  </Paper>
);

const InfoCard = ({ title, children, accent = 'grey' }) => (
  <CardSurface sx={{ position: 'relative', overflow: 'hidden' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 6,
        height: '100%',
        bgcolor:
          accent === 'primary'
            ? 'primary.main'
            : accent === 'secondary'
              ? 'secondary.main'
              : accent === 'success'
                ? 'success.main'
                : 'grey.200'
      }}
    />
    <Typography fontWeight={800} sx={{ mb: 1 }}>
      {title}
    </Typography>
    {children}
  </CardSurface>
);

const HomeSection = ({ onGo }) => {
  const theme = useTheme();
  return (
    <Stack spacing={3}>
      <Box
        component="img"
        src={LOGO_SRC}
        alt="לוגו"
        loading="eager"
        sx={{
          height: { xs: 160, sm: 210, md: 280 },
          width: 'auto',
          mx: 'auto',
          display: 'block',
          mt: { xs: 0.5, md: 1 },
          mb: { xs: 0.5, md: 1 },
          objectFit: 'contain',
          filter: 'drop-shadow(0px 10px 30px rgba(11,31,51,0.10))',
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <CardSurface
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          bgcolor: 'grey.50',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.secondary.main, 0.08)})`
        }}
      >
        <Typography variant="h2" fontWeight={800} sx={{ color: 'text.primary', mb: 1 }}>
          הדרכת מכירות
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          פורטל פנימי לצוות המכירות – מסודר, קצר, ומכוון לתוצאה.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" color="secondary" onClick={() => onGo('philosophy')}>
            התחל
          </Button>
          <Button variant="outlined" color="primary" onClick={() => onGo('playbook')}>
            קפוץ לתסריטים
          </Button>
        </Stack>
      </CardSurface>

      <EqualGrid columns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}>
        <InfoCard title="המשימה שלך" accent="secondary">
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            לאתר עסקים שסובלים מניהול ידני ולהציע להם פתרון טכנולוגי שחוסך זמן וכסף.
          </Typography>
        </InfoCard>
        <InfoCard title="הכלי המרכזי" accent="primary">
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            “מוצר החדירה” (מפת הדרכים) – הדרך הקלה להפוך מתעניין ללקוח משלם.
          </Typography>
        </InfoCard>
        <InfoCard title="סגנון המכירה" accent="success">
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            מכירה מייעצת (Consultative). לא דוחפים מוצר – מאבחנים בעיה ומובילים לפתרון.
          </Typography>
        </InfoCard>
      </EqualGrid>
    </Stack>
  );
};

const PhilosophySection = () => (
  <Stack spacing={2.5}>
    <SectionHeader
      icon={<PsychologyOutlinedIcon />}
      title="הפילוסופיה: חליפה בתפירה אישית"
      subtitle="תוכנות מדף לא נבנות סביב העסק. אנחנו כן."
    />

    <CardSurface sx={{ p: { xs: 2, md: 3 } }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>
        המסר שלך ללקוח
      </Typography>
      <Typography variant="body2" color="text.secondary">
        כשאתה מדבר עם לקוח, הוא רגיל לשמוע על “תוכנות מדף”. התפקיד שלך הוא להסביר לו למה זה לא עובד לו.
        <br />
        <b>הגישה שלנו:</b> המערכת צריכה לשרת את העסק, לא להפך.
      </Typography>
    </CardSurface>

    <EqualGrid columns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}>
      <CardSurface sx={{ borderColor: alpha('#b91c1c', 0.25), bgcolor: alpha('#b91c1c', 0.04) }}>
        <Typography fontWeight={800} sx={{ mb: 1, color: '#991b1b' }}>
          מה הלקוח מכיר (הבעיה)
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pr: 2, color: 'text.secondary' }}>
          <li>המון פיצ׳רים שאף אחד לא צריך</li>
          <li>ממשק מסורבל ולא נוח</li>
          <li>תהליכים ידניים כדי “לעקוף” את המערכת</li>
          <li>תסכול מצד העובדים</li>
        </Stack>
      </CardSurface>

      <CardSurface sx={{ borderColor: alpha('#15803d', 0.25), bgcolor: alpha('#15803d', 0.04) }}>
        <Typography fontWeight={800} sx={{ mb: 1, color: '#166534' }}>
          מה אנחנו מציעים (הפתרון)
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pr: 2, color: 'text.secondary' }}>
          <li>דיוק: רק מה שהעסק צריך</li>
          <li>אוטומציה שחוסכת שעות עבודה</li>
          <li>התאמה לתהליך הקיים</li>
          <li>אינטגרציות לכל כלי אחר</li>
        </Stack>
      </CardSurface>
    </EqualGrid>
  </Stack>
);

const ProductSection = () => (
  <Stack spacing={2.5}>
    <SectionHeader
      icon={<BoltOutlinedIcon />}
      title="סל המוצרים שלנו"
      subtitle="הכר את 4 הרכיבים כדי להתאים את הפתרון לשיחה."
    />

    <EqualGrid columns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}>
      {[
        {
          title: '1. אבחון ומיפוי תהליכים',
          desc: 'מיפוי זרימת העבודה (Workflow). זה הערך הראשון שהלקוח רואה – עושים לו סדר בראש.',
          icon: <TrackChangesOutlinedIcon />
        },
        {
          title: '2. אוטומציות חכמות',
          desc: 'חיבור בין מערכות: ליד נכנס → CRM → SMS → התראה למנהל. הכל אוטומטי.',
          icon: <BoltOutlinedIcon />
        },
        {
          title: '3. מערכות ניהול (Custom CRM/ERP)',
          desc: 'מערכות ליבה בהתאמה אישית עם דשבורדים בזמן אמת – בדיוק לפי צרכי הנהלה.',
          icon: <ViewQuiltOutlinedIcon />
        },
        {
          title: '4. ליווי והטמעה (Retainer)',
          desc: 'לא רק מפתחים – מטמיעים ומלווים עד שהצוות שולט במערכת.',
          icon: <GroupsOutlinedIcon />
        }
      ].map((x) => (
        <CardSurface key={x.title} sx={{ minHeight: { xs: 'auto', md: 170 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ color: 'secondary.main' }}>{x.icon}</Box>
            <Typography fontWeight={800}>{x.title}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            {x.desc}
          </Typography>
        </CardSurface>
      ))}
    </EqualGrid>
  </Stack>
);

const RoadmapSection = () => {
  const theme = useTheme();
  return (
    <Stack spacing={2.5}>
      <SectionHeader
        icon={<MapOutlinedIcon />}
        title="הכלי שלך לסגירה: מוצר החדירה"
        subtitle="מוכרים ערך קטן שמוביל לפרויקט גדול."
      />

      <CardSurface sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <Chip label="אל תמכור סתם" sx={{ bgcolor: alpha('#b91c1c', 0.08), color: '#991b1b', fontWeight: 800 }} />
            <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 800 }}>
              פגישת איפיון
            </Typography>
            <Chip label="תמכור ערך" sx={{ bgcolor: alpha(theme.palette.success.main, 0.10), color: theme.palette.success.main, fontWeight: 800 }} />
          </Stack>
          <Typography fontWeight={900} sx={{ color: 'primary.main' }}>
            סשן ארכיטקטורה עסקית ואוטומציה
          </Typography>
          <Divider />
          <Typography variant="body2" color="text.secondary">
            <b>טיפ לסוכן:</b> קשה למכור פרויקט ב־50K בשיחה ראשונה. קל יותר למכור “מפה” ב־2K–3.5K.
            ברגע שהלקוח קנה את זה – הוא כבר שלנו.
          </Typography>
        </Stack>
      </CardSurface>

      <EqualGrid columns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}>
        <CardSurface sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', minHeight: { xs: 'auto', md: 150 } }}>
          <Typography fontWeight={800} sx={{ mb: 1, color: 'secondary.light' }}>
            זיהוי הכאב בשיחה
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.85), mt: 'auto' }}>
            חפש משפטים כמו: “העסק עובד בשביל הטכנולוגיה”, “אנחנו מבזבזים זמן על העתק-הדבק”, “המידע מפוזר באקסלים”.
          </Typography>
        </CardSurface>
        <CardSurface
          sx={{
            borderColor: alpha(theme.palette.secondary.main, 0.25),
            bgcolor: alpha(theme.palette.secondary.main, 0.06),
            minHeight: { xs: 'auto', md: 150 }
          }}
        >
          <Typography fontWeight={800} sx={{ mb: 1, color: 'primary.main' }}>
            ההבטחה שאתה נותן
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            “אנחנו לא נבנה לך כלום לפני שנמפה את העסק. בסוף הפגישה תהיה לך מפת דרכים ברורה וצפי לחיסכון של 20% בזמן העבודה.”
          </Typography>
        </CardSurface>
      </EqualGrid>

      <CardSurface>
        <Typography fontWeight={800} sx={{ mb: 1 }}>
          מה הלקוח מקבל?
        </Typography>
        <EqualGrid columns={{ xs: '1fr', md: 'repeat(4, 1fr)' }}>
          {[
            { step: '1', title: 'Deep Dive', desc: 'תחקיר עומק ושיקוף המצב הקיים.' },
            { step: '2', title: 'Optimization', desc: 'זיהוי כפילויות וצווארי בקבוק.' },
            { step: '3', title: 'Tech-Stack', desc: 'המלצה על טכנולוגיות וארכיטקטורה.' },
            { step: '4', title: 'Action Plan', desc: 'תוכנית עבודה פרקטית (מסמך PDF).' }
          ].map((it) => (
            <CardSurface key={it.step} sx={{ bgcolor: 'grey.50', minHeight: { xs: 'auto', md: 150 } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip size="small" label={it.step} sx={{ fontWeight: 900 }} />
                <Typography fontWeight={800} sx={{ color: 'primary.main' }}>
                  {it.title}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                {it.desc}
              </Typography>
            </CardSurface>
          ))}
        </EqualGrid>
      </CardSurface>

      <EqualGrid columns={{ xs: '1fr', md: '7fr 5fr' }}>
        <CardSurface sx={{ minHeight: { xs: 'auto', md: 150 } }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            עלות ללקוח
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            המחיר נקבע לפי גודל העסק: <b>1,500 ₪ – 3,500 ₪</b>.
          </Typography>
        </CardSurface>
        <CardSurface
          sx={{
            borderColor: alpha('#a16207', 0.25),
            bgcolor: alpha('#f59e0b', 0.08),
            minHeight: { xs: 'auto', md: 150 }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbOutlinedIcon sx={{ color: '#a16207' }} />
            <Typography fontWeight={900} sx={{ color: '#7c2d12' }}>
              קלף הסגירה שלך
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#7c2d12', mt: 'auto' }}>
            “אם נחליט להתקדם לפרויקט, עלות האפיון <b>תקוזז במלואה</b> מהמחיר הסופי.”
          </Typography>
        </CardSurface>
      </EqualGrid>

      <CardSurface>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <LightbulbOutlinedIcon sx={{ color: 'secondary.main' }} />
          <Typography fontWeight={900}>טיפים לשיחת המכירה</Typography>
        </Stack>
        <EqualGrid columns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}>
          {[
            {
              title: 'מכור שקט, לא שעות',
              desc: 'הלקוח לא רוצה לקנות שעות תכנות. הוא רוצה לדעת שהוא יכול לצאת לחופשה והעסק יעבוד לבד. דבר על התוצאה.'
            },
            {
              title: 'מיצוב מול הלקוח',
              desc: 'כשאתה מציג את עצמך כ״אדריכל מערכות״ ולא כאיש טכני פשוט, קל להסביר למה אנחנו לא פתרון מדף.'
            },
            {
              title: 'התיעוד ככלי מכירה',
              desc: 'הבטח ללקוח שבסוף התהליך הוא מקבל מסמך אסטרטגי ממותג. זה נותן לו ביטחון בתמורה.'
            }
          ].map((t) => (
            <CardSurface key={t.title} sx={{ bgcolor: 'grey.50', minHeight: { xs: 'auto', md: 150 } }}>
              <Typography fontWeight={800} sx={{ mb: 0.75 }}>
                {t.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                {t.desc}
              </Typography>
            </CardSurface>
          ))}
        </EqualGrid>
      </CardSurface>
    </Stack>
  );
};

const ICPSection = () => (
  <Stack spacing={2.5}>
    <SectionHeader
      icon={<TrackChangesOutlinedIcon />}
      title="הלקוח האידאלי (ICP)"
      subtitle="כדי לא לבזבז זמן על לידים לא רלוונטיים – זה הפרופיל שאנחנו מחפשים."
    />

    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, borderColor: 'grey.200', bgcolor: 'primary.main' }}>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" fontWeight={900} sx={{ color: 'secondary.light', mb: 1 }}>
            הפרופיל המנצח
          </Typography>
          <Stack spacing={1}>
            {[
              { k: 'מחזור שנתי', v: '2–10 מיליון ₪' },
              { k: 'גודל', v: 'עסק בצמיחה שמתחיל לטבוע בנהלים' },
              { k: 'מנטליות', v: 'מבינים טכנולוגיה (Monday/Priority) אבל לא מרוצים' },
              { k: 'הכאב', v: '“אני לא בשליטה”, “דברים נופלים”' }
            ].map((row) => (
              <Paper key={row.k} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, borderColor: alpha('#ffffff', 0.15), bgcolor: alpha('#ffffff', 0.06) }}>
                <Typography sx={{ color: alpha('#ffffff', 0.9) }}>
                  <b>{row.k}:</b> {row.v}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography fontWeight={900} sx={{ color: alpha('#ffffff', 0.9), mb: 1 }}>
            תחומים מועדפים
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {[
              'חברות לוגיסטיקה',
              'משרדי עו"ד/רו"ח גדולים',
              'חברות ייצור קל',
              'סוכנויות דיגיטל',
              'שירות ואחזקה',
              'יזמי נדל"ן'
            ].map((x) => (
              <Chip
                key={x}
                label={x}
                sx={{
                  bgcolor: alpha('#ffffff', 0.10),
                  color: alpha('#ffffff', 0.95),
                  borderColor: alpha('#ffffff', 0.2)
                }}
                variant="outlined"
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  </Stack>
);

const PlaybookSection = () => {
  const scripts = [
    {
      id: 1,
      title: 'שיחת היכרות ראשונית (Discovery)',
      goal: 'המטרה שלך: להבין האם יש התאמה – ולא למכור עדיין.',
      content: [
        { speaker: 'אתה', text: 'היי [שם הלקוח], אני מדבר מ-[שם החברה]. ראיתי שאתם צומחים יפה בתחום ה-[תחום], ורציתי לשאול שאלה קצת לא שגרתית ברשותך.' },
        { speaker: 'לקוח', text: 'כן, דבר איתי.' },
        { speaker: 'אתה', text: 'רוב המנכ"לים בסדר גודל שלך שאני מדבר איתם, מספרים לי שהם עובדים עם 3–4 מערכות שונות שלא מדברות אחת עם השנייה, וסוף החודש זה סיוט של אקסלים. איך זה עובד אצלך היום?' },
        { speaker: 'עקרון מפתח', text: 'שתוק. תן לו לדבר. אנחנו מחפשים את הכאב.' }
      ]
    },
    {
      id: 2,
      title: 'שאלות העמקה (Deep Dive)',
      goal: 'המטרה שלך: לגרום ללקוח להבין שהמצב הנוכחי עולה לו כסף.',
      content: [
        { speaker: 'אתה', text: 'אמרת שאתה משתמש בפריוריטי לניהול מלאי ובמאנדיי למשימות. כשלקוח מבצע הזמנה, איך המידע עובר ביניהן?' },
        { speaker: 'לקוח', text: 'המזכירה מעתיקה ידנית...' },
        { speaker: 'אתה', text: 'וכמה זמן זה לוקח לה ביום? קרה פעם שהייתה טעות בהעתקה?' },
        { speaker: 'אתה', text: 'אם היית יכול ללחוץ על כפתור וזה היה קורה לבד — מה היית עושה עם הזמן שהתפנה?' }
      ]
    },
    {
      id: 3,
      title: 'טיפול בהתנגדות: “זה יקר לי”',
      goal: 'הסטת הדיון מעלות להשקעה (ROI).',
      content: [
        { speaker: 'לקוח', text: 'שמע, פיתוח מאפס זה יקר. מערכת מדף עולה לי 50$ בחודש.' },
        { speaker: 'אתה', text: 'אני מסכים איתך, מערכת מדף זולה יותר בחשבונית. אבל בוא נחשוב רגע — כמה עולה לך שעת עובד שמבזבז זמן על עבודה ידנית? כמה עולה ליד שהולך לאיבוד?' },
        { speaker: 'אתה', text: 'אנחנו לא בונים לך “הוצאה”, אנחנו בונים לך מכונה שחוסכת כסף. הלקוחות שלנו מחזירים את ההשקעה תוך 3–6 חודשים. רוצה שנבדוק אם זה אפשרי גם אצלך?' }
      ]
    }
  ];

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        icon={<GroupsOutlinedIcon />}
        title="תסריטי שיחה ופלייבוק"
        subtitle="אל תקריא כמו רובוט – תבין את העקרון ותדבר בשפה שלך."
      />

      <Stack spacing={1.5}>
        {scripts.map((s) => (
          <Accordion key={s.id} disableGutters sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={900}>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.goal}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5, bgcolor: 'grey.50' }}>
              <Stack spacing={1.25}>
                {s.content.map((line, idx) =>
                  line.speaker === 'עקרון מפתח' ? (
                    <Alert key={idx} severity="warning" variant="outlined" sx={{ borderRadius: 3 }}>
                      <b>{line.speaker}:</b> {line.text}
                    </Alert>
                  ) : (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 3, borderColor: 'grey.200', bgcolor: 'background.paper' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Typography fontWeight={900} sx={{ minWidth: 84, color: 'primary.main' }}>
                          {line.speaker}:
                        </Typography>
                        <Typography color="text.secondary">{line.text}</Typography>
                      </Stack>
                    </Paper>
                  )
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
};

const SimulationSection = () => {
  const [score, setScore] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);

  const steps = [
    {
      question: "לקוח אומר לך: 'יש לנו כבר CRM של Salesforce, למה שנעבור למשהו אחר?'",
      options: [
        {
          text: 'Salesforce יקרה ומסובכת, המערכת שלנו יותר טובה וזולה.',
          isCorrect: false,
          feedback: 'לא טוב. אל תלכלך על מתחרים ואל תניח שהמחיר הוא הבעיה.'
        },
        {
          text: 'מעולה. Salesforce מערכת חזקה. אתם מרגישים שהיא מותאמת ב-100% לתהליך שלכם, או שאתם עובדים “מסביב” למערכת?',
          isCorrect: true,
          feedback: 'מצוין! גישה מכילה ומבררת. במקום למכור, אתה בודק אם יש כאב.'
        },
        {
          text: 'אני יכול להציע תקופת ניסיון בחינם.',
          isCorrect: false,
          feedback: 'מוקדם מדי. עוד לא הבנת אם יש לו בכלל צורך או כאב.'
        }
      ]
    },
    {
      question: 'בשיחת אפיון הלקוח מתלונן שהעובדים לא ממלאים דוחות בזמן. מה תעשה?',
      options: [
        {
          text: "אספר לו שיש לנו פיצ'ר של התראות אוטומטיות.",
          isCorrect: false,
          feedback: 'קפצת לפתרון מהר מדי. תחקור עוד את הכאב.'
        },
        {
          text: "אשאל: 'למה לדעתך זה קורה? זה משמעת או תהליך מסורבל?'",
          isCorrect: true,
          feedback: 'בול. רוצים להבין את שורש הבעיה לפני שמציעים פתרון.'
        }
      ]
    }
  ];

  const total = steps.length;
  const done = Math.min(currentStep, total);

  const restart = () => {
    setScore(0);
    setCurrentStep(0);
    setFeedback(null);
  };

  const handleAnswer = (opt) => {
    setFeedback({ isCorrect: opt.isCorrect, text: opt.feedback });
    if (opt.isCorrect) setScore((s) => s + 1);
  };

  const next = () => {
    setFeedback(null);
    setCurrentStep((s) => s + 1);
  };

  if (currentStep >= total) {
    return (
      <Stack spacing={2.5}>
        <SectionHeader icon={<EmojiEventsOutlinedIcon />} title="סימולטור" subtitle="בדיקה קצרה: האם אתה מוכן לשטח?" />
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, borderColor: 'grey.200' }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Typography variant="h4" fontWeight={900}>
              כל הכבוד!
            </Typography>
            <Typography color="text.secondary">
              סיימת את הסימולציה הבסיסית. ציון: <b>{score}</b> / {total}
            </Typography>
            <Button variant="contained" color="secondary" onClick={restart}>
              התחל מחדש
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  const step = steps[currentStep];

  return (
    <Stack spacing={2.5}>
      <SectionHeader icon={<EmojiEventsOutlinedIcon />} title="סימולטור: האם אתה מוכן?" subtitle="בחר תשובה, קבל פידבק, והמשך." />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, borderColor: 'grey.200' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              שאלה {currentStep + 1} מתוך {total}
            </Typography>
            <LinearProgress variant="determinate" value={((done + 0.15) / total) * 100} sx={{ height: 8, borderRadius: 99, bgcolor: 'grey.100' }} />
          </Box>

          <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 22 } }}>
            {step.question}
          </Typography>

          {!feedback ? (
            <Stack spacing={1.25}>
              {step.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() => handleAnswer(opt)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'right',
                    whiteSpace: 'normal',
                    alignItems: 'flex-start',
                    lineHeight: 1.35,
                    py: 1.1,
                  }}
                >
                  {opt.text}
                </Button>
              ))}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity={feedback.isCorrect ? 'success' : 'error'} variant="outlined" sx={{ borderRadius: 3 }}>
                <Typography fontWeight={900}>
                  {feedback.isCorrect ? 'נכון מאוד' : 'פחות מדויק'}
                </Typography>
                <Typography>{feedback.text}</Typography>
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={restart}>
                  אפס
                </Button>
                <Button variant="contained" color="secondary" onClick={next}>
                  המשך
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

const Content = ({ tab, onGo }) => {
  switch (tab) {
    case 'home':
      return <HomeSection onGo={onGo} />;
    case 'philosophy':
      return <PhilosophySection />;
    case 'product':
      return <ProductSection />;
    case 'roadmap':
      return <RoadmapSection />;
    case 'icp':
      return <ICPSection />;
    case 'playbook':
      return <PlaybookSection />;
    case 'simulation':
      return <SimulationSection />;
    default:
      return <HomeSection onGo={onGo} />;
  }
};

export default function SalesOnboarding({ variant = 'standalone' }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isEmbedded = variant === 'embedded';

  const [tab, setTab] = React.useState('home');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const onGo = (next) => {
    setTab(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Box
            component="img"
            src={LOGO_SRC}
            alt="לוגו"
            loading="eager"
            sx={{ height: 48, width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Sales Academy
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {NAV.map((it) => (
          <ListItemButton
            key={it.id}
            selected={tab === it.id}
            onClick={() => onGo(it.id)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: tab === it.id ? 'secondary.main' : 'text.secondary' }}>
              {it.icon}
            </ListItemIcon>
            <ListItemText
              primary={<Typography fontWeight={tab === it.id ? 900 : 700}>{it.label}</Typography>}
            />
          </ListItemButton>
        ))}
      </List>

      {!isEmbedded ? (
      <Box sx={{ mt: 'auto', p: 2.5, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Stack spacing={1}>
          <Button variant="outlined" color="primary" onClick={() => navigate('/')}>חזרה לאתר</Button>
          <Typography variant="caption" color="text.secondary">
            עמוד פנימי (ללא Header/Footer)
          </Typography>
        </Stack>
      </Box>
      ) : null}
    </Box>
  );

  if (isEmbedded) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Mobile: compact navigation (wrap, no page overflow) */}
        {!isMdUp ? (
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 3, mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {NAV.map((it) => (
                <Chip
                  key={it.id}
                  clickable
                  icon={it.icon}
                  label={it.label}
                  onClick={() => onGo(it.id)}
                  color={tab === it.id ? 'secondary' : 'default'}
                  variant={tab === it.id ? 'filled' : 'outlined'}
                  sx={{ fontWeight: tab === it.id ? 900 : 700 }}
                />
              ))}
            </Stack>
          </Paper>
        ) : null}

        <Box
          sx={{
            display: { xs: 'block', md: 'grid' },
            // Prevent horizontal overflow on mid-width screens
            gridTemplateColumns: { md: `minmax(240px, ${drawerWidth}px) minmax(0, 1fr)` },
            gap: 2,
            alignItems: 'start',
            minWidth: 0,
          }}
        >
          {/* Desktop: side navigation (not a Drawer) */}
          {isMdUp ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', minWidth: 0 }}>
              <Box sx={{ p: 2 }}>
                <Typography fontWeight={900}>Sales Academy</Typography>
                <Typography variant="body2" color="text.secondary">
                  בחר נושא
                </Typography>
              </Box>
              <Divider />
              <List sx={{ px: 1, py: 1 }}>
                {NAV.map((it) => (
                  <ListItemButton
                    key={it.id}
                    selected={tab === it.id}
                    onClick={() => onGo(it.id)}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: tab === it.id ? 'secondary.main' : 'text.secondary' }}>
                      {it.icon}
                    </ListItemIcon>
                    <ListItemText primary={<Typography fontWeight={tab === it.id ? 900 : 700}>{it.label}</Typography>} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          ) : null}

          <Box sx={{ minWidth: 0 }}>
            <Content tab={tab} onGo={onGo} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: alpha(theme.palette.background.default, 0.9), backdropFilter: 'blur(10px)' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isMdUp ? (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="menu">
              <MenuIcon />
            </IconButton>
          ) : null}

          <Box
            component="img"
            src={LOGO_SRC}
            alt="לוגו"
            loading="eager"
            sx={{
              height: 44,
              width: 'auto',
              display: { xs: 'none', sm: 'block' },
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <Typography fontWeight={900} sx={{ flexGrow: 1, color: 'primary.main' }}>
            הדרכת מכירות
          </Typography>

          <Button variant="text" color="primary" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            חזרה לאתר
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
        {/* Drawer */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: drawerWidth }
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderLeft: '1px solid',
                borderLeftColor: 'grey.200'
              }
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Content */}
        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
          <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
            <Content tab={tab} onGo={onGo} />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
