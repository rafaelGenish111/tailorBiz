import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { publicCMS } from '../../utils/publicApi';
import { getImageUrl } from '../../utils/imageUtils';

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
    <Box sx={{ py: { xs: 12, md: 16 }, bgcolor: '#111111' }}>
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
                  border: '1px solid #333333',
                  bgcolor: '#1E1E1E',
                  boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#00E676',
                    boxShadow: '0px 24px 48px -12px rgba(0, 230, 118, 0.1)',
                  },
                }}
              >
                {s.image?.url ? (
                  <Box
                    component="img"
                    src={getImageUrl(s.image)}
                    alt={s.image.alt || s.title || ''}
                    sx={{ width: '100%', height: 160, objectFit: 'contain', mb: 2 }}
                  />
                ) : null}
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: '#FFFFFF' }}>
                  {s.title || ''}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#E0E0E0' }}>
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
