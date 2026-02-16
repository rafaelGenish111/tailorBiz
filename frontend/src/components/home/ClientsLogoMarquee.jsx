import { Box, Container, Typography } from '@mui/material';

const clients = [
  { name: 'Glass Dynamics', logo: '/assets/images/clients/GD.jpg' },
  { name: 'Ecommagnet', logo: '/assets/images/clients/ecommagnet.jpeg' },
  { name: 'Leah Genish', logo: '/assets/images/clients/logo_leah_genish.jpeg' },
  { name: 'Sensa', logo: '/assets/images/clients/sensa.png' },
  { name: 'שופרות מהדרין', logo: '/assets/images/clients/shofarot.png' },
];

// Duplicate for seamless infinite scroll
const items = [...clients, ...clients];

const ClientsLogoMarquee = () => {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#0A0A0A', overflowX: 'hidden' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{
              color: '#00FF99',
              fontWeight: 700,
              letterSpacing: '0.2em',
              fontSize: '0.75rem',
              mb: 1.5,
              display: 'block'
            }}
          >
            לקוחות
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            עסקים שבחרו לעבוד איתנו
          </Typography>
        </Box>

        <Box
          sx={{
            overflow: 'hidden',
            position: 'relative',
            maxWidth: '900px',
            mx: 'auto',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '80px',
              background: 'linear-gradient(to right, #0A0A0A 0%, rgba(10,10,10,0) 100%)',
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
              background: 'linear-gradient(to left, #0A0A0A 0%, rgba(10,10,10,0) 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 5, md: 8 },
              py: { xs: 3, md: 4 },
              width: 'max-content',
              animation: 'clientMarquee 25s linear infinite',
              '&:hover': {
                animationPlayState: 'paused',
              },
              '@keyframes clientMarquee': {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(-50%)' }
              }
            }}
          >
            {items.map((c, idx) => (
              <Box
                key={`${c.name}_${idx}`}
                sx={{
                  flexShrink: 0,
                  width: { xs: 140, md: 200 },
                  height: { xs: 85, md: 110 },
                  borderRadius: '12px',
                  bgcolor: '#1A1A1A',
                  border: '1px solid #262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#00FF99',
                    bgcolor: '#1F1F1F',
                    transform: 'scale(1.05)',
                    '& img': {
                      filter: 'grayscale(0) brightness(1)',
                      opacity: 1,
                    }
                  }
                }}
              >
                <Box
                  component="img"
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  sx={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'grayscale(1) brightness(1.3)',
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientsLogoMarquee;
