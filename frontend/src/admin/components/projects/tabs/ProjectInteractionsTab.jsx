import React, { useState } from 'react';
import {
  Box, Button, Card, Typography, TextField, MenuItem, Select,
  FormControl, InputLabel, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, Alert,
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent,
} from '@mui/lab';
import {
  Add as AddIcon, Phone as PhoneIcon, Email as EmailIcon,
  WhatsApp as WhatsAppIcon, Event as MeetingIcon, Note as NoteIcon,
  Edit as EditIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';
import { toast } from 'react-toastify';

const TYPE_ICONS = {
  call: <PhoneIcon />, email: <EmailIcon />, whatsapp: <WhatsAppIcon />,
  meeting: <MeetingIcon />, other: <NoteIcon />,
};
const TYPE_COLORS = {
  call: 'primary', email: 'info', whatsapp: 'success', meeting: 'warning', other: 'default',
};
const TYPE_LABELS = {
  call: 'שיחה', email: 'אימייל', whatsapp: 'WhatsApp', meeting: 'פגישה', other: 'אחר',
};

const emptyForm = { type: 'call', direction: 'outbound', subject: '', notes: '' };

const ProjectInteractionsTab = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['projectInteractions', projectId],
    queryFn: () => projectsAPI.getInteractions(projectId).then((r) => r.data),
  });

  const interactions = res?.data || [];

  const addMutation = useMutation({
    mutationFn: (data) => projectsAPI.addInteraction(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectInteractions', projectId]);
      queryClient.invalidateQueries(['project', projectId]);
      setAddOpen(false);
      setForm(emptyForm);
      toast.success('אינטראקציה נוספה');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'שגיאה'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.updateInteraction(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectInteractions', projectId]);
      setEditOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast.success('עודכן');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'שגיאה'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectsAPI.deleteInteraction(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectInteractions', projectId]);
      toast.success('נמחק');
    },
  });

  const handleAdd = () => addMutation.mutate(form);
  const handleUpdate = () => updateMutation.mutate({ id: editId, data: form });
  const handleDelete = (id) => {
    if (window.confirm('למחוק אינטראקציה?')) deleteMutation.mutate(id);
  };

  const openEdit = (i) => {
    setForm({ type: i.type, direction: i.direction, subject: i.subject || '', notes: i.notes || '' });
    setEditId(i._id);
    setEditOpen(true);
  };

  if (isLoading) return <CircularProgress />;

  const renderDialog = (open, onClose, title, onSave, isPending) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>סוג</InputLabel>
            <Select value={form.type} label="סוג" onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>כיוון</InputLabel>
            <Select value={form.direction} label="כיוון" onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <MenuItem value="outbound">יוצא</MenuItem>
              <MenuItem value="inbound">נכנס</MenuItem>
            </Select>
          </FormControl>
          <TextField label="נושא" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} fullWidth />
          <TextField label="הערות" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline rows={3} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button variant="contained" onClick={onSave} disabled={isPending}>שמור</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">אינטראקציות פרויקט</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
          חדש
        </Button>
      </Box>

      {interactions.length === 0 ? (
        <Alert severity="info">אין אינטראקציות</Alert>
      ) : (
        <Timeline position="right">
          {interactions.map((i, idx) => (
            <TimelineItem key={i._id}>
              <TimelineOppositeContent color="text.secondary">
                {new Date(i.date).toLocaleDateString('he-IL')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={TYPE_COLORS[i.type] || 'default'}>
                  {TYPE_ICONS[i.type] || <NoteIcon />}
                </TimelineDot>
                {idx < interactions.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={TYPE_LABELS[i.type] || i.type} size="small" color={TYPE_COLORS[i.type] || 'default'} />
                      <Chip label={i.direction === 'inbound' ? 'נכנס' : 'יוצא'} size="small" variant="outlined" />
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(i)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(i._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                  {i.subject && <Typography variant="subtitle2">{i.subject}</Typography>}
                  <Typography variant="body2" color="text.secondary">{i.notes || '-'}</Typography>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}

      {renderDialog(addOpen, () => setAddOpen(false), 'אינטראקציה חדשה', handleAdd, addMutation.isPending)}
      {renderDialog(editOpen, () => { setEditOpen(false); setEditId(null); }, 'עריכת אינטראקציה', handleUpdate, updateMutation.isPending)}
    </Box>
  );
};

export default ProjectInteractionsTab;
