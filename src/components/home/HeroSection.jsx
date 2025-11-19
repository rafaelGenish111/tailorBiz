import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

function HeroSection() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 'calc(100vh - 80px)', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(26,35,126,0.03) 0%, rgba(0,188,212,0.05) 100%)',
          zIndex: 0,
        }}
      />

      {/* עיגולים מטושטשים לאפקט */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,35,126,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
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
                px: 3,
                py: 1,
                mb: 4,
                borderRadius: 50,
                bgcolor: 'rgba(0,188,212,0.08)',
                border: '1px solid',
                borderColor: 'rgba(0,188,212,0.2)',
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} aria-hidden="true" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                הפתרון האוטומטי המוביל בישראל
              </Typography>
            </Box>
          </motion.div>

          {/* כותרת ראשית */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                color: 'text.primary',
                fontWeight: 800,
              }}
            >
              TailorBiz – מערכת ניהול{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                אוטומטית
              </Box>
              <br />
              בהתאמה אישית
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
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              חוסכת <strong>10+ שעות שבועיות</strong> ומחזירה לקוחות שהלכו לאיבוד
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
                variant="contained"
                size="large"
                color="secondary"
                startIcon={<RocketLaunchOutlinedIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                קבעו דמו חינם
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayCircleOutlineIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(26,35,126,0.04)',
                  },
                }}
              >
                צפו איך זה עובד
              </Button>
            </Stack>
          </motion.div>

          {/* נתונים מהירים */}
          <motion.div
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
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;
