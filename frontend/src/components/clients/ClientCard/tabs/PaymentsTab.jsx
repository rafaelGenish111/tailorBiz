import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const PaymentsTab = ({ client }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>תשלומים</Typography>
        {client?.paymentPlan ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                תוכנית תשלומים תוצג כאן
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            אין תוכנית תשלומים
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentsTab;






