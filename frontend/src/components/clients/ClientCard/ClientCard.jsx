// frontend/src/components/clients/ClientCard/ClientCard.jsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../../../admin/hooks/useClients';

import PersonalInfoTab from './tabs/PersonalInfoTab';
import BusinessInfoTab from './tabs/BusinessInfoTab';
import AssessmentTab from './tabs/AssessmentTab';
import InteractionsTab from './tabs/InteractionsTab';
import OrdersTab from './tabs/OrdersTab';
import PaymentsTab from './tabs/PaymentsTab';
import InvoicesTab from './tabs/InvoicesTab';

const ClientCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: response, isLoading } = useClient(id);
  const client = response?.data;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>לקוח לא נמצא</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      lead: 'info',
      contacted: 'primary',
      assessment_completed: 'warning',
      proposal_sent: 'secondary',
      negotiation: 'warning',
      won: 'success',
      active_client: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      lead: 'ליד חדש',
      contacted: 'יצירת קשר',
      assessment_scheduled: 'אפיון מתוזמן',
      assessment_completed: 'אפיון הושלם',
      proposal_sent: 'הצעה נשלחה',
      negotiation: 'משא ומתן',
      won: 'נסגר',
      active_client: 'לקוח פעיל',
      in_development: 'בפיתוח',
      completed: 'הושלם'
    };
    return labels[status] || status;
  };

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Left - Client Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                {client.personalInfo?.fullName?.charAt(0) || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4">
                    {client.personalInfo?.fullName || 'ללא שם'}
                  </Typography>
                  <IconButton size="small" onClick={() => navigate(`/admin/clients/${id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {client.businessInfo?.businessName || 'ללא שם עסק'}
                </Typography>

                {/* Contact Info */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {client.personalInfo?.phone && (
                    <Button
                      size="small"
                      startIcon={<PhoneIcon />}
                      href={`tel:${client.personalInfo.phone}`}
                    >
                      {client.personalInfo.phone}
                    </Button>
                  )}
                  {client.personalInfo?.email && (
                    <Button
                      size="small"
                      startIcon={<EmailIcon />}
                      href={`mailto:${client.personalInfo.email}`}
                    >
                      {client.personalInfo.email}
                    </Button>
                  )}
                  {client.personalInfo?.whatsappPhone && (
                    <Button
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      sx={{ color: '#25D366' }}
                      href={`https://wa.me/${client.personalInfo.whatsappPhone}`}
                      target="_blank"
                    >
                      WhatsApp
                    </Button>
                  )}
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={getStatusLabel(client.status)}
                    color={getStatusColor(client.status)}
                    size="small"
                  />
                  <Chip
                    label={`מקור: ${client.leadSource || '-'}`}
                    size="small"
                    variant="outlined"
                  />
                  {client.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right - Stats */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Lead Score */}
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon />
                  <Box>
                    <Typography variant="caption">ציון ליד</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {client.leadScore || 0}/100
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Revenue */}
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      סה"כ הכנסות
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₪{client.metadata?.stats?.totalRevenue?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Interactions Count */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  אינטראקציות
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {client.interactions?.length || 0}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="פרטים אישיים" />
          <Tab label="פרטי העסק" />
          <Tab label="שאלון אפיון" />
          <Tab label="אינטראקציות" />
          <Tab label="הזמנות" />
          <Tab label="תשלומים" />
          <Tab label="חשבוניות" />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <PersonalInfoTab client={client} />}
          {activeTab === 1 && <BusinessInfoTab client={client} />}
          {activeTab === 2 && <AssessmentTab client={client} />}
          {activeTab === 3 && <InteractionsTab clientId={id} />}
          {activeTab === 4 && <OrdersTab clientId={id} />}
          {activeTab === 5 && <PaymentsTab client={client} />}
          {activeTab === 6 && <InvoicesTab clientId={id} />}
        </Box>
      </Card>
    </Box>
  );
};

export default ClientCard;



