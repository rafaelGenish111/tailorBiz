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
import { Close as CloseIcon, Phone as PhoneIcon, Email as EmailIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  useUpdateClient,
  useClientInteractions,
  useAddInteraction,
  useUpdateInteraction,
  useDeleteInteraction,
} from '../../../hooks/useClients';
import AssessmentTab from '../../../../components/clients/ClientCard/tabs/AssessmentTab';

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

  const updateClient = useUpdateClient();
  const addInteraction = useAddInteraction();
  const updateInteraction = useUpdateInteraction();
  const deleteInteraction = useDeleteInteraction();

  useEffect(() => {
    if (client) {
      setPersonalForm({
        fullName: client.personalInfo?.fullName || '',
        phone: client.personalInfo?.phone || '',
        email: client.personalInfo?.email || '',
        whatsappPhone: client.personalInfo?.whatsappPhone || '',
        preferredContactMethod: client.personalInfo?.preferredContactMethod || 'whatsapp',
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
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="פרטים אישיים" />
            <Tab label="מידע עסקי" />
            <Tab label="אינטראקציות" />
            <Tab label="משימות" />
            <Tab label="חשבוניות" />
            <Tab label="אפיון מוצר" />
            <Tab label="הצעת מחיר" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
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

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>מידע עסקי</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">שם העסק</Typography>
                    <Typography variant="body1">{client.businessInfo?.businessName || '-'}</Typography>
                  </Grid>
                  {client.businessInfo?.industry && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">תחום עיסוק</Typography>
                      <Typography variant="body1">{client.businessInfo.industry}</Typography>
                    </Grid>
                  )}
                  {client.businessInfo?.website && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">אתר אינטרנט</Typography>
                      <Typography variant="body1">
                        <a href={client.businessInfo.website} target="_blank" rel="noopener noreferrer">
                          {client.businessInfo.website}
                        </a>
                      </Typography>
                    </Grid>
                  )}
                  {client.businessInfo?.numberOfEmployees && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">מספר עובדים</Typography>
                      <Typography variant="body1">{client.businessInfo.numberOfEmployees}</Typography>
                    </Grid>
                  )}
                  {client.businessInfo?.annualRevenue && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">הכנסה שנתית</Typography>
                      <Typography variant="body1">{client.businessInfo.annualRevenue}</Typography>
                    </Grid>
                  )}
                  {client.businessInfo?.description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">תיאור העסק</Typography>
                      <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {client.businessInfo.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
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

        {tabValue === 3 && (
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

        {tabValue === 4 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              חשבוניות
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {client.invoices && client.invoices.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {client.invoices.map((invoice, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {typeof invoice === 'object' ? invoice.invoiceNumber : invoice}
                      </Typography>
                      {typeof invoice === 'object' && invoice.status && (
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={invoice.status === 'paid' ? 'success' : 'default'}
                        />
                      )}
                    </Box>
                    {typeof invoice === 'object' && invoice.totalAmount && (
                      <Typography variant="body2" color="text.secondary">
                        סכום: ₪{invoice.totalAmount.toLocaleString()}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                אין חשבוניות
              </Typography>
            )}
          </Paper>
        )}

        {tabValue === 5 && <AssessmentTab client={client} />}

        {tabValue === 6 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">הצעת מחיר</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="סכום הצעת מחיר"
                  type="number"
                  fullWidth
                  size="small"
                  value={proposalForm.initialPrice}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, initialPrice: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="סכום נסגר בפועל"
                  type="number"
                  fullWidth
                  size="small"
                  value={proposalForm.finalPrice}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, finalPrice: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="מטבע"
                  fullWidth
                  size="small"
                  value={proposalForm.currency}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, currency: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="תנאי תשלום"
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={proposalForm.paymentTerms}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, paymentTerms: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="הערות / תנאי חוזה"
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={proposalForm.contractNotes}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, contractNotes: e.target.value }))
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleProposalSave}>
                שמור הצעה
              </Button>
            </Box>
          </Box>
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
    </Dialog>
  );
}

export default ClientDetail;

