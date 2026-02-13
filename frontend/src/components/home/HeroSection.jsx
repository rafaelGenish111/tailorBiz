import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { publicCMS } from '../../utils/publicApi';
import Button from '../ui/Button';
import ConnectedDotsBackground from '../ui/ConnectedDotsBackground';

const LOGO_SRC = '/logo.png';

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

  const title = (cmsHero?.heroTitle || 'מערכות חכמות בתפירה אישית').trim();
  const subtitle = (cmsHero?.heroSubtitle || 'לעשות סדר, ליצור שליטה, ולפשט ניהול עסקי מורכב באמצעות מערכת אחת חכמה.').trim();
  const ctaText = (cmsHero?.heroCtaText || 'בואו נעשה סדר').trim();
  const ctaHref = cmsHero?.heroCtaHref || '/contact';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 'calc(100vh - 80px)', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(0, 255, 153, 0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(0, 255, 153, 0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(0, 255, 153, 0.03) 0%, transparent 40%),
          #0A0A0A
        `,
      }}
    >
      {/* Connected Dots Animation - Layer 1 */}
      <ConnectedDotsBackground
        dotColor="rgba(0, 255, 153, 0.4)"
        lineColor="rgba(0, 255, 153, 0.12)"
        dotCount={80}
        connectionDistance={150}
        speed={0.3}
      />

      {/* Subtle Green Glow Blobs - Layer 2 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '800px',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        {/* Blob 1 - Primary Green */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Blob 2 - Secondary Green */}
        <motion.div
          animate={{
            x: [0, -15, 10, 0],
            y: [0, 20, -15, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.10) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Blob 3 - Accent */}
        <motion.div
          animate={{
            x: [0, 10, -15, 0],
            y: [0, -15, 20, 0],
            scale: [1, 1.03, 0.97, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          style={{
            position: 'absolute',
            top: '40%',
            left: '60%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </Box>

      {/* Content Layer - Layer 3 */}
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
            backgroundColor: 'rgba(26, 26, 26, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(51, 51, 51, 0.6)',
            borderRadius: '24px',
            padding: { xs: 3, md: 5 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt="TaylorBiz לוגו"
              loading="eager"
              sx={{
                height: { xs: 100, sm: 140, md: 180 },
                width: 'auto',
                mx: 'auto',
                display: 'block',
                mb: 4,
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 30px rgba(0,255,153,0.15))',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          {/* H1 Headline */}
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
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {title}
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: '#B0B0B0',
                fontWeight: 400,
                lineHeight: 1.6,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
                fontSize: { xs: '1.1rem', md: '1.35rem' },
              }}
            >
              {subtitle}
            </Typography>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="primary"
                size="large"
                startIcon={<RocketLaunchOutlinedIcon />}
                to={ctaHref}
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                }}
              >
                {ctaText}
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;
