import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import StarIcon from '@mui/icons-material/Star';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const testimonials = [
  {
    id: 1,
    name: 'יוסי כהן',
    role: 'מנכ״ל, חברת טכנולוגיה',
    avatar: '👨‍💼',
    text: 'TailorBiz שינה לחלוטין את הדרך שבה אנחנו מנהלים את העסק. חסכנו 15 שעות שבועיות ושיפרנו את שביעות רצון הלקוחות ב-40%!',
    rating: 5,
    company: 'TechCorp',
  },
  {
    id: 2,
    name: 'שרה לוי',
    role: 'מנהלת שיווק, סטארטאפ',
    avatar: '👩‍💼',
    text: 'הפלטפורמה הכי פשוטה ונוחה שהשתמשתי בה. הממשק האינטואיטיבי והתמיכה המעולה עשו את כל ההבדל. ממליצה בחום!',
    rating: 5,
    company: 'GrowthHub',
  },
  {
    id: 3,
    name: 'דוד ישראלי',
    role: 'יזם ובעל עסק',
    avatar: '🧑‍💻',
    text: 'לקוחות שנעלמו לי חוזרים בזכות המערכת! התזכורות האוטומטיות והמעקב החכם הפכו את העסק שלי למכונה משומנת.',
    rating: 5,
    company: 'IsraelBiz',
  },
  {
    id: 4,
    name: 'מיכל אברהם',
    role: 'מנהלת מכירות',
    avatar: '👩‍💻',
    text: 'הצוות שלנו התאהב במערכת מהיום הראשון. הכל כל כך פשוט ואוטומטי, פשוט חיסכנו המון זמן ועצבים!',
    rating: 5,
    company: 'SalesForce IL',
  },
  {
    id: 5,
    name: 'רון ברקוביץ',
    role: 'מייסד, חברת ייעוץ',
    avatar: '👨‍🏫',
    text: 'ROI מדהים! המערכת החזירה את עצמה תוך 3 חודשים. הדיווחים והאנליטיקס עזרו לנו לקבל החלטות חכמות.',
    rating: 5,
    company: 'ConsultPro',
  },
];

function TestimonialCard({ testimonial, position, isCenter }) {
  const scale = isCenter ? 1 : 0.85;
  const opacity = isCenter ? 1 : 0.6;
  const zIndex = isCenter ? 10 : 1;

  return (
    <MotionPaper
      initial={{ scale: 0.85, opacity: 0.6 }}
      animate={{
        scale,
        opacity,
        y: isCenter ? -20 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      elevation={0}
      sx={{
        position: 'relative',
        p: 4,
        height: '100%',
        minHeight: 320,
        bgcolor: isCenter ? 'rgba(0, 188, 212, 0.05)' : 'white',
        border: '1px solid',
        borderColor: isCenter ? 'secondary.main' : 'grey.200',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex,
        boxShadow: isCenter
          ? '0 20px 60px rgba(0, 188, 212, 0.3)'
          : '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Badge */}
      {isCenter && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: 20,
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'secondary.main',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.4)',
          }}
        >
          המלצה מומלצת ⭐
        </Box>
      )}

      {/* אייקון ציטוט */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: 1,
          bgcolor: isCenter ? 'rgba(0, 188, 212, 0.15)' : 'rgba(0, 188, 212, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FormatQuoteIcon
          sx={{
            color: 'secondary.main',
            fontSize: 28,
            transform: 'rotate(180deg)',
          }}
          aria-hidden="true"
        />
      </Box>

      {/* דירוג כוכבים */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 2, mt: 2 }}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarIcon
            key={i}
            sx={{
              color: '#FFB800',
              fontSize: 18,
            }}
          />
        ))}
      </Box>

      {/* טקסט */}
      <Typography
        variant="body1"
        sx={{
          mb: 3,
          color: 'text.primary',
          lineHeight: 1.8,
          fontStyle: 'italic',
          fontSize: isCenter ? '1.05rem' : '0.95rem',
          transition: 'font-size 0.5s',
        }}
      >
        "{testimonial.text}"
      </Typography>

      {/* פרטי הלקוח */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 1,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            border: isCenter ? '2px solid' : 'none',
            borderColor: 'secondary.main',
          }}
          role="img"
          aria-label={`אווטר של ${testimonial.name}`}
        >
          {testimonial.avatar}
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            color={isCenter ? 'secondary.main' : 'primary.main'}
            sx={{ transition: 'color 0.5s' }}
          >
            {testimonial.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {testimonial.role}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            {testimonial.company}
          </Typography>
        </Box>
      </Box>
    </MotionPaper>
  );
}

function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!inView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [inView]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const prev = (currentIndex - 1 + testimonials.length) % testimonials.length;
    const next = (currentIndex + 1) % testimonials.length;
    return [prev, currentIndex, next];
  };

  const visibleIndices = getVisibleTestimonials();

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* רקע עדין */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(26,35,126,0.02) 0%, rgba(0,188,212,0.03) 100%)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* כותרת */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: 'primary.main',
            }}
          >
            מה הלקוחות שלנו אומרים
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            אלפי עסקים כבר סומכים על TailorBiz
          </Typography>
        </MotionBox>

        {/* Carousel */}
        <Box sx={{ position: 'relative', maxWidth: 1200, mx: 'auto' }}>
          {/* Navigation Buttons */}
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              right: { xs: -10, md: -60 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 48,
              height: 48,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: 'secondary.main',
                borderColor: 'secondary.main',
                color: 'white',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s',
            }}
            aria-label="המלצה קודמת"
          >
            <ArrowForwardIosIcon />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              left: { xs: -10, md: -60 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 48,
              height: 48,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: 'secondary.main',
                borderColor: 'secondary.main',
                color: 'white',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s',
            }}
            aria-label="המלצה הבאה"
          >
            <ArrowBackIosIcon />
          </IconButton>

          {/* Cards Container */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 3,
              alignItems: 'center',
              px: { xs: 2, md: 0 },
            }}
          >
            {visibleIndices.map((index, position) => (
              <TestimonialCard
                key={testimonials[index].id}
                testimonial={testimonials[index]}
                position={position}
                isCenter={position === 1}
              />
            ))}
          </Box>

          {/* Mobile: Single Card */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2 }}>
            <TestimonialCard
              testimonial={testimonials[currentIndex]}
              position={1}
              isCenter={true}
            />
          </Box>
        </Box>

        {/* Dots Indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mt: 6,
          }}
        >
          {testimonials.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: currentIndex === index ? 32 : 8,
                height: 8,
                borderRadius: 1,
                bgcolor: currentIndex === index ? 'secondary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: currentIndex === index ? 'secondary.dark' : 'grey.400',
                },
              }}
            />
          ))}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, md: 8 },
            flexWrap: 'wrap',
          }}
        >
          {[
            { number: '500+', label: 'לקוחות מרוצים' },
            { number: '4.9/5', label: 'דירוג ממוצע' },
            { number: '98%', label: 'שביעות רצון' },
          ].map((stat, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                {stat.number}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default TestimonialsSection;
