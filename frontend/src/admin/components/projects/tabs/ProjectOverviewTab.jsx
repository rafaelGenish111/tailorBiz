import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button,
  TextField, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, Grid
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';
import { toast } from 'react-toastify';

const STAGE_LABELS = {
  lead: 'ליד',
  won: 'נסגר',
  lost: 'הפסד',
  active: 'פעיל',
  completed: 'הושלם',
  archived: 'בארכיון',
};

const STAGE_COLORS = {
  lead: 'info',
  won: 'success',
  lost: 'error',
  active: 'primary',
  completed: 'success',
  archived: 'default',
};

const PRODUCT_TYPES = [
  'מערכת SaaS',
  'מערכות AI',
  'הטמעת בינה מלאכותית בארגון',
  'קורסים',
  'אפליקציה בהתאמה אישית',
];

const ProjectOverviewTab = ({ project, projectId }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const updateMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setEditing(false);
      toast.success('הפרויקט עודכן');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בעדכון'),
  });

  const openEdit = () => {
    setForm({
      name: project.name || '',
      description: project.description || '',
      stage: project.stage || 'lead',
      productType: project.productType || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      expectedMrr: project.expectedMrr || 0,
      totalValue: project.financials?.totalValue || 0,
    });
    setEditing(true);
  };

  const handleSave = () => {
    const paid = project.financials?.paidAmount ?? 0;
    const total = Number(form.totalValue) || 0;
    updateMutation.mutate({
      name: form.name,
      description: form.description,
      stage: form.stage,
      productType: form.productType || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      expectedMrr: Number(form.expectedMrr) || 0,
      financials: {
        totalValue: total,
        paidAmount: paid,
        balance: total - paid,
      },
    });
  };

  if (editing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="שם הפרויקט"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fullWidth
        />
        <TextField
          label="תיאור"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          multiline rows={3} fullWidth
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>שלב</InputLabel>
              <Select value={form.stage} label="שלב" onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>סוג מוצר</InputLabel>
              <Select value={form.productType} label="סוג מוצר" onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                <MenuItem value="">ללא</MenuItem>
                {PRODUCT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="תאריך התחלה"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="תאריך סיום"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="שווי העסקה (₪)"
              type="number"
              value={form.totalValue}
              onChange={(e) => setForm({ ...form, totalValue: e.target.value })}
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="MRR צפוי (₪)"
              type="number"
              value={form.expectedMrr}
              onChange={(e) => setForm({ ...form, expectedMrr: e.target.value })}
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setEditing(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <CircularProgress size={20} /> : 'שמור'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button startIcon={<EditIcon />} onClick={openEdit}>ערוך פרטים</Button>
      </Box>

      {project.description && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {project.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">שלב</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={STAGE_LABELS[project.stage] || project.stage} color={STAGE_COLORS[project.stage] || 'default'} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {project.productType && (
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">סוג מוצר</Typography>
                <Typography variant="body2" fontWeight={600}>{project.productType}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">שווי העסקה</Typography>
              <Typography variant="h6">₪{(project.financials?.totalValue ?? 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">שולם</Typography>
              <Typography variant="h6" color="success.main">₪{(project.financials?.paidAmount ?? 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">יתרה</Typography>
              <Typography variant="h6" color="error.main">₪{(project.financials?.balance ?? 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {project.expectedMrr > 0 && (
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">MRR צפוי</Typography>
                <Typography variant="h6">₪{project.expectedMrr.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {(project.startDate || project.endDate) && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {project.startDate && `התחלה: ${new Date(project.startDate).toLocaleDateString('he-IL')}`}
              {project.startDate && project.endDate && ' • '}
              {project.endDate && `סיום: ${new Date(project.endDate).toLocaleDateString('he-IL')}`}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProjectOverviewTab;
