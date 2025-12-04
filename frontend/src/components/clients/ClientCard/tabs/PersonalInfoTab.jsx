import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { Phone as PhoneIcon, Email as EmailIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';

const PersonalInfoTab = ({ client }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>פרטים אישיים</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">שם מלא</Typography>
            <Typography variant="body1">{client?.personalInfo?.fullName || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">טלפון</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body1">{client?.personalInfo?.phone || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">אימייל</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon fontSize="small" />
              <Typography variant="body1">{client?.personalInfo?.email || '-'}</Typography>
            </Box>
          </Grid>
          {client?.personalInfo?.whatsappPhone && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WhatsAppIcon fontSize="small" />
                <Typography variant="body1">{client.personalInfo.whatsappPhone}</Typography>
              </Box>
            </Grid>
          )}
          {client?.personalInfo?.preferredContactMethod && (
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">שיטת קשר מועדפת</Typography>
              <Typography variant="body1">{client.personalInfo.preferredContactMethod}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PersonalInfoTab;






