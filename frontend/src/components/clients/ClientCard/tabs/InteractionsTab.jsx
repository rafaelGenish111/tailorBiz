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
  Edit as EditIcon
} from '@mui/icons-material';
import { useClientInteractions, useAddInteraction } from '../../../../admin/hooks/useClients';

const InteractionsTab = ({ clientId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    content: '',
    nextFollowUp: ''
  });

  const { data: response, isLoading } = useClientInteractions(clientId);
  const addInteraction = useAddInteraction();

  const interactions = response?.data || [];

  const handleAddInteraction = async () => {
    await addInteraction.mutateAsync({
      clientId,
      data: newInteraction
    });
    setOpenDialog(false);
    setNewInteraction({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      nextFollowUp: ''
    });
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
                    {interaction.createdBy && (
                      <Typography variant="caption" color="text.secondary">
                        {typeof interaction.createdBy === 'object' ? interaction.createdBy.name : interaction.createdBy}
                      </Typography>
                    )}
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
                        Follow-up: {new Date(interaction.nextFollowUp).toLocaleDateString('he-IL')}
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
              <InputLabel>סוג</InputLabel>
              <Select
                value={newInteraction.type}
                onChange={(e) =>
                  setNewInteraction({ ...newInteraction, type: e.target.value })
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

            <TextField
              label="Follow-up הבא"
              type="date"
              value={newInteraction.nextFollowUp}
              onChange={(e) =>
                setNewInteraction({ ...newInteraction, nextFollowUp: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
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
    </Box>
  );
};

export default InteractionsTab;

