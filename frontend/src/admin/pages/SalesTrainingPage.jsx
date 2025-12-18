import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SalesOnboarding from '../../pages/SalesOnboarding';
import { getCurrentUserFromQueryData, useCurrentUserQuery } from '../hooks/useCurrentUser';

export default function SalesTrainingPage() {
  const { data, isLoading } = useCurrentUserQuery();
  const user = getCurrentUserFromQueryData(data);

  // RequireAdminAuth already guards; this is just for a cleaner UX
  if (isLoading || !user) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: '100%', overflowX: 'hidden' }}>
      <Container maxWidth="lg" disableGutters>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          הדרכת מכירות
        </Typography>
        <SalesOnboarding variant="embedded" />
      </Container>
    </Box>
  );
}
