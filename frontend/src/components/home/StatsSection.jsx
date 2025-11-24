import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const MotionBox = motion(Box);

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

const stats = [
  {
    value: 10,
    suffix: '+',
    label: 'שעות חיסכון שבועי',
    color: '#00bcd4',
  },
  {
    value: 95,
    suffix: '%',
    label: 'שביעות רצון',
    color: '#1a237e',
  },
  {
    value: 500,
    suffix: '+',
    label: 'עסקים משתמשים',
    color: '#00bcd4',
  },
  {
    value: 24,
    suffix: '/7',
    label: 'תמיכה',
    color: '#1a237e',
  },
];

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
            borderRadius: 1,
            bgcolor: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
            },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: stat.color,
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
              color: 'text.secondary',
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
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: 'white',
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
