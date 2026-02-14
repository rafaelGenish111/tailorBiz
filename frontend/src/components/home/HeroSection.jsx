import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { publicCMS } from '../../utils/publicApi';
import Button from '../ui/Button';

const VIDEO_SRC = '/assets/images/new-background.mp4';

function HeroSection() {
  const [cmsHero, setCmsHero] = React.useState(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await publicCMS.getPage('home');
        setCmsHero(res.data?.data?.content || null);
      } catch (e) {
        console.error('Error loading hero content:', e);
        setCmsHero(null);
      }
    };
    run();
  }, []);

  const headline = (cmsHero?.heroTitle || 'מערכות חכמות.\nתפירה אישית.').trim();
  const subtitle = (cmsHero?.heroSubtitle || 'מערכת אחת חכמה שמרכזת, מפשטת ומייעלת את הניהול העסקי שלכם.').trim();
  const ctaText = (cmsHero?.heroCtaText || 'בואו נעשה סדר').trim();
  const ctaHref = cmsHero?.heroCtaHref || '/contact';

  const headlineLines = headline.split('\n');

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: '#000000',
      }}
    >
      {/* Video Background */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </Box>

      {/* Dark radial vignette — "black hole" effect:
          Darkest in the center (where text lives), video peeks through at edges */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.35) 100%)
          `,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          py: { xs: 16, md: 0 },
          px: { xs: 3, md: 6 },
        }}
      >
        {/* Small label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            sx={{
              color: '#00FF99',
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: { xs: 3, md: 4 },
            }}
          >
            TaylorBiz — פיתוח מערכות
          </Typography>
        </motion.div>

        {/* Massive Headline */}
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          {headlineLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.4 + i * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Typography
                component={i === 0 ? 'h1' : 'span'}
                sx={{
                  display: 'block',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem', lg: '7rem' },
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                }}
              >
                {line}
              </Typography>
            </motion.div>
          ))}
        </Box>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
              fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.35rem' },
              lineHeight: 1.7,
              maxWidth: 600,
              mx: 'auto',
              mb: { xs: 5, md: 6 },
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
            }}
          >
            {subtitle}
          </Typography>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Button
            variant="primary"
            size="large"
            to={ctaHref}
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              px: { xs: 5, md: 7 },
              py: { xs: 1.8, md: 2.2 },
            }}
          >
            {ctaText}
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Box
            sx={{
              mt: { xs: 8, md: 12 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box sx={{ width: 1, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }} />
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Bottom architectural line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: '#333333',
          zIndex: 3,
        }}
      />
    </Box>
  );
}

export default HeroSection;
