import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { publicCMS } from '../../utils/publicApi';

const ClientsLogoMarquee = () => {
  const [clients, setClients] = React.useState([]);

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

  if (!clients.length) return null;

  // simple marquee: duplicate items for seamless loop
  const items = [...clients, ...clients];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F5F5F7' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              color: '#1D1D1F',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            לקוחות שבחרו לעבוד איתנו
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#86868B',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            מותגים ועסקים מובילים שבוטחים בנו
          </Typography>
        </Box>

        {/* Marquee Container - Limited Width */}
        <Box
          sx={{
            overflow: 'hidden',
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.05)',
            border: 'none',
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
              background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
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
              background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
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
                src={c.logo?.url}
                alt={c.logo?.alt || c.name}
                sx={{
                  height: { xs: 48, md: 64 },
                  maxWidth: { xs: 160, md: 200 },
                  width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.7,
                  filter: 'grayscale(1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    filter: 'grayscale(0)', 
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

