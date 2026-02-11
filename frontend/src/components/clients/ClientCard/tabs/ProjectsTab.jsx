import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../../../admin/utils/api';
import { toast } from 'react-toastify';

const STAGE_LABELS = {
  lead: 'ליד',
  assessment: 'אפיון',
  proposal: 'הצעה',
  contract: 'חוזה',
  active: 'פעיל',
  completed: 'הושלם',
  maintenance: 'תחזוקה',
  archived: 'בארכיון',
};

const ProjectsTab = ({ clientId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', clientId],
    queryFn: () => projectsAPI.getByClient(clientId).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data).then((res) => res.data),
    onSuccess: (resp) => {
      const project = resp?.data;
      queryClient.invalidateQueries(['projects', clientId]);
      toast.success('הפרויקט נוצר בהצלחה');
      setCreateDialogOpen(false);
      setCreateForm({ name: '', description: '', budget: '', startDate: '' });
      if (project?._id) {
        navigate(`/admin/projects/${project._id}`);
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'שגיאה ביצירת פרויקט');
    },
  });

  const projects = data?.data || [];

  const handleOpenCreate = () => {
    setCreateForm({
      name: `פרויקט חדש ${new Date().toLocaleDateString('he-IL')}`,
      description: '',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    setCreateDialogOpen(true);
  };

  const handleCreateProject = () => {
    const budgetNum = createForm.budget ? parseInt(createForm.budget, 10) : 0;
    const payload = {
      clientId,
      name: createForm.name.trim() || `פרויקט חדש ${new Date().toLocaleDateString('he-IL')}`,
      description: createForm.description.trim() || undefined,
      stage: 'assessment',
      status: 'assessment',
      startDate: createForm.startDate || undefined,
      financials: budgetNum > 0 ? { totalValue: budgetNum, paidAmount: 0, balance: budgetNum } : undefined,
    };
    createMutation.mutate(payload);
  };

  const handleRowClick = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        שגיאה בטעינת פרויקטים: {error?.response?.data?.message || error.message}
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          אין פרויקטים. צור פרויקט ראשון
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disabled={createMutation.isPending}
          sx={{ mt: 2 }}
        >
          {createMutation.isPending ? 'יוצר...' : 'צור פרויקט חדש'}
        </Button>
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>פרויקט חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="שם הפרויקט"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                required
                fullWidth
                placeholder="למשל: מיתוג אתר עסקי"
              />
              <TextField
                label="תיאור"
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                multiline
                rows={2}
                fullWidth
                placeholder="תיאור קצר של הפרויקט"
              />
              <TextField
                label="תקציב (₪)"
                type="number"
                value={createForm.budget}
                onChange={(e) => setCreateForm((p) => ({ ...p, budget: e.target.value }))}
                inputProps={{ min: 0 }}
                fullWidth
                placeholder="סכום משוער"
              />
              <TextField
                label="תאריך התחלה"
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>ביטול</Button>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'יוצר...' : 'צור פרויקט'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">פרויקטים</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disabled={createMutation.isPending}
        >
          צור פרויקט חדש
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>שם הפרויקט</TableCell>
              <TableCell align="center">שלב</TableCell>
              <TableCell align="right">סה"כ ערך</TableCell>
              <TableCell align="right">יתרה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project._id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(project._id)}
              >
                <TableCell>{project.name || '-'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={STAGE_LABELS[project.stage] || project.stage || '-'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  ₪{(project.financials?.totalValue ?? 0).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  ₪{(project.financials?.balance ?? 0).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>פרויקט חדש</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="שם הפרויקט"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              required
              fullWidth
              placeholder="למשל: מיתוג אתר עסקי"
            />
            <TextField
              label="תיאור"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              placeholder="תיאור קצר של הפרויקט"
            />
            <TextField
              label="תקציב (₪)"
              type="number"
              value={createForm.budget}
              onChange={(e) => setCreateForm((p) => ({ ...p, budget: e.target.value }))}
              inputProps={{ min: 0 }}
              fullWidth
              placeholder="סכום משוער"
            />
            <TextField
              label="תאריך התחלה"
              type="date"
              value={createForm.startDate}
              onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'יוצר...' : 'צור פרויקט'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsTab;
