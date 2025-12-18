// frontend/src/components/clients/ClientCard/tabs/InteractionsTab.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Event as MeetingIcon,
  Note as NoteIcon,
  Task as TaskIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useClientInteractions, useAddInteraction, useUpdateInteraction, useDeleteInteraction, useClient } from '../../../../admin/hooks/useClients';

const InteractionsTab = ({ clientId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    content: '',
    nextFollowUp: null,
    businessType: 'followup'
  });

  const { data: response, isLoading } = useClientInteractions(clientId);
  const { data: clientData } = useClient(clientId);
  const client = clientData?.data;

  const addInteraction = useAddInteraction();
  const updateInteraction = useUpdateInteraction();
  const deleteInteraction = useDeleteInteraction();

  const interactions = response?.data || [];
  const isLead = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'].includes(client?.status);

  const handleAddInteraction = async () => {
    let defaultSubject = '';
    switch (newInteraction.businessType) {
      case 'followup': defaultSubject = 'מעקב'; break;
      case 'deal_closing': defaultSubject = 'שיחת סגירה'; break;
      case 'proposal': defaultSubject = 'הצעת מחיר'; break;
      case 'pause': defaultSubject = 'הפסקת תהליך'; break;
      case 'end_contract': defaultSubject = 'סיום התקשרות'; break;
      case 'project_update': defaultSubject = 'עדכון פרויקט'; break;
      case 'support': defaultSubject = 'תמיכה'; break;
      case 'invoice': defaultSubject = 'חשבונית/תשלום'; break;
      default: defaultSubject = '';
    }

    const subject = newInteraction.subject || defaultSubject;

    await addInteraction.mutateAsync({
      clientId,
      data: {
        ...newInteraction,
        subject,
        nextFollowUp: newInteraction.nextFollowUp?.toISOString() || null
      }
    });
    setOpenDialog(false);
    setNewInteraction({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      nextFollowUp: null,
      businessType: 'followup'
    });
  };

  const handleEditClick = (interaction) => {
    // המרת nextFollowUp ל-Date object
    let nextFollowUpDate = null;
    if (interaction.nextFollowUp) {
      nextFollowUpDate = new Date(interaction.nextFollowUp);
    }

    setEditingInteraction({
      ...interaction,
      nextFollowUp: nextFollowUpDate
    });
    setEditDialog(true);
  };

  const handleUpdateInteraction = async () => {
    await updateInteraction.mutateAsync({
      clientId,
      interactionId: editingInteraction._id,
      data: {
        ...editingInteraction,
        nextFollowUp: editingInteraction.nextFollowUp?.toISOString() || null
      }
    });
    setEditDialog(false);
    setEditingInteraction(null);
  };

  const handleDeleteClick = (interaction) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את האינטראקציה הזו?')) {
      deleteInteraction.mutate({
        clientId,
        interactionId: interaction._id
      });
    }
  };

  const getInteractionIcon = (type) => {
    const icons = {
      call: <PhoneIcon />,
      email: <EmailIcon />,
      whatsapp: <WhatsAppIcon />,
      meeting: <MeetingIcon />,
      note: <NoteIcon />,
      task: <TaskIcon />
    };
    return icons[type] || <NoteIcon />;
  };

  const getInteractionColor = (type) => {
    const colors = {
      call: 'primary',
      email: 'info',
      whatsapp: 'success',
      meeting: 'warning',
      note: 'default',
      task: 'secondary'
    };
    return colors[type] || 'default';
  };

  const getTypeLabel = (type) => {
    const labels = {
      call: 'שיחה',
      email: 'אימייל',
      whatsapp: 'WhatsApp',
      meeting: 'פגישה',
      note: 'הערה',
      task: 'משימה'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <Typography>טוען...</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">היסטוריית אינטראקציות</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          אינטראקציה חדשה
        </Button>
      </Box>

      {/* Timeline */}
      {interactions.length > 0 ? (
        <Timeline position="right">
          {interactions.map((interaction, index) => (
            <TimelineItem key={interaction._id}>
              <TimelineOppositeContent color="text.secondary">
                {new Date(interaction.timestamp || interaction.date).toLocaleDateString('he-IL')}
                <br />
                {new Date(interaction.timestamp || interaction.date).toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getInteractionColor(interaction.type)}>
                  {getInteractionIcon(interaction.type)}
                </TimelineDot>
                {index < interactions.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={getTypeLabel(interaction.type)}
                        size="small"
                        color={getInteractionColor(interaction.type)}
                      />
                      <Chip
                        label={interaction.direction === 'inbound' ? 'נכנס' : 'יוצא'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {interaction.createdBy && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof interaction.createdBy === 'object' ? interaction.createdBy.name : interaction.createdBy}
                        </Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(interaction)}
                        sx={{ ml: 1 }}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(interaction)}
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
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="caption" fontWeight="bold">
                        Follow-up: {new Date(interaction.nextFollowUp).toLocaleDateString('he-IL')} {new Date(interaction.nextFollowUp).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            אין אינטראקציות עדיין
          </Typography>
        </Box>
      )}

      {/* Add Interaction Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>אינטראקציה חדשה</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>ערוץ</InputLabel>
                <Select
                  value={newInteraction.type}
                  onChange={(e) =>
                    setNewInteraction({ ...newInteraction, type: e.target.value })
                  }
                  label="ערוץ"
                >
                  <MenuItem value="call">שיחה</MenuItem>
                  <MenuItem value="email">אימייל</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="meeting">פגישה</MenuItem>
                  <MenuItem value="note">הערה</MenuItem>
                  <MenuItem value="task">משימה</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>סוג אינטראקציה</InputLabel>
                <Select
                  value={newInteraction.businessType}
                  onChange={(e) =>
                    setNewInteraction({ ...newInteraction, businessType: e.target.value })
                  }
                  label="סוג אינטראקציה"
                >
                  <MenuItem value="followup">מעקב</MenuItem>
                  {isLead ? [
                    <MenuItem key="proposal" value="proposal">הצעת מחיר</MenuItem>,
                    <MenuItem key="deal_closing" value="deal_closing">שיחת סגירה</MenuItem>
                  ] : [
                    <MenuItem key="project_update" value="project_update">עדכון פרויקט</MenuItem>,
                    <MenuItem key="support" value="support">תמיכה</MenuItem>,
                    <MenuItem key="invoice" value="invoice">חשבונית/תשלום</MenuItem>,
                    <MenuItem key="end_contract" value="end_contract">סיום התקשרות</MenuItem>
                  ]}
                  <MenuItem value="pause">הפסקה</MenuItem>
                  <MenuItem value="other">אחר</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>כיוון</InputLabel>
                <Select
                  value={newInteraction.direction}
                  onChange={(e) =>
                    setNewInteraction({ ...newInteraction, direction: e.target.value })
                  }
                  label="כיוון"
                >
                  <MenuItem value="outbound">יוצא</MenuItem>
                  <MenuItem value="inbound">נכנס</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="נושא"
                value={newInteraction.subject}
                onChange={(e) =>
                  setNewInteraction({ ...newInteraction, subject: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="תוכן"
                value={newInteraction.content}
                onChange={(e) =>
                  setNewInteraction({ ...newInteraction, content: e.target.value })
                }
                multiline
                rows={4}
                fullWidth
                required
              />

              <DateTimePicker
                label="Follow-up הבא (תאריך ושעה)"
                value={newInteraction.nextFollowUp}
                onChange={(newValue) =>
                  setNewInteraction({ ...newInteraction, nextFollowUp: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
            <Button
              variant="contained"
              onClick={handleAddInteraction}
              disabled={!newInteraction.content}
            >
              הוסף
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Edit Interaction Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <Dialog
          open={editDialog}
          onClose={() => {
            setEditDialog(false);
            setEditingInteraction(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>ערוך אינטראקציה</DialogTitle>
          <DialogContent>
            {editingInteraction && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <FormControl fullWidth>
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

                <FormControl fullWidth>
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
                  value={editingInteraction.subject || ''}
                  onChange={(e) =>
                    setEditingInteraction({ ...editingInteraction, subject: e.target.value })
                  }
                  fullWidth
                />

                <TextField
                  label="תוכן"
                  value={editingInteraction.content || editingInteraction.notes || ''}
                  onChange={(e) =>
                    setEditingInteraction({ ...editingInteraction, content: e.target.value })
                  }
                  multiline
                  rows={4}
                  fullWidth
                  required
                />

                <DateTimePicker
                  label="Follow-up הבא (תאריך ושעה)"
                  value={editingInteraction.nextFollowUp}
                  onChange={(newValue) =>
                    setEditingInteraction({ ...editingInteraction, nextFollowUp: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialog(false);
              setEditingInteraction(null);
            }}>
              ביטול
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateInteraction}
              disabled={!editingInteraction?.content && !editingInteraction?.notes}
            >
              שמור שינויים
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default InteractionsTab;

