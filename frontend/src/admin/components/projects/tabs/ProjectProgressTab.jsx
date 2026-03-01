import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';
import { toast } from 'react-toastify';

const ProjectProgressTab = ({ project, projectId }) => {
  const queryClient = useQueryClient();
  const progress = project?.progress || {};
  const milestones = progress.milestones || [];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '' });
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => projectsAPI.updateProgress(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setEditing(false);
      toast.success('ההתקדמות עודכנה');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'שגיאה'),
  });

  const openEdit = () => {
    setForm({
      percentComplete: progress.percentComplete || 0,
      currentPhase: progress.currentPhase || '',
      notes: progress.notes || '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      percentComplete: Number(form.percentComplete) || 0,
      currentPhase: form.currentPhase,
      notes: form.notes,
      milestones,
    });
  };

  const toggleMilestone = (idx) => {
    const updated = milestones.map((m, i) =>
      i === idx ? { ...m, completed: !m.completed, completedDate: !m.completed ? new Date() : null } : m
    );
    updateMutation.mutate({ ...progress, milestones: updated });
  };

  const addMilestone = () => {
    if (!milestoneForm.title.trim()) {
      toast.error('נא למלא שם');
      return;
    }
    const updated = [
      ...milestones,
      {
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate || null,
        completed: false,
      },
    ];
    updateMutation.mutate({ ...progress, milestones: updated });
    setAddMilestoneOpen(false);
    setMilestoneForm({ title: '', description: '', dueDate: '' });
  };

  const removeMilestone = (idx) => {
    const updated = milestones.filter((_, i) => i !== idx);
    updateMutation.mutate({ ...progress, milestones: updated });
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Progress bar */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">התקדמות כללית</Typography>
          <Button size="small" onClick={openEdit}>ערוך</Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress.percentComplete || 0}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {progress.percentComplete || 0}%
          </Typography>
        </Box>
        {progress.currentPhase && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            שלב נוכחי: {progress.currentPhase}
          </Typography>
        )}
        {progress.notes && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {progress.notes}
          </Typography>
        )}
      </Paper>

      {/* Milestones */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            אבני דרך ({completedCount}/{milestones.length})
          </Typography>
          <Button startIcon={<AddIcon />} onClick={() => setAddMilestoneOpen(true)}>
            הוסף אבן דרך
          </Button>
        </Box>

        {milestones.length === 0 ? (
          <Typography color="text.secondary">אין אבני דרך</Typography>
        ) : (
          <List>
            {milestones.map((m, idx) => (
              <ListItem key={idx} secondaryAction={
                <IconButton edge="end" size="small" color="error" onClick={() => removeMilestone(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }>
                <ListItemIcon>
                  <Checkbox
                    checked={m.completed || false}
                    onChange={() => toggleMilestone(idx)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={m.title}
                  secondary={[
                    m.description,
                    m.dueDate && `יעד: ${new Date(m.dueDate).toLocaleDateString('he-IL')}`,
                    m.completed && m.completedDate && `הושלם: ${new Date(m.completedDate).toLocaleDateString('he-IL')}`,
                  ].filter(Boolean).join(' • ')}
                  sx={{ textDecoration: m.completed ? 'line-through' : 'none' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Edit Progress Dialog */}
      <Dialog open={editing} onClose={() => setEditing(false)} maxWidth="sm" fullWidth>
        <DialogTitle>עריכת התקדמות</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="אחוז התקדמות"
              type="number"
              value={form.percentComplete}
              onChange={(e) => setForm({ ...form, percentComplete: e.target.value })}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="שלב נוכחי"
              value={form.currentPhase || ''}
              onChange={(e) => setForm({ ...form, currentPhase: e.target.value })}
              fullWidth
            />
            <TextField
              label="הערות"
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline rows={3} fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>שמור</Button>
        </DialogActions>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={addMilestoneOpen} onClose={() => setAddMilestoneOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>אבן דרך חדשה</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="שם" required
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="תיאור"
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              fullWidth
            />
            <TextField
              label="תאריך יעד"
              type="date"
              value={milestoneForm.dueDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMilestoneOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={addMilestone} disabled={updateMutation.isPending}>הוסף</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectProgressTab;
