import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { publicCMS } from '../../utils/publicApi';
import { getImageUrl } from '../../utils/imageUtils';

const ClientsLogoMarquee = () => {
  const [clients, setClients] = React.useState([]);
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await publicCMS.getSiteSettings();
        if (!mounted) return;
        setSettings(res.data?.data || null);
      } catch {
        if (!mounted) return;
        setSettings(null);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await publicCMS.getClients();
        setClients(res.data?.data || []);
      } catch (_) {
        setClients([]);
      }
    };
    run();
  }, []);

  const showClientsOnHome = settings?.showClientsOnHome === true;
  if (!showClientsOnHome || !clients.length) return null;

  const items = [...clients, ...clients];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#1A1A1A' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            לקוחות שבחרו לעבוד איתנו
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#E0E0E0',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            מותגים ועסקים מובילים שבוטחים בנו
          </Typography>
        </Box>

        <Box
          sx={{
            overflow: 'hidden',
            borderRadius: '24px',
            bgcolor: '#1E1E1E',
            boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.3)',
            border: '1px solid #333333',
            maxWidth: '900px',
            mx: 'auto',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '80px',
              background: 'linear-gradient(to right, rgba(30,30,30,1) 0%, rgba(30,30,30,0) 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '80px',
              background: 'linear-gradient(to left, rgba(30,30,30,1) 0%, rgba(30,30,30,0) 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 8, md: 12 },
              py: { xs: 4, md: 6 },
              px: { xs: 4, md: 6 },
              width: 'max-content',
              animation: 'marquee 30s linear infinite',
              '@keyframes marquee': {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(-50%)' }
              }
            }}
          >
            {items.map((c, idx) => (
              <Box
                key={`${c._id}_${idx}`}
                component="img"
                src={getImageUrl(c.logo)}
                alt={c.logo?.alt || c.name}
                sx={{
                  height: { xs: 48, md: 64 },
                  maxWidth: { xs: 160, md: 200 },
                  width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.6,
                  filter: 'grayscale(1) brightness(1.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    filter: 'grayscale(0) brightness(1)',
                    opacity: 1,
                    transform: 'scale(1.05)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientsLogoMarquee;
