import { useState } from 'react';
import { Box, Container, Typography, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  BrainCircuit,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Check,
  Zap,
  CreditCard,
  BookOpen,
  BotMessageSquare,
  UserCheck,
  Target,
  Video,
  Building2,
  Briefcase,
  Sprout,
  TrendingUp,
  Rocket,
  Landmark,
  UserMinus,
  FileSpreadsheet,
  Banknote,
  Moon,
  Sheet,
  MessageCircle,
  Database,
  HelpCircle,
  LayoutDashboard,
  Bot,
  Flame,
  Calendar,
  Search,
  Package,
  Crown,
} from 'lucide-react';
import Button from '../ui/Button';

const MotionBox = motion.create(Box);

/* ================================================================
   QUESTIONS DATA
   ================================================================ */
const questions = [
  {
    id: 'businessType',
    question: 'מה הכי מתאר את העסק שלך?',
    subtitle: 'נתחיל מההתחלה — סוג העסק קובע את סוג הפתרון',
    options: [
      {
        value: 'coach',
        label: 'מאמן/ת, יועץ/ת או מטפל/ת',
        description: 'ליווי 1:1 או 1:Many, קורסים, סדנאות',
        icon: Target,
      },
      {
        value: 'creator',
        label: 'יוצר/ת תוכן דיגיטלי',
        description: 'קורסים אונליין, קהילות, מנויים',
        icon: Video,
      },
      {
        value: 'institution',
        label: 'מכללה, מרכז הכשרה או בית ספר',
        description: 'מגוון קורסים, תלמידים רבים, צוות יועצים',
        icon: Building2,
      },
      {
        value: 'other',
        label: 'עסק אחר עם לקוחות קבועים',
        description: 'שירותים, תחזוקה, מנויים',
        icon: Briefcase,
      },
    ],
  },
  {
    id: 'scale',
    question: 'כמה לקוחות או תלמידים פעילים יש לך היום?',
    subtitle: 'כדי שנבין את הסקייל ואיזה מערכת צריכה להחזיק',
    options: [
      { value: 'starter', label: 'עד 30', description: 'בתחילת הדרך או ליווי בוטיק', icon: Sprout },
      { value: 'growing', label: '30-100', description: 'צומח ומתחיל לחנוק', icon: TrendingUp },
      { value: 'scaling', label: '100-500', description: 'זקוק לסדר ואוטומציה ברצינות', icon: Rocket },
      { value: 'enterprise', label: '500+', description: 'מוסד/ארגון עם מחלקות', icon: Landmark },
    ],
  },
  {
    id: 'mainPain',
    question: 'מה הכאב הכי גדול שלך היום?',
    subtitle: 'בחר/י את מה ששורף הכי הרבה — מכאן נתחיל',
    options: [
      {
        value: 'lead_loss',
        label: 'מפספס/ת לידים ופניות',
        description: 'אנשים פונים ולא חוזרים אליהם בזמן',
        icon: UserMinus,
      },
      {
        value: 'excel_chaos',
        label: 'כאוס באקסלים וקבוצות וואטסאפ',
        description: 'הכל מפוזר, אין תמונה אחת ברורה',
        icon: FileSpreadsheet,
      },
      {
        value: 'payment_chase',
        label: 'רודף/ת אחרי תשלומים',
        description: 'גבייה ידנית, חוסר מעקב, העברות בביט',
        icon: Banknote,
      },
      {
        value: 'night_leads',
        label: 'מאבד/ת לידים בלילה ובסופ"ש',
        description: 'אין מענה מחוץ לשעות העבודה',
        icon: Moon,
      },
    ],
  },
  {
    id: 'currentTools',
    question: 'איך את/ה מנהל/ת את הלקוחות והלידים היום?',
    subtitle: 'אין תשובה נכונה או לא — רק רוצים לדעת מאיפה מתחילים',
    options: [
      {
        value: 'manual',
        label: 'אקסל / Google Sheets',
        description: 'טבלאות, פילטרים, והרבה Copy-Paste',
        icon: Sheet,
      },
      {
        value: 'whatsapp',
        label: 'וואטסאפ + ראש',
        description: 'קבוצות, שמות בטלפון, זיכרון',
        icon: MessageCircle,
      },
      {
        value: 'basic_crm',
        label: 'מערכת CRM בסיסית',
        description: 'Monday, HubSpot, או משהו דומה',
        icon: Database,
      },
      {
        value: 'nothing',
        label: 'אין שום מערכת',
        description: 'הכל בראש ובנייר',
        icon: HelpCircle,
      },
    ],
  },
  {
    id: 'priority',
    question: 'מה הדבר הכי חשוב לך במערכת חדשה?',
    subtitle: 'אם היית יכול/ה לפתור דבר אחד מחר — מה זה היה?',
    options: [
      {
        value: 'automation',
        label: 'אוטומציה — שהמערכת תעבוד בשבילי',
        description: 'תזכורות, פולו-אפ, עדכונים — הכל אוטומטי',
        icon: Zap,
      },
      {
        value: 'crm_order',
        label: 'סדר — לראות הכל במקום אחד',
        description: 'CRM נקי עם תמונת מצב ברורה',
        icon: LayoutDashboard,
      },
      {
        value: 'billing',
        label: 'גבייה — חיוב אוטומטי בלי לרדוף',
        description: 'סליקה, הוראות קבע, חשבוניות',
        icon: CreditCard,
      },
      {
        value: 'ai_response',
        label: 'מענה מיידי — בוט שעונה במקומי',
        description: 'סוכן AI שמטפל בפניות 24/7',
        icon: Bot,
      },
    ],
  },
  {
    id: 'urgency',
    question: 'מתי את/ה רוצה להתחיל?',
    subtitle: 'עוזר לנו להבין את רמת הדחיפות',
    options: [
      { value: 'asap', label: 'בהקדם — שורף!', description: 'אני מוכן/ה מחר בבוקר', icon: Flame },
      { value: 'month', label: 'תוך חודש-חודשיים', description: 'יש זמן לתכנן נכון', icon: Calendar },
      { value: 'exploring', label: 'רק בודק/ת אפשרויות', description: 'משווה ולומד/ת', icon: Search },
      { value: 'next_launch', label: 'לקראת השקה הבאה', description: 'מתכנן/ת השקה ורוצה להיות מוכן/ה', icon: Target },
    ],
  },
  {
    id: 'budget',
    question: 'מה טווח ההשקעה שנוח לך?',
    subtitle: 'אין לחץ — זה עוזר לנו להתאים את החבילה הנכונה',
    options: [
      {
        value: 'starter',
        label: 'עד 15,000 הקמה',
        description: 'חבילת בסיס חכמה',
        icon: Sprout,
      },
      {
        value: 'mid',
        label: '15,000-25,000 הקמה',
        description: 'מערכת מורחבת עם מודולים',
        icon: Package,
      },
      {
        value: 'premium',
        label: 'מעל 25,000 הקמה',
        description: 'פתרון מלא מקצה לקצה',
        icon: Crown,
      },
      {
        value: 'unsure',
        label: 'עדיין לא בטוח/ה',
        description: 'רוצה לשמוע הצעה מותאמת',
        icon: HelpCircle,
      },
    ],
  },
];

/* ================================================================
   RECOMMENDATION ENGINE
   ================================================================ */
const recommendations = {
  saas_basic: {
    id: 'saas_basic',
    track: 'saas',
    title: 'חבילת "השקה חכמה"',
    subtitle: 'SaaS למאמנים ויוצרי תוכן',
    description:
      'דשבורד CRM, קליטת לידים, אינטגרציית סליקה ו-2 תרחישי אוטומציה — הבסיס לעסק מסודר.',
    features: [
      'דשבורד CRM מלא',
      'קליטת לידים מדף נחיתה',
      'סליקה ואינטגרציית תשלומים',
      '2 תרחישי אוטומציה (תזכורת + תודה)',
    ],
    icon: Sparkles,
    accentColor: '#6fef93',
    path: '/services/saas-creators',
  },
  saas_expanded: {
    id: 'saas_expanded',
    track: 'saas',
    title: 'חבילת "השקה חכמה" + הרחבות',
    subtitle: 'SaaS למאמנים ויוצרי תוכן',
    description:
      'כל מה שבבסיס + מודולי הרחבה מותאמים: אקדמיה, רימרקטינג, Affiliate או AI Sales Assistant.',
    features: [
      'הכל מחבילת הבסיס',
      'מודול אקדמיה (Mini-LMS)',
      'רימרקטינג פנימי מפולח',
      'AI Sales Assistant לניסוח פולו-אפ',
    ],
    icon: Zap,
    accentColor: '#6fef93',
    path: '/services/saas-creators',
  },
  ai_basic: {
    id: 'ai_basic',
    track: 'ai',
    title: 'סוכן קליטה וסינון',
    subtitle: 'AI למרכזי הכשרה ומוסדות',
    description: 'קליטת לידים 24/7 וסינון בסיסי עם דחיפה אוטומטית ל-CRM שלכם.',
    features: [
      'קליטת לידים 24/7',
      'סינון וקטלוג אוטומטי',
      'דחיפה ל-CRM',
      'התראות בזמן אמת',
    ],
    icon: BotMessageSquare,
    accentColor: '#8B5CF6',
    path: '/services/ai-institutions',
  },
  ai_pro: {
    id: 'ai_pro',
    track: 'ai',
    title: 'סוכן מומחה סילבוס (RAG)',
    subtitle: 'AI למרכזי הכשרה ומוסדות',
    description:
      'בוט שעבר אימון על מסמכי המוסד שלכם — עונה על סילבוסים, דרישות קדם ותנאי קבלה.',
    features: [
      'הכל מחבילת Basic',
      'אימון RAG על מסמכי המוסד',
      'מענה מומחה על סילבוסים',
      'שיחות מותאמות אישית',
    ],
    icon: BookOpen,
    accentColor: '#8B5CF6',
    path: '/services/ai-institutions',
  },
  ai_premium: {
    id: 'ai_premium',
    track: 'ai',
    title: 'סוכן פרימיום — סגירת מעגל',
    subtitle: 'AI למרכזי הכשרה ומוסדות',
    description:
      'סוכן מומחה + אינטגרציה ליומני יועצים, קביעת פגישות ושליחת לינק מקדמה אוטומטי.',
    features: [
      'הכל מחבילת Pro',
      'אינטגרציה ליומני יועצים (Booking)',
      'שליחת לינק מקדמה אוטומטי',
      'דוחות ביצוע חודשיים',
    ],
    icon: UserCheck,
    accentColor: '#8B5CF6',
    path: '/services/ai-institutions',
  },
};

function getRecommendation(answers) {
  const { businessType, scale, mainPain, priority, budget } = answers;

  // Institution track
  if (businessType === 'institution') {
    if (budget === 'premium' || scale === 'enterprise') return recommendations.ai_premium;
    if (budget === 'mid' || priority === 'ai_response' || mainPain === 'night_leads')
      return recommendations.ai_pro;
    return recommendations.ai_basic;
  }

  // SaaS track (coach, creator, other)
  if (mainPain === 'night_leads' && priority === 'ai_response') {
    // Even a coach might benefit from AI if that's their main pain
    if (scale === 'scaling' || scale === 'enterprise') return recommendations.ai_pro;
    return recommendations.ai_basic;
  }

  if (
    budget === 'mid' ||
    budget === 'premium' ||
    scale === 'scaling' ||
    scale === 'enterprise'
  ) {
    return recommendations.saas_expanded;
  }

  return recommendations.saas_basic;
}

/* ================================================================
   QUIZ COMPONENT
   ================================================================ */
function ServiceQuiz() {
  const [sectionRef, sectionInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);

  const totalSteps = questions.length;
  const progress = currentStep >= 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleStart = () => setCurrentStep(0);

  const handleSelect = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
    } else {
      // Last question — compute recommendation
      setTimeout(() => {
        setRecommendation(getRecommendation(newAnswers));
        setCurrentStep(totalSteps); // result screen
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (currentStep === 0) {
      setCurrentStep(-1);
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setAnswers({});
    setRecommendation(null);
  };

  const isResult = currentStep === totalSteps && recommendation;

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 12, md: 16 },
        bgcolor: '#2c2e30',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        {/* Section Header */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <BrainCircuit size={20} style={{ color: '#6fef93' }} />
            <Typography
              sx={{
                color: '#6fef93',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              שאלון התאמה חכם
            </Typography>
          </Box>
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
            לא בטוחים מה מתאים לכם?
          </Typography>
          <Typography
            sx={{
              color: '#B0B0B0',
              fontSize: { xs: '0.95rem', md: '1.125rem' },
              lineHeight: 1.7,
              maxWidth: 550,
              mx: 'auto',
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            }}
          >
            ענו על 7 שאלות קצרות — והבוט החכם שלנו ימליץ על הפתרון המושלם בשבילכם.
          </Typography>
        </MotionBox>

        {/* Quiz Card */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{
            borderRadius: '12px',
            border: '1px solid #383838',
            bgcolor: '#222325',
            overflow: 'hidden',
            minHeight: { xs: 400, md: 460 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Progress bar (hidden on intro) */}
          {currentStep >= 0 && !isResult && (
            <Box sx={{ px: 0 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 3,
                  bgcolor: '#323436',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#6fef93',
                    transition: 'transform 0.4s ease',
                  },
                }}
              />
            </Box>
          )}

          {/* Content area */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 5 },
            }}
          >
            <AnimatePresence mode="wait">
              {/* =========== INTRO SCREEN =========== */}
              {currentStep === -1 && (
                <MotionBox
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '10px',
                      background:
                        'linear-gradient(135deg, rgba(111, 239, 147, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <BrainCircuit size={36} style={{ color: '#6fef93' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: '1.375rem', md: '1.75rem' },
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    בואו נמצא את הפתרון המושלם בשבילכם
                  </Typography>
                  <Typography
                    sx={{
                      color: '#808080',
                      mb: 4,
                      fontSize: '0.9375rem',
                      maxWidth: 420,
                      mx: 'auto',
                      lineHeight: 1.7,
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    7 שאלות · פחות מדקה · המלצה מותאמת אישית
                  </Typography>
                  <Button variant="primary" size="large" onClick={handleStart}>
                    בואו נתחיל
                  </Button>
                </MotionBox>
              )}

              {/* =========== QUESTION SCREENS =========== */}
              {currentStep >= 0 && currentStep < totalSteps && (
                <MotionBox
                  key={`q-${currentStep}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step counter */}
                  <Typography
                    sx={{
                      color: '#808080',
                      fontSize: '0.8125rem',
                      mb: 1,
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    שאלה {currentStep + 1} מתוך {totalSteps}
                  </Typography>

                  {/* Question */}
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {questions[currentStep].question}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#808080',
                      fontSize: '0.875rem',
                      mb: 4,
                      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {questions[currentStep].subtitle}
                  </Typography>

                  {/* Options */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {questions[currentStep].options.map((option) => {
                      const isSelected = answers[questions[currentStep].id] === option.value;
                      const OptionIcon = option.icon;
                      return (
                        <Box
                          key={option.value}
                          onClick={() => handleSelect(questions[currentStep].id, option.value)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: { xs: 2, md: 2.5 },
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isSelected ? '#6fef93' : '#383838',
                            bgcolor: isSelected ? 'rgba(111, 239, 147, 0.06)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              borderColor: isSelected ? '#6fef93' : '#4d4f51',
                              bgcolor: isSelected
                                ? 'rgba(111, 239, 147, 0.06)'
                                : 'rgba(255, 255, 255, 0.02)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              flexShrink: 0,
                              width: 44,
                              height: 44,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '12px',
                              bgcolor: isSelected ? 'rgba(111, 239, 147, 0.10)' : '#2c2e30',
                              transition: 'all 0.25s ease',
                            }}
                          >
                            <OptionIcon
                              size={22}
                              style={{
                                color: isSelected ? '#6fef93' : '#808080',
                                transition: 'color 0.25s ease',
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: { xs: '0.9375rem', md: '1rem' },
                                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                              }}
                            >
                              {option.label}
                            </Typography>
                            <Typography
                              sx={{
                                color: '#808080',
                                fontSize: '0.8125rem',
                                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                              }}
                            >
                              {option.description}
                            </Typography>
                          </Box>
                          {isSelected && (
                            <Check size={20} style={{ color: '#6fef93', flexShrink: 0 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Back button */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      onClick={handleBack}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#808080',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                        transition: 'color 0.3s',
                        '&:hover': { color: '#FFFFFF' },
                      }}
                    >
                      <ArrowRight size={16} />
                      {currentStep === 0 ? 'חזרה' : 'שאלה קודמת'}
                    </Box>
                  </Box>
                </MotionBox>
              )}

              {/* =========== RESULT SCREEN =========== */}
              {isResult && (
                <MotionBox
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  sx={{ py: { xs: 2, md: 4 } }}
                >
                  {/* Recommendation header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      sx={{
                        color: '#6fef93',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        mb: 1,
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                      }}
                    >
                      ההמלצה שלנו
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: { xs: '1.375rem', md: '1.75rem' },
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                      }}
                    >
                      מצאנו את הפתרון המושלם בשבילכם
                    </Typography>
                  </Box>

                  {/* Recommendation card */}
                  <Box
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: recommendation.accentColor,
                      background: `linear-gradient(135deg, ${recommendation.accentColor}10 0%, transparent 100%)`,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '8px',
                          bgcolor: `${recommendation.accentColor}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <recommendation.icon
                          size={26}
                          style={{ color: recommendation.accentColor }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: recommendation.accentColor,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                          }}
                        >
                          {recommendation.subtitle}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: { xs: '1.125rem', md: '1.375rem' },
                            fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                          }}
                        >
                          {recommendation.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        color: '#B0B0B0',
                        fontSize: '0.9375rem',
                        lineHeight: 1.7,
                        mb: 3,
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {recommendation.description}
                    </Typography>

                    {/* Features list */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {recommendation.features.map((feature) => (
                        <Box
                          key={feature}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              bgcolor: `${recommendation.accentColor}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Check
                              size={14}
                              style={{
                                color: recommendation.accentColor,
                                strokeWidth: 3,
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              color: '#FFFFFF',
                              fontSize: '0.9375rem',
                              fontWeight: 500,
                              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Action buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Button variant="primary" size="medium" to={recommendation.path}>
                      למידע נוסף על הפתרון
                    </Button>
                    <Button variant="secondary" size="medium" to="/contact">
                      דברו איתנו ישירות
                    </Button>
                  </Box>

                  {/* Reset */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Box
                      onClick={handleReset}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: '#808080',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                        transition: 'color 0.3s',
                        '&:hover': { color: '#FFFFFF' },
                      }}
                    >
                      <RotateCcw size={14} />
                      התחלה מחדש
                    </Box>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ServiceQuiz;
