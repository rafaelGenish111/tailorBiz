import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { cardSection } from '../../../../admin/styles/cardStyles';

const BusinessInfoTab = ({ client }) => {
  return (
    <Box>
      <Paper variant="outlined" sx={cardSection}>
        <Typography variant="h6" gutterBottom fontWeight={600}>מידע עסקי</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">שם העסק</Typography>
            <Typography variant="body1">{client?.businessInfo?.businessName || '-'}</Typography>
          </Grid>
          {client?.businessInfo?.industry && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">תחום עיסוק</Typography>
              <Typography variant="body1">{client.businessInfo.industry}</Typography>
            </Grid>
          )}
          {client?.businessInfo?.businessType && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">סוג עסק</Typography>
              <Typography variant="body1">{client.businessInfo.businessType}</Typography>
            </Grid>
          )}
          {client?.businessInfo?.website && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">אתר אינטרנט</Typography>
              <Typography variant="body1">
                <a href={client.businessInfo.website} target="_blank" rel="noopener noreferrer">
                  {client.businessInfo.website}
                </a>
              </Typography>
            </Grid>
          )}
          {client?.businessInfo?.numberOfEmployees && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">מספר עובדים</Typography>
              <Typography variant="body1">{client.businessInfo.numberOfEmployees}</Typography>
            </Grid>
          )}
          {client?.businessInfo?.address && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">כתובת</Typography>
              <Typography variant="body1">{client.businessInfo.address}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default BusinessInfoTab;


















