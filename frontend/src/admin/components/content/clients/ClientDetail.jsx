import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Folder as FolderIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  useUpdateClient,
  useClientInteractions,
  useAddInteraction,
  useUpdateInteraction,
  useDeleteInteraction,
  useClientNurturingInstances,
  useConvertLead
} from '../../../hooks/useClients';
import AssessmentTab from '../../../../components/clients/ClientCard/tabs/AssessmentTab';
import ContractTab from '../../../../components/clients/ClientCard/tabs/ContractTab';
import SmartSequenceProgress from '../../../../components/clients/SmartSequenceProgress';
import ClientTimer from '../../../../components/timer/ClientTimer';
import TimeEntriesTab from '../../../../components/timer/TimeEntriesTab';
import DocumentsTab from '../../../../components/documents/DocumentsTab';
import QuotesTab from '../../../../components/quotes/QuotesTab';

const STATUS_LABELS = {
  lead: { label: 'ליד חדש', color: 'info' },
  contacted: { label: 'יצרנו קשר', color: 'primary' },
  assessment_scheduled: { label: 'פגישת אפיון נקבעה', color: 'warning' },
  assessment_completed: { label: 'אפיון הושלם', color: 'info' },
  proposal_sent: { label: 'הצעת מחיר נשלחה', color: 'warning' },
  negotiation: { label: 'משא ומתן', color: 'warning' },
  won: { label: 'נסגר', color: 'success' },
  lost: { label: 'הפסדנו', color: 'error' },
  on_hold: { label: 'בהמתנה', color: 'default' },
  active_client: { label: 'לקוח פעיל', color: 'success' },
  in_development: { label: 'בפיתוח', color: 'info' },
  completed: { label: 'הושלם', color: 'success' },
  churned: { label: 'עזב', color: 'error' },
};

const LEAD_SOURCE_LABELS = {
  whatsapp: 'WhatsApp',
  website_form: 'טופס באתר',
  referral: 'המלצה',
  cold_call: 'פנייה יזומה',
  social_media: 'רשתות חברתיות',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  other: 'אחר',
};

function ClientDetail({ open, onClose, client }) {
  const [tabValue, setTabValue] = useState(0);
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    whatsappPhone: '',
    preferredContactMethod: 'whatsapp',
  });
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessType: '',
    industry: '',
    website: '',
    address: '',
    numberOfEmployees: '',
    description: '',
    yearsInBusiness: '',
    revenueRange: '',
  });
  const [statusForm, setStatusForm] = useState({
    status: '',
    leadSource: '',
    leadScore: 0,
  });
  const [tagsInput, setTagsInput] = useState('');

  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [editInteractionDialogOpen, setEditInteractionDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    content: '',
    nextFollowUp: '',
    businessType: 'followup',
  });

  const [proposalForm, setProposalForm] = useState({
    initialPrice: '',
    finalPrice: '',
    currency: 'ILS',
    paymentTerms: '',
    contractNotes: '',
  });

  const clientId = client?._id;
  const { data: interactionsResponse, isLoading: interactionsLoading } =
    useClientInteractions(clientId);
  const interactions = interactionsResponse?.data || client?.interactions || [];

  const { data: nurturingInstancesResponse } = useClientNurturingInstances(clientId);
  const nurturingInstances = nurturingInstancesResponse?.data || [];

  const updateClient = useUpdateClient();
  const addInteraction = useAddInteraction();
  const updateInteraction = useUpdateInteraction();
  const deleteInteraction = useDeleteInteraction();
  const convertLead = useConvertLead();

  const [closeDealOpen, setCloseDealOpen] = useState(false);
  const [dealData, setDealData] = useState({ finalPrice: '', notes: '', file: null });

  useEffect(() => {
    if (client) {
      setPersonalForm({
        fullName: client.personalInfo?.fullName || '',
        phone: client.personalInfo?.phone || '',
        email: client.personalInfo?.email || '',
        whatsappPhone: client.personalInfo?.whatsappPhone || '',
        preferredContactMethod: client.personalInfo?.preferredContactMethod || 'whatsapp',
      });
      setBusinessForm({
        businessName: client.businessInfo?.businessName || '',
        businessType: client.businessInfo?.businessType || '',
        industry: client.businessInfo?.industry || '',
        website: client.businessInfo?.website || '',
        address: client.businessInfo?.address || '',
        numberOfEmployees:
          client.businessInfo?.numberOfEmployees !== undefined &&
          client.businessInfo?.numberOfEmployees !== null
            ? String(client.businessInfo.numberOfEmployees)
            : '',
        description:
          client.businessInfo?.description ||
          client.assessmentForm?.basicInfo?.businessDescription ||
          '',
        yearsInBusiness:
          client.businessInfo?.yearsInBusiness !== undefined &&
          client.businessInfo?.yearsInBusiness !== null
            ? String(client.businessInfo.yearsInBusiness)
            : '',
        revenueRange: client.businessInfo?.revenueRange || '',
      });
      setStatusForm({
        status: client.status || '',
        leadSource: client.leadSource || '',
        leadScore: client.leadScore || 0,
      });
      setTagsInput((client.tags || []).join(', '));
      setProposalForm({
        initialPrice: client.proposal?.initialPrice ?? '',
        finalPrice: client.proposal?.finalPrice ?? '',
        currency: client.proposal?.currency || 'ILS',
        paymentTerms: client.proposal?.paymentTerms || '',
        contractNotes: client.proposal?.contractNotes || '',
      });
    }
  }, [client]);

  if (!client) return null;

  const initials = client.personalInfo?.fullName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const status = STATUS_LABELS[client.status] || { label: client.status, color: 'default' };

  const handleSavePersonal = async () => {
    const tags =
      tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean) || [];

    await updateClient.mutateAsync({
      id: client._id,
      data: {
        personalInfo: personalForm,
        status: statusForm.status,
        leadSource: statusForm.leadSource,
        leadScore: statusForm.leadScore,
        tags,
      },
    });
  };

  const handleSaveBusiness = async () => {
    await updateClient.mutateAsync({
      id: client._id,
      data: {
        businessInfo: {
          ...client.businessInfo,
          businessName: businessForm.businessName,
          businessType: businessForm.businessType || undefined,
          industry: businessForm.industry || undefined,
          website: businessForm.website || undefined,
          address: businessForm.address || undefined,
          numberOfEmployees: businessForm.numberOfEmployees
            ? Number(businessForm.numberOfEmployees)
            : undefined,
          description: businessForm.description || undefined,
          yearsInBusiness: businessForm.yearsInBusiness
            ? Number(businessForm.yearsInBusiness)
            : undefined,
          revenueRange: businessForm.revenueRange || undefined,
        },
      },
    });
  };

  const handleProposalSave = async () => {
    await updateClient.mutateAsync({
      id: client._id,
      data: {
        proposal: {
          ...proposalForm,
          initialPrice: proposalForm.initialPrice
            ? Number(proposalForm.initialPrice)
            : undefined,
          finalPrice: proposalForm.finalPrice ? Number(proposalForm.finalPrice) : undefined,
        },
      },
    });
  };

  const handleAddInteraction = async () => {
    if (!clientId || !newInteraction.content) return;

    const subject =
      newInteraction.subject ||
      (newInteraction.businessType === 'followup'
        ? 'מעקב'
        : newInteraction.businessType === 'deal_closing'
        ? 'שיחת סגירה'
        : newInteraction.businessType === 'proposal'
        ? 'הצעת מחיר'
        : newInteraction.businessType === 'pause'
        ? 'הפסקת תהליך'
        : newInteraction.businessType === 'end_contract'
        ? 'סיום התקשרות'
        : '');

    await addInteraction.mutateAsync({
      clientId,
      data: {
        ...newInteraction,
        subject,
      },
    });

    setInteractionDialogOpen(false);
    setNewInteraction({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      nextFollowUp: '',
      businessType: 'followup',
    });
  };

  const handleConvertLead = async () => {
    const formData = new FormData();
    if (dealData.finalPrice) formData.append('finalPrice', dealData.finalPrice);
    if (dealData.notes) formData.append('notes', dealData.notes);
    if (dealData.file) formData.append('contract', dealData.file);
    
    await convertLead.mutateAsync({ clientId: client._id, data: formData });
    setCloseDealOpen(false);
  };

  const isLead = ['lead', 'contacted', 'assessment_scheduled', 'assessment_completed', 'proposal_sent', 'negotiation'].includes(client.status);

  const tabsConfig = isLead
    ? [
        { key: 'personal', label: 'פרטים אישיים' },
        { key: 'business', label: 'מידע עסקי' },
        { key: 'interactions', label: 'אינטראקציות' },
        { key: 'quotes', label: 'הצעות מחיר', icon: <ReceiptIcon />, iconPosition: 'start' },
        { key: 'documents', label: 'מסמכים', icon: <FolderIcon />, iconPosition: 'start' },
        { key: 'assessment', label: 'אפיון מוצר' },
        { key: 'contract', label: 'חוזה' },
      ]
    : [
        { key: 'personal', label: 'פרטים אישיים' },
        { key: 'business', label: 'מידע עסקי' },
        { key: 'interactions', label: 'אינטראקציות' },
        { key: 'quotes', label: 'הצעות מחיר', icon: <ReceiptIcon />, iconPosition: 'start' },
        { key: 'documents', label: 'מסמכים', icon: <FolderIcon />, iconPosition: 'start' },
        { key: 'assessment', label: 'אפיון מוצר' },
        { key: 'contract', label: 'חוזה' },
        { key: 'time', label: 'זמנים', icon: <TimerIcon />, iconPosition: 'start' },
        { key: 'tasks', label: 'משימות' },
      ];

  const currentTabKey = tabsConfig[tabValue]?.key || 'personal';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {client.personalInfo?.fullName || 'ללא שם'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {client.businessInfo?.businessName || 'ללא שם עסק'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLead && (
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => {
                   setDealData({ 
                     finalPrice: client.proposal?.finalPrice || client.proposal?.initialPrice || '', 
                     notes: '', 
                     file: null 
                   });
                   setCloseDealOpen(true);
                }}
              >
                סגור עסקה
              </Button>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Timer */}
        <Box sx={{ mb: 3 }}>
          <ClientTimer
            clientId={client._id}
            clientName={client.personalInfo?.fullName || client.businessInfo?.businessName}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabsConfig.map((tab) => (
              <Tab
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition={tab.iconPosition}
              />
            ))}
          </Tabs>
        </Box>

        {/* סטטוס רצפי טיפוח פעילים */}
        {nurturingInstances.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              רצפי טיפוח פעילים
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nurturingInstances.map((instance) => (
                <SmartSequenceProgress key={instance._id} instance={instance} />
              ))}
            </Box>
          </Box>
        )}

        {currentTabKey === 'personal' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">פרטים אישיים</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="שם מלא"
                  fullWidth
                  size="small"
                  value={personalForm.fullName}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="טלפון"
                  fullWidth
                  size="small"
                  value={personalForm.phone}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="אימייל"
                  fullWidth
                  size="small"
                  value={personalForm.email}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="טלפון WhatsApp"
                  fullWidth
                  size="small"
                  value={personalForm.whatsappPhone}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({ ...prev, whatsappPhone: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>שיטת קשר מועדפת</InputLabel>
                  <Select
                    value={personalForm.preferredContactMethod}
                    label="שיטת קשר מועדפת"
                    onChange={(e) =>
                      setPersonalForm((prev) => ({
                        ...prev,
                        preferredContactMethod: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="phone">טלפון</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    <MenuItem value="email">אימייל</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">סטטוס ומידע כללי</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>סטטוס</InputLabel>
                  <Select
                    value={statusForm.status}
                    label="סטטוס"
                    onChange={(e) =>
                      setStatusForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>מקור ליד</InputLabel>
                  <Select
                    value={statusForm.leadSource}
                    label="מקור ליד"
                    onChange={(e) =>
                      setStatusForm((prev) => ({ ...prev, leadSource: e.target.value }))
                    }
                  >
                    {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="ציון ליד"
                  type="number"
                  fullWidth
                  size="small"
                  value={statusForm.leadScore}
                  onChange={(e) =>
                    setStatusForm((prev) => ({
                      ...prev,
                      leadScore: Number(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="תגיות (מופרדות בפסיק)"
                  fullWidth
                  size="small"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </Grid>
              {client.metadata?.createdAt && (
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    תאריך יצירה
                  </Typography>
                  <Typography variant="body1">
                    {new Date(client.metadata.createdAt).toLocaleDateString('he-IL')}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleSavePersonal}>
                שמור פרטים
              </Button>
            </Box>
          </Box>
        )}

        {currentTabKey === 'business' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">מידע עסקי</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="שם העסק"
                  fullWidth
                  size="small"
                  value={businessForm.businessName}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, businessName: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="תחום פעילות / נישה"
                  fullWidth
                  size="small"
                  value={businessForm.industry}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, industry: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="סוג עסק"
                  fullWidth
                  size="small"
                  value={businessForm.businessType}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, businessType: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="וותק העסק (שנים)"
                  type="number"
                  fullWidth
                  size="small"
                  value={businessForm.yearsInBusiness}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, yearsInBusiness: e.target.value }))
                  }
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="מספר עובדים"
                  type="number"
                  fullWidth
                  size="small"
                  value={businessForm.numberOfEmployees}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      numberOfEmployees: e.target.value,
                    }))
                  }
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="טווח מחזור חודשי משוער"
                  fullWidth
                  size="small"
                  placeholder="לדוגמה: 0-50K, 50-100K..."
                  value={businessForm.revenueRange}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, revenueRange: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="אתר / דומיין"
                  fullWidth
                  size="small"
                  value={businessForm.website}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, website: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="כתובת העסק"
                  fullWidth
                  size="small"
                  value={businessForm.address}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="תיאור העסק / מה העסק עושה"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={businessForm.description}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleSaveBusiness}>
                שמור מידע עסקי
              </Button>
            </Box>
          </Box>
        )}

        {currentTabKey === 'interactions' && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">אינטראקציות</Typography>
              <Button variant="contained" onClick={() => setInteractionDialogOpen(true)}>
                אינטראקציה חדשה
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {interactionsLoading ? (
              <Typography variant="body2">טוען...</Typography>
            ) : interactions && interactions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {interactions.map((interaction, index) => (
                  <Paper key={interaction._id || index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{interaction.type}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {interaction.date &&
                            new Date(interaction.date).toLocaleDateString('he-IL')}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // המרת nextFollowUp לתאריך בפורמט datetime-local
                            let nextFollowUpFormatted = '';
                            if (interaction.nextFollowUp) {
                              const date = new Date(interaction.nextFollowUp);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              nextFollowUpFormatted = `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                            setEditingInteraction({
                              ...interaction,
                              nextFollowUp: nextFollowUpFormatted
                            });
                            setEditInteractionDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm('האם אתה בטוח שברצונך למחוק את האינטראקציה הזו?')) {
                              deleteInteraction.mutate({
                                clientId,
                                interactionId: interaction._id
                              });
                            }
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {interaction.subject && (
                      <Typography variant="subtitle2" gutterBottom>
                        {interaction.subject}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {interaction.content || interaction.notes || '-'}
                    </Typography>
                    {interaction.nextFollowUp && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`Follow-up: ${new Date(
                            interaction.nextFollowUp
                          ).toLocaleDateString('he-IL')} ${new Date(
                            interaction.nextFollowUp
                          ).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                אין אינטראקציות
              </Typography>
            )}
          </Paper>
        )}

        {currentTabKey === 'tasks' && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>משימות</Typography>
            <Divider sx={{ mb: 2 }} />
            {client.tasks && client.tasks.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {client.tasks.map((task, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Chip 
                        label={task.status} 
                        size="small" 
                        color={task.status === 'completed' ? 'success' : 'default'}
                      />
                    </Box>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                    )}
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        תאריך יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                אין משימות
              </Typography>
            )}
          </Paper>
        )}

        {currentTabKey === 'assessment' && <AssessmentTab client={client} />}

        {currentTabKey === 'quotes' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <QuotesTab clientId={clientId} clientName={client.personalInfo?.fullName} />
          </Box>
        )}

        {currentTabKey === 'time' && <TimeEntriesTab clientId={clientId} />}

        {currentTabKey === 'documents' && <DocumentsTab clientId={clientId} />}

        {currentTabKey === 'contract' && (
          <ContractTab clientId={clientId} contract={client.contract} />
        )}
      </DialogContent>

      {/* Add Interaction Dialog */}
      <Dialog
        open={interactionDialogOpen}
        onClose={() => setInteractionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>אינטראקציה חדשה</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>ערוץ</InputLabel>
              <Select
                value={newInteraction.type}
                label="ערוץ"
                onChange={(e) =>
                  setNewInteraction((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <MenuItem value="call">שיחה</MenuItem>
                <MenuItem value="email">אימייל</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="meeting">פגישה</MenuItem>
                <MenuItem value="note">הערה</MenuItem>
                <MenuItem value="task">משימה</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>סוג אינטראקציה</InputLabel>
              <Select
                value={newInteraction.businessType}
                label="סוג אינטראקציה"
                onChange={(e) =>
                  setNewInteraction((prev) => ({ ...prev, businessType: e.target.value }))
                }
              >
                <MenuItem value="followup">מעקב</MenuItem>
                <MenuItem value="deal_closing">סגירת עסקה</MenuItem>
                <MenuItem value="proposal">הצעת מחיר</MenuItem>
                <MenuItem value="pause">הפסקה</MenuItem>
                <MenuItem value="end_contract">סיום התקשרות</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>כיוון</InputLabel>
              <Select
                value={newInteraction.direction}
                label="כיוון"
                onChange={(e) =>
                  setNewInteraction((prev) => ({ ...prev, direction: e.target.value }))
                }
              >
                <MenuItem value="outbound">יוצא</MenuItem>
                <MenuItem value="inbound">נכנס</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="נושא"
              fullWidth
              size="small"
              value={newInteraction.subject}
              onChange={(e) =>
                setNewInteraction((prev) => ({ ...prev, subject: e.target.value }))
              }
            />

            <TextField
              label="תוכן"
              fullWidth
              multiline
              rows={4}
              size="small"
              value={newInteraction.content}
              onChange={(e) =>
                setNewInteraction((prev) => ({ ...prev, content: e.target.value }))
              }
            />

            <TextField
              label="Follow-up הבא (תאריך ושעה)"
              type="datetime-local"
              fullWidth
              size="small"
              value={newInteraction.nextFollowUp}
              onChange={(e) =>
                setNewInteraction((prev) => ({ ...prev, nextFollowUp: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInteractionDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleAddInteraction}
            disabled={!newInteraction.content}
          >
            הוסף
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Interaction Dialog */}
      <Dialog
        open={editInteractionDialogOpen}
        onClose={() => {
          setEditInteractionDialogOpen(false);
          setEditingInteraction(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ערוך אינטראקציה</DialogTitle>
        <DialogContent>
          {editingInteraction && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>סוג</InputLabel>
                <Select
                  value={editingInteraction.type}
                  onChange={(e) =>
                    setEditingInteraction({ ...editingInteraction, type: e.target.value })
                  }
                  label="סוג"
                >
                  <MenuItem value="call">שיחה</MenuItem>
                  <MenuItem value="email">אימייל</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="meeting">פגישה</MenuItem>
                  <MenuItem value="note">הערה</MenuItem>
                  <MenuItem value="task">משימה</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>כיוון</InputLabel>
                <Select
                  value={editingInteraction.direction}
                  onChange={(e) =>
                    setEditingInteraction({ ...editingInteraction, direction: e.target.value })
                  }
                  label="כיוון"
                >
                  <MenuItem value="outbound">יוצא</MenuItem>
                  <MenuItem value="inbound">נכנס</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="נושא"
                fullWidth
                size="small"
                value={editingInteraction.subject || ''}
                onChange={(e) =>
                  setEditingInteraction({ ...editingInteraction, subject: e.target.value })
                }
              />

              <TextField
                label="תוכן"
                fullWidth
                multiline
                rows={4}
                size="small"
                value={editingInteraction.content || editingInteraction.notes || ''}
                onChange={(e) =>
                  setEditingInteraction({ ...editingInteraction, content: e.target.value })
                }
                required
              />

              <TextField
                label="Follow-up הבא (תאריך ושעה)"
                type="datetime-local"
                fullWidth
                size="small"
                value={editingInteraction.nextFollowUp || ''}
                onChange={(e) =>
                  setEditingInteraction({ ...editingInteraction, nextFollowUp: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditInteractionDialogOpen(false);
            setEditingInteraction(null);
          }}>
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await updateInteraction.mutateAsync({
                clientId,
                interactionId: editingInteraction._id,
                data: editingInteraction
              });
              setEditInteractionDialogOpen(false);
              setEditingInteraction(null);
            }}
            disabled={!editingInteraction?.content && !editingInteraction?.notes}
          >
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>

      <DialogActions>
        <Button onClick={onClose}>סגור</Button>
      </DialogActions>

      {/* Close Deal Dialog */}
      <Dialog
        open={closeDealOpen}
        onClose={() => setCloseDealOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🎉 סגירת עסקה</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Typography variant="body1">
                    מזל טוב! בוא נעדכן את פרטי העסקה והחוזה.
                </Typography>
                
                <TextField
                    label="סכום סגירה סופי"
                    type="number"
                    fullWidth
                    value={dealData.finalPrice}
                    onChange={(e) => setDealData({ ...dealData, finalPrice: e.target.value })}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₪</Typography>
                    }}
                />

                <TextField
                    label="הערות לחוזה / סגירה"
                    multiline
                    rows={3}
                    fullWidth
                    value={dealData.notes}
                    onChange={(e) => setDealData({ ...dealData, notes: e.target.value })}
                />

                <Button
                    variant="outlined"
                    component="label"
                    startIcon={dealData.file ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                >
                    {dealData.file ? dealData.file.name : 'העלה קובץ חוזה חתום (PDF/תמונה)'}
                    <input
                        type="file"
                        hidden
                        accept="application/pdf,image/*,.doc,.docx"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setDealData({ ...dealData, file: e.target.files[0] });
                            }
                        }}
                    />
                </Button>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setCloseDealOpen(false)}>ביטול</Button>
            <Button 
                variant="contained" 
                color="success" 
                onClick={handleConvertLead}
                disabled={!dealData.finalPrice}
            >
                אישור וסגירת עסקה
            </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default ClientDetail;

