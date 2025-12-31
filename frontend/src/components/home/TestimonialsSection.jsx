import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import StarIcon from '@mui/icons-material/Star';
import { publicCMS } from '../../utils/publicApi';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // For local paths, use window.location.origin (works in both dev and production)
  // The image path should be like /uploads/images/testimonial-xxx.jpg
  const fullUrl = `${window.location.origin}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  console.log('Testimonial image URL:', { imagePath, fullUrl });
  return fullUrl;
};

function TestimonialCard({ testimonial, isCenter }) {
  const scale = isCenter ? 1 : 0.85;
  const opacity = isCenter ? 1 : 0.6;
  const zIndex = isCenter ? 10 : 1;
  const imageUrl = getImageUrl(testimonial.image);
  const [imageError, setImageError] = useState(false);

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
        "{testimonial.content}"
      </Typography>

      {/* פרטי הלקוח */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
        <Avatar
          src={imageUrl && !imageError ? imageUrl : undefined}
          alt={testimonial.clientName}
          onError={() => setImageError(true)}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            bgcolor: '#F5F5F7',
            border: isCenter ? '2px solid' : 'none',
            borderColor: '#0071E3',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0071E3',
          }}
        >
          {imageError || !imageUrl ? (testimonial.clientName?.charAt(0) || '👤') : null}
        </Avatar>
        <Box>
          <Typography
            component="h3"
            variant="h6"
            fontWeight={700}
            color={isCenter ? 'secondary.main' : 'primary.main'}
            sx={{ transition: 'color 0.5s' }}
          >
            {testimonial.clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {testimonial.clientRole}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            {testimonial.companyName}
          </Typography>
        </Box>
      </Box>
    </MotionPaper>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [testimonialsRes, settingsRes, clientsRes] = await Promise.all([
          publicCMS.getTestimonials(),
          publicCMS.getSiteSettings(),
          publicCMS.getClientsCount().catch(() => ({ data: { data: { count: 0 } } }))
        ]);

        setTestimonials(testimonialsRes.data?.data || []);

        const actualClientsCount = clientsRes.data?.data?.count || 0;
        setClientsCount(actualClientsCount);

        // Load stats from CMS
        const settings = settingsRes.data?.data;
        const cmsStats = settings?.stats || {};
        const defaultStats = {
          hoursSaved: { value: 10, suffix: '+', label: 'שעות חיסכון שבועי' },
          satisfaction: { value: 95, suffix: '%', label: 'שביעות רצון' },
          businesses: { value: 500, suffix: '+', label: 'עסקים משתמשים' },
          support: { value: 24, suffix: '/7', label: 'תמיכה' }
        };

        // Use first 3 stats for testimonials section
        const statsForTestimonials = [
          { number: `${cmsStats.businesses?.value || defaultStats.businesses.value}${cmsStats.businesses?.suffix || defaultStats.businesses.suffix}`, label: cmsStats.businesses?.label || defaultStats.businesses.label },
          { number: '4.9/5', label: 'דירוג ממוצע' },
          { number: `${cmsStats.satisfaction?.value || defaultStats.satisfaction.value}${cmsStats.satisfaction?.suffix || defaultStats.satisfaction.suffix}`, label: cmsStats.satisfaction?.label || defaultStats.satisfaction.label }
        ];

        setStatsData(statsForTestimonials);
      } catch (err) {
        console.error('Failed to fetch testimonials', err);
        setStatsData([
          { number: '500+', label: 'לקוחות מרוצים' },
          { number: '4.9/5', label: 'דירוג ממוצע' },
          { number: '98%', label: 'שביעות רצון' }
        ]);
      } finally {
        setStatsLoading(false);
      }
    };
    fetch();
  }, []);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!inView || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [inView, testimonials]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    if (testimonials.length === 1) return [0, 0, 0];
    if (testimonials.length === 2) {
      // Just duplicate logic for 2 items to fill 3 slots
      const prev = (currentIndex - 1 + testimonials.length) % testimonials.length;
      const next = (currentIndex + 1) % testimonials.length;
      return [prev, currentIndex, next];
    }
    const prev = (currentIndex - 1 + testimonials.length) % testimonials.length;
    const next = (currentIndex + 1) % testimonials.length;
    return [prev, currentIndex, next];
  };

  const visibleIndices = getVisibleTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 24, md: 32 },
        bgcolor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mx: 'auto', px: { xs: 3, md: 6 } }}>
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
              color: '#1D1D1F',
            }}
          >
            מה הלקוחות שלנו אומרים
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#86868B',
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
            {visibleIndices.map((index, pos) => (
              <TestimonialCard
                key={`${testimonials[index]._id}-${pos}`}
                testimonial={testimonials[index]}
                isCenter={pos === 1}
              />
            ))}
          </Box>

          {/* Mobile: Single Card */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2 }}>
            <TestimonialCard
              testimonial={testimonials[currentIndex]}
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

        {/* Stats - Only show if 10+ clients */}
        {!statsLoading && clientsCount >= 10 && statsData && (
          <Box
            sx={{
              mt: 8,
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 3, md: 8 },
              flexWrap: 'wrap',
            }}
          >
            {statsData.map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#0071E3',
                    mb: 0.5,
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default TestimonialsSection;
