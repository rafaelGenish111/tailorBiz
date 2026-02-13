import React from 'react';
import { Box, Container, Typography, Grid, Paper, Link as MuiLink, Stack } from '@mui/material';
import { publicCMS } from '../utils/publicApi';
import { getImageUrl } from '../utils/imageUtils';

const OurClients = () => {
  const [clients, setClients] = React.useState([]);

  React.useEffect(() => {
    const run = async () => {
      const res = await publicCMS.getClients();
      setClients(res.data?.data || []);
    };
    run();
  }, []);

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
            הלקוחות שלנו
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
            מותגים ועסקים שבחרו להפוך תהליכים ידניים למערכת מסודרת ונקייה.
          </Typography>
        </Box>

        <Stack spacing={4}>
          {clients.map((c) => (
            <Paper
              key={c._id}
              variant="outlined"
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: 3, md: 6 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#00FF99',
                  boxShadow: '0 10px 40px -12px rgba(0, 255, 153, 0.15)'
                }
              }}
            >
              {/* Logo Column */}
              <Box
                sx={{
                  width: { xs: '100%', md: 240 },
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  bgcolor: '#262626',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#333333',
                  height: 160
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(c.logo)}
                  alt={c.logo?.alt || c.name}
                  sx={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'grayscale(1) brightness(1.5)',
                    transition: 'all 0.3s',
                    opacity: 0.7,
                    '&:hover': { filter: 'grayscale(0) brightness(1)', opacity: 1 }
                  }}
                />
              </Box>

              {/* Content Column */}
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: 1 }}>
                  {c.name}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 2, mt: 0.5 }}>
                  {c.projectTitle || c.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '800px', lineHeight: 1.7 }}>
                  {c.description || 'ללקוח זה עדיין לא הוזן תיאור פרויקט.'}
                </Typography>

                {c.websiteUrl && (
                  <MuiLink
                    href={c.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: 700,
                      gap: 1,
                      color: 'text.primary',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    ביקור באתר
                    <Box component="span" sx={{ fontSize: '1.2em', lineHeight: 1 }}>→</Box>
                  </MuiLink>
                )}
              </Box>
            </Paper>
          ))}
        </Stack>

        {clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">אין לקוחות להצגה כרגע.</Typography>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default OurClients;

