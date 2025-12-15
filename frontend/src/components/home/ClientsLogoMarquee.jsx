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
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          לקוחות שבחרו לעבוד מסודר
        </Typography>
      </Container>
      <Box
        sx={{
          overflow: 'hidden',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          bgcolor: 'white'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            py: 2.5,
            px: 4,
            width: 'max-content',
            animation: 'marquee 24s linear infinite',
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
                height: { xs: 28, md: 34 },
                maxWidth: 140,
                opacity: 0.9,
                filter: 'grayscale(1)',
                transition: 'filter 0.2s, opacity 0.2s',
                '&:hover': { filter: 'grayscale(0)', opacity: 1 }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientsLogoMarquee;

