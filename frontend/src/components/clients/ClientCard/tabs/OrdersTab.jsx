import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const OrdersTab = ({ clientId }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>הזמנות</Typography>
        <Typography variant="body2" color="text.secondary">
          פונקציונליות הזמנות תתווסף בקרוב
        </Typography>
      </Paper>
    </Box>
  );
};

export default OrdersTab;













