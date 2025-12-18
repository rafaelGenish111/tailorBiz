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
import ClientTimer from '../../timer/ClientTimer';
import TimeEntriesTab from '../../timer/TimeEntriesTab';
import DocumentsTab from '../../documents/DocumentsTab';
import QuotesTab from '../../quotes/QuotesTab';
import TimerIcon from '@mui/icons-material/Timer';
import FolderIcon from '@mui/icons-material/Folder';
import ReceiptIcon from '@mui/icons-material/Receipt';

const ClientCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

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
      new_lead: 'info',
      contacted: 'primary',
      engaged: 'warning',
      meeting_set: 'warning',
      proposal_sent: 'secondary',
      won: 'success',
      lost: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new_lead: 'ליד חדש',
      contacted: 'יצרנו קשר',
      engaged: 'מעורבות',
      meeting_set: 'פגישה נקבעה',
      proposal_sent: 'הצעה נשלחה',
      won: 'נסגר',
      lost: 'הפסדנו',
    };
    return labels[status] || status;
  };

  const extractWebsiteMessageFromInteraction = (content) => {
    if (!content) return '';
    const text = String(content);
    const idx = text.indexOf('\n---');
    const before = (idx >= 0 ? text.slice(0, idx) : text).trim();
    if (!before || before === '---') return '';
    return before;
  };

  const findLatestWebsiteInquiry = (interactions) => {
    if (!Array.isArray(interactions) || interactions.length === 0) return null;

    const candidates = interactions.filter((i) => {
      const subject = String(i?.subject || '');
      const isInbound = i?.direction === 'inbound';
      const isNote = i?.type === 'note';
      const looksLikeWebsite = subject.includes('פניה') || subject.includes('פנייה') || subject.includes('מהאתר') || subject.includes('האתר');
      return isInbound && isNote && looksLikeWebsite;
    });

    const list = candidates.length > 0 ? candidates : interactions;

    const getTime = (i) => {
      const t = i?.timestamp || i?.date;
      const d = t ? new Date(t) : null;
      const ms = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
      return ms;
    };

    return list.reduce((latest, cur) => (getTime(cur) >= getTime(latest) ? cur : latest), list[0]);
  };

  const websiteInquiry =
    client?.leadSource === 'website_form' ? findLatestWebsiteInquiry(client?.interactions || []) : null;
  const websiteMessage = websiteInquiry
    ? extractWebsiteMessageFromInteraction(websiteInquiry.content || websiteInquiry.notes)
    : '';

  return (
    <Box sx={{ width: '100%', p: { xs: 1.5, md: 0 } }}>
      {/* Header Card */}
      <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Left - Client Info */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  mx: { xs: 'auto', sm: 0 },
                }}
              >
                {client.personalInfo?.fullName?.charAt(0) || '?'}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'right' } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                  }}
                >
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
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 2,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                  }}
                >
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
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 2,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                  }}
                >
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

                {/* Website inquiry message */}
                {client?.leadSource === 'website_form' && websiteMessage && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'rgba(156, 39, 176, 0.04)',
                      borderColor: 'rgba(156, 39, 176, 0.25)',
                      textAlign: 'right',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                      🌐 הודעה מהאתר
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {websiteMessage}
                    </Typography>
                    {(websiteInquiry?.timestamp || websiteInquiry?.date) && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        התקבלה: {new Date(websiteInquiry.timestamp || websiteInquiry.date).toLocaleString('he-IL')}
                      </Typography>
                    )}
                  </Paper>
                )}
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

      {/* Timer */}
      <Box sx={{ mb: 3 }}>
        <ClientTimer
          clientId={client._id}
          clientName={client.personalInfo?.fullName || client.businessInfo?.businessName}
        />
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="פרטים אישיים" value="personal" />
          <Tab label="פרטי העסק" value="business" />
          <Tab label="שאלון אפיון" value="assessment" />
          <Tab label="אינטראקציות" value="interactions" />
          <Tab label="הזמנות" value="orders" />
          <Tab label="תשלומים" value="payments" />
          <Tab label="חשבוניות" value="invoices" />
          <Tab label="זמנים" value="time" icon={<TimerIcon />} iconPosition="start" />
          <Tab label="מסמכים" value="documents" icon={<FolderIcon />} iconPosition="start" />
          <Tab label="הצעות מחיר" value="quotes" icon={<ReceiptIcon />} iconPosition="start" />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 'personal' && <PersonalInfoTab client={client} />}
          {activeTab === 'business' && <BusinessInfoTab client={client} />}
          {activeTab === 'assessment' && <AssessmentTab client={client} />}
          {activeTab === 'interactions' && <InteractionsTab clientId={id} />}
          {activeTab === 'orders' && <OrdersTab clientId={id} />}
          {activeTab === 'payments' && <PaymentsTab client={client} />}
          {activeTab === 'invoices' && <InvoicesTab clientId={id} />}
          {activeTab === 'time' && <TimeEntriesTab clientId={id} />}
          {activeTab === 'documents' && <DocumentsTab clientId={id} />}
          {activeTab === 'quotes' && <QuotesTab clientId={id} clientName={client.personalInfo?.fullName} />}
        </Box>
      </Card>
    </Box>
  );
};

export default ClientCard;



