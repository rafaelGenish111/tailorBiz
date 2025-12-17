import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

const InvoicesTab = ({ clientId }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>חשבוניות</Typography>
        <Typography variant="body2" color="text.secondary">
          פונקציונליות חשבוניות תתווסף בקרוב
        </Typography>
      </Paper>
    </Box>
  );
};

export default InvoicesTab;












