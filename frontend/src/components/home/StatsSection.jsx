import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { publicCMS } from '../../utils/publicApi';

const MotionBox = motion.create(Box);

function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

function StatCard({ stat, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Grid item xs={6} md={3}>
      <MotionBox
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: '24px',
            bgcolor: '#262626',
            border: '1px solid #333333',
            boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: '#00FF99',
              boxShadow: '0px 24px 48px -12px rgba(0, 255, 153, 0.1)',
            },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#00FF99',
              mb: 1,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            <CountUp end={stat.value} />
            {stat.suffix}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#B0B0B0',
              fontWeight: 500,
            }}
          >
            {stat.label}
          </Typography>
        </Box>
      </MotionBox>
    </Grid>
  );
}

function StatsSection() {
  const [stats, setStats] = useState(null);
  const [clientsCount, setClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        // Load stats from CMS
        const [settingsRes, clientsRes] = await Promise.all([
          publicCMS.getSiteSettings(),
          publicCMS.getClientsCount().catch(() => ({ data: { data: { count: 0 } } }))
        ]);

        if (!mounted) return;

        const settings = settingsRes.data?.data;
        const actualClientsCount = clientsRes.data?.data?.count || 0;

        setClientsCount(actualClientsCount);

        // Use CMS stats or defaults
        const cmsStats = settings?.stats || {};
        const defaultStats = {
          hoursSaved: { value: 10, suffix: '+', label: 'שעות חיסכון שבועי' },
          satisfaction: { value: 95, suffix: '%', label: 'שביעות רצון' },
          businesses: { value: 500, suffix: '+', label: 'עסקים משתמשים' },
          support: { value: 24, suffix: '/7', label: 'תמיכה' }
        };

        const finalStats = [
          { ...defaultStats.hoursSaved, ...(cmsStats.hoursSaved || {}) },
          { ...defaultStats.satisfaction, ...(cmsStats.satisfaction || {}) },
          { ...defaultStats.businesses, ...(cmsStats.businesses || {}) },
          { ...defaultStats.support, ...(cmsStats.support || {}) }
        ];

        setStats(finalStats);
      } catch (error) {
        console.error('Error loading stats:', error);
        if (mounted) {
          // Fallback to defaults
          setStats([
            { value: 10, suffix: '+', label: 'שעות חיסכון שבועי' },
            { value: 95, suffix: '%', label: 'שביעות רצון' },
            { value: 500, suffix: '+', label: 'עסקים משתמשים' },
            { value: 24, suffix: '/7', label: 'תמיכה' }
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  // Don't show section if less than 10 clients
  if (!loading && clientsCount < 10) {
    return null;
  }

  if (loading || !stats) {
    return null;
  }

  return (
    <Box
      sx={{
        py: { xs: 24, md: 32 },
        bgcolor: '#141414',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            המספרים מדברים בעד עצמם
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default StatsSection;
