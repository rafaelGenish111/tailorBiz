// frontend/src/components/clients/ClientCard/ClientCard.jsx

import React, { useEffect, useState } from 'react';
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
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  ArrowForward as ArrowBackIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useClient, useUpdateClient, useConvertLead } from '../../../admin/hooks/useClients';
import { getCurrentUserFromQueryData, useCurrentUserQuery } from '../../../admin/hooks/useCurrentUser';
import { useAdminUsers } from '../../../admin/hooks/useAdminUsers';
import ConvertLeadDialog from '../../../admin/components/common/ConvertLeadDialog';

import PersonalInfoTab from './tabs/PersonalInfoTab';
import BusinessInfoTab from './tabs/BusinessInfoTab';
import InteractionsTab from './tabs/InteractionsTab';
import ProjectsTab from './tabs/ProjectsTab';

// תוכן ראשי - מופרד כדי לשמור על Rules of Hooks (אין early returns לפני hooks)
function ClientCardContent({ client, id }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'personal');
  const { data: meData } = useCurrentUserQuery();
  const me = getCurrentUserFromQueryData(meData);
  const canAssignLead = me?.role === 'admin' || me?.role === 'super_admin';
  const { data: usersRes } = useAdminUsers();
  const users = usersRes?.data || [];
  const employeeUsers = users.filter((u) => u?.role === 'employee');
  const updateClientMutation = useUpdateClient();
  const convertLeadMutation = useConvertLead();
  const [assignedTo, setAssignedTo] = useState('');
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  useEffect(() => {
    const currentAssigned = client?.metadata?.assignedTo?._id || client?.metadata?.assignedTo || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAssignedTo(currentAssigned ? String(currentAssigned) : '');
  }, [client?._id, client?.metadata?.assignedTo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const isLead = client.status && client.status !== 'won' && client.status !== 'completed';

  const ALL_STATUSES = {
    new_lead: 'ליד חדש',
    contacted: 'יצרנו קשר',
    engaged: 'מעורבות',
    meeting_set: 'פגישה נקבעה',
    proposal_sent: 'הצעה נשלחה',
    won: 'נסגר',
    completed: 'הסתיים',
    lost: 'הפסדנו',
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'won') {
      setConvertDialogOpen(true);
    } else {
      updateClientMutation.mutate({ id, data: { status: newStatus } });
    }
  };

  const handleConvertConfirm = (formData) => {
    convertLeadMutation.mutate(
      { clientId: id, data: formData },
      {
        onSuccess: () => {
          setConvertDialogOpen(false);
        },
      }
    );
  };

  const STATUS_STYLES = {
    new_lead: { bg: '#1976d2', text: '#fff' },
    contacted: { bg: '#7b1fa2', text: '#fff' },
    engaged: { bg: '#e65100', text: '#fff' },
    meeting_set: { bg: '#f57c00', text: '#fff' },
    proposal_sent: { bg: '#512da8', text: '#fff' },
    won: { bg: '#2e7d32', text: '#fff' },
    completed: { bg: '#455a64', text: '#fff' },
    lost: { bg: '#c62828', text: '#fff' },
  };

  const getStatusStyle = (status) => STATUS_STYLES[status] || { bg: '#9e9e9e', text: '#fff' };

  const getStatusLabel = (status) => {
    return ALL_STATUSES[status] || status;
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

  const backPath = isLead ? '/admin/leads' : '/admin/customers';

  return (
    <Box sx={{ width: '100%', p: { xs: 1.5, md: 0 } }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
        onClick={() => navigate(backPath)}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        חזור ל{isLead ? 'לידים' : 'לקוחות'}
      </Button>
      {/* Header Card */}
      <Card sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
                </Box>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {client.businessInfo?.businessName || 'ללא שם עסק'}
                </Typography>

                {me?.role === 'super_admin' ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    עובד: {client?.metadata?.assignedTo?.username || client?.metadata?.createdBy?.username || '—'}
                  </Typography>
                ) : null}

                {isLead && canAssignLead ? (
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderRadius: 3 }}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>
                      שיוך ליד לעובד
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>עובד</InputLabel>
                        <Select label="עובד" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                          <MenuItem value="">לא משויך</MenuItem>
                          {employeeUsers.map((u) => (
                            <MenuItem key={u._id} value={String(u._id)}>
                              {u.username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={async () => {
                          await updateClientMutation.mutateAsync({ id, data: { assignedTo: assignedTo || null } });
                        }}
                      >
                        שמור שיוך
                      </Button>
                    </Stack>
                  </Paper>
                ) : null}

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
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={client.status || 'new_lead'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      variant="standard"
                      disableUnderline
                      renderValue={(val) => (
                        <Chip
                          label={getStatusLabel(val)}
                          size="small"
                          sx={{ cursor: 'pointer', bgcolor: getStatusStyle(val).bg, color: getStatusStyle(val).text }}
                        />
                      )}
                    >
                      {Object.entries(ALL_STATUSES).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          <Chip
                            label={label}
                            size="small"
                            sx={{ cursor: 'pointer', bgcolor: getStatusStyle(key).bg, color: getStatusStyle(key).text }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
          <Tab label="אינטראקציות" value="interactions" />
          <Tab label="פרויקטים" value="projects" />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 'personal' && <PersonalInfoTab client={client} />}
          {activeTab === 'business' && <BusinessInfoTab client={client} />}
          {activeTab === 'interactions' && <InteractionsTab clientId={id} />}
          {activeTab === 'projects' && <ProjectsTab clientId={id} />}
        </Box>
      </Card>

      <ConvertLeadDialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        onConfirm={handleConvertConfirm}
        clientName={client.personalInfo?.fullName}
        isPending={convertLeadMutation.isPending}
      />
    </Box>
  );
}

// wrapper - טוען נתונים ועושה early returns; התוכן ב-ClientCardContent (Rules of Hooks)
const ClientCard = () => {
  const { id } = useParams();
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
  return <ClientCardContent client={client} id={id} />;
};

export default ClientCard;



