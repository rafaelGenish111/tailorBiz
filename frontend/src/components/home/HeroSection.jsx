import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { publicCMS } from '../../utils/publicApi';
import Button from '../ui/Button';

const LOGO_SRC = '/assets/images/image-removebg-preview.png';

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

  const title = (cmsHero?.heroTitle || 'אוטומציה מותאמת אישית לעסק שלך').trim();
  const subtitle = (cmsHero?.heroSubtitle || 'בלי דמי מנוי חודשיים - הנכס נשאר שלך').trim();
  const ctaText = (cmsHero?.heroCtaText || 'לבדיקת היתכנות ואפיון').trim();
  const ctaHref = cmsHero?.heroCtaHref || '/contact';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 'calc(100vh - 80px)', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Video Background - Layer 1 (Bottom) */}
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        aria-label="Animation of an automated business dashboard showing efficiency metrics"
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
        <source src="/assets/images/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Box>

      {/* Glass Overlay - Layer 2 (Above Video, Below Content) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Animated Mesh Gradient Blobs Container - Optional, can be removed if too busy */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '600px',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
          opacity: 0.3, // Reduced opacity to work with video
        }}
      >
        {/* Blob 1 - The Anchor (Purple/Violet) */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: '-16px',
            width: '288px',
            height: '288px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.6) 0%, rgba(167, 139, 250, 0.6) 100%)',
            mixBlendMode: 'multiply',
            filter: 'blur(50px)',
            opacity: 0.6,
          }}
        />

        {/* Blob 2 - The Flow (Brand Blue) */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: '-16px',
            width: '288px',
            height: '288px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.6) 0%, rgba(96, 165, 250, 0.6) 100%)',
            mixBlendMode: 'multiply',
            filter: 'blur(50px)',
            opacity: 0.6,
          }}
        />

        {/* Blob 3 - The Accent (Cyan/Pink) */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 6,
          }}
          style={{
            position: 'absolute',
            bottom: '-32px',
            left: '80px',
            width: '288px',
            height: '288px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.5) 0%, rgba(251, 113, 133, 0.5) 100%)',
            mixBlendMode: 'multiply',
            filter: 'blur(50px)',
            opacity: 0.6,
          }}
        />

        {/* Blob 4 - Additional Color (Green/Teal) */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 9,
          }}
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '288px',
            height: '288px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.5) 0%, rgba(34, 197, 94, 0.5) 100%)',
            mixBlendMode: 'multiply',
            filter: 'blur(50px)',
            opacity: 0.5,
          }}
        />
      </Box>

      {/* Content Layer - Layer 3 (Top) */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 10,
          mx: 'auto',
          px: { xs: 3, md: 6 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 800,
            mx: 'auto',
            textAlign: 'center',
            // Ensure text readability with subtle backdrop
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: { xs: 3, md: 4 },
          }}
        >
          {/* Logo גדול */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt="לוגו"
              loading="eager"
              sx={{
                height: { xs: 140, sm: 180, md: 240 },
                width: 'auto',
                mx: 'auto',
                display: 'block',
                mb: 4,
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 30px rgba(11,31,51,0.10))',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          {/* USP Badge - בלי דמי מנוי */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 4,
                py: 1.5,
                mb: 3,
                borderRadius: 8,
                bgcolor: 'rgba(211,139,42,0.12)',
                border: '2px solid',
                borderColor: 'rgba(211,139,42,0.3)',
                boxShadow: '0 4px 12px rgba(211,139,42,0.15)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                בלי דמי מנוי חודשיים - הנכס נשאר שלך
              </Typography>
            </Box> */}
          </motion.div>

          {/* כותרת ראשית - Apple/Big Tech Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Typography
              component="h1"
              variant="h1"
              sx={{
                mb: 3,
                color: '#1D1D1F',
                fontWeight: 700,
                fontSize: { xs: '3rem', md: '5rem' }, // text-5xl md:text-7xl
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {title}
            </Typography>
          </motion.div>

          {/* תת-כותרת */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: '#86868B',
                fontWeight: 400,
                lineHeight: 1.6,
                fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
              }}
            >
              <strong>{subtitle}</strong>
            </Typography>
          </motion.div>

          {/* כפתורים */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                variant="primary"
                size="large"
                startIcon={<RocketLaunchOutlinedIcon />}
                to={ctaHref}
              >
                {ctaText}
              </Button>
              <Button
                variant="secondary"
                size="large"
                startIcon={<PlayCircleOutlineIcon />}
                to="/contact"
              >
                רוצים לעצור את זליגת הכסף? בואו נדבר
              </Button>
            </Stack>
          </motion.div>

          {/* נתונים מהירים - מוסתר עד שיש נתונים אמיתיים */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 3, sm: 6 }}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ pt: 4 }}
            >
              {[
                { number: '+10', label: 'שעות חיסכון שבועי' },
                { number: '95%', label: 'שביעות רצון' },
                { number: '+500', label: 'עסקים מרוצים' },
              ].map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center', minWidth: 120 }}>
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
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </motion.div> */}
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;
