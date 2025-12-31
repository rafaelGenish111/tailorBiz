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
      } catch (_) {
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
        // Base layer - white background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Grid pattern using CSS
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          // Mask to fade out at bottom
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          zIndex: 1,
        },
      }}
    >
      {/* Aurora Blur Blobs */}
      {/* Top-left blob - Royal Blue */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0, 113, 227, 0.25) 0%, rgba(0, 113, 227, 0) 70%)',
          filter: 'blur(100px)',
          opacity: 0.3,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      
      {/* Bottom-right blob - Cyan/Purple mix */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 188, 212, 0.2) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(0, 188, 212, 0) 70%)',
          filter: 'blur(120px)',
          opacity: 0.25,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      
      {/* Additional subtle blob - middle right */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, rgba(0, 113, 227, 0) 60%)',
          filter: 'blur(80px)',
          opacity: 0.2,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
            textAlign: 'center',
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
            <Box
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
            </Box>
          </motion.div>

          {/* כותרת ראשית - Apple/Big Tech Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Typography
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
