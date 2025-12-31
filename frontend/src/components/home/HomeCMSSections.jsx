import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { publicCMS } from '../../utils/publicApi';

const HomeCMSSections = () => {
  const [sections, setSections] = React.useState([]);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await publicCMS.getPage('home');
        const content = res.data?.data?.content || {};
        setSections(Array.isArray(content.sections) ? content.sections : []);
      } catch {
        setSections([]);
      }
    };
    run();
  }, []);

  if (!sections.length) return null;

  return (
    <Box sx={{ py: { xs: 24, md: 32 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Grid container spacing={3}>
          {sections.map((s, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  border: 'none',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.05)'
                }}
              >
                {s.image?.url ? (
                  <Box
                    component="img"
                    src={s.image.url}
                    alt={s.image.alt || s.title || ''}
                    sx={{ width: '100%', height: 160, objectFit: 'contain', mb: 2 }}
                  />
                ) : null}
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {s.title || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {s.description || ''}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeCMSSections;

