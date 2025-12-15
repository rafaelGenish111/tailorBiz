import React from 'react';
import { Box, Container, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { publicCMS } from '../utils/publicApi';

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

        <Grid container spacing={2}>
          {clients.map((c) => (
            <Grid item xs={6} sm={4} md={3} key={c._id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  borderColor: 'grey.100',
                  bgcolor: 'white'
                }}
              >
                {c.websiteUrl ? (
                  <MuiLink href={c.websiteUrl} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="img" src={c.logo?.url} alt={c.logo?.alt || c.name} sx={{ maxHeight: 56, maxWidth: '100%', opacity: 0.9 }} />
                  </MuiLink>
                ) : (
                  <Box component="img" src={c.logo?.url} alt={c.logo?.alt || c.name} sx={{ maxHeight: 56, maxWidth: '100%', opacity: 0.9 }} />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

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

