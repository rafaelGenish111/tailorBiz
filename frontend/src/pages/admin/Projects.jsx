import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../admin/hooks/useTasks';

const STATUS_OPTIONS = [
  { value: 'active', label: 'פעיל' },
  { value: 'on_hold', label: 'בהשהיה' },
  { value: 'completed', label: 'הושלם' },
  { value: 'archived', label: 'בארכיון' }
];

const Projects = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: projectsResponse } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const projects = projectsResponse?.data || [];

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    color: '#1976d2'
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      status: 'active',
      color: '#1976d2'
    });
    setDialogOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      color: project.color || '#1976d2'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = { ...form };
    if (editing) {
      await updateProject.mutateAsync({ id: editing._id, data: payload });
    } else {
      await createProject.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (project) => {
    if (!window.confirm('האם למחוק את הפרויקט וכל המשימות הקשורות אליו?')) return;
    await deleteProject.mutateAsync(project._id);
  };

  const getStatusChip = (status) => {
    const config = {
      active: { label: 'פעיל', color: 'success' },
      on_hold: { label: 'בהשהיה', color: 'warning' },
      completed: { label: 'הושלם', color: 'primary' },
      archived: { label: 'בארכיון', color: 'default' }
    }[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            פרויקטים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול פרויקטים ומשימות חוצות יומן ולוח משימות
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          פרויקט חדש
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project._id}>
            <Card sx={{ borderTop: `4px solid ${project.color || '#1976d2'}` }}>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{project.name}</Typography>
                    {getStatusChip(project.status)}
                  </Stack>
                }
                subheader={
                  project.startDate && project.endDate
                    ? `${new Date(project.startDate).toLocaleDateString('he-IL')} - ${new Date(
                        project.endDate
                      ).toLocaleDateString('he-IL')}`
                    : null
                }
              />
              <CardContent>
                {project.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => openEdit(project)}>
                    ערוך
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(project)}>
                    מחק
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'עריכת פרויקט' : 'פרויקט חדש'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם פרויקט"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="תיאור"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              select
              label="סטטוס"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              fullWidth
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="צבע (HEX)"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSubmit}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;


