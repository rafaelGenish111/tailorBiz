import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, quotesAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../common/ConfirmDialog';

const STATUS_LABELS = { new: 'חדש', reviewed: 'נבדק', approved: 'אושר', rejected: 'נדחה', implemented: 'מיושם' };
const PRIORITY_LABELS = { must: 'חובה', nice_to_have: 'רצוי' };

const emptyForm = {
  title: '', description: '', status: 'new', priority: 'must',
  estimatedHours: '', notes: '', source: 'form',
};

const ProjectProposalTab = ({ project, projectId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clientId = project?.clientId?._id || project?.clientId;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reqToDelete, setReqToDelete] = useState(null);

  const requirements = project?.requirements || [];
  const approvedReqs = requirements.filter((r) => r.status === 'approved');
  const canGenerateQuote = approvedReqs.length > 0;

  const { data: quotesRes } = useQuery({
    queryKey: ['clientQuotes', clientId],
    queryFn: () => quotesAPI.getByClient(clientId).then((r) => r.data),
    enabled: !!clientId,
  });

  const quotes = quotesRes?.data?.quotes || [];
  const projectQuotes = quotes.filter(
    (q) => q.projectId === projectId || q.projectId?._id === projectId
  );

  const addMutation = useMutation({
    mutationFn: (data) => projectsAPI.addRequirement(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setModalOpen(false);
      setForm(emptyForm);
      toast.success('הדרישה נוספה');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ reqId, data }) => projectsAPI.updateRequirement(projectId, reqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setModalOpen(false);
      setEditingReq(null);
      setForm(emptyForm);
      toast.success('עודכן');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה'),
  });

  const deleteMutation = useMutation({
    mutationFn: (reqId) => projectsAPI.deleteRequirement(projectId, reqId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setDeleteConfirmOpen(false);
      setReqToDelete(null);
      toast.success('נמחק');
    },
  });

  const generateQuoteMutation = useMutation({
    mutationFn: () => quotesAPI.generateFromProject(projectId),
    onSuccess: (resp) => {
      const quote = resp?.data?.data;
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      toast.success('הצעת מחיר נוצרה');
      if (quote?._id && clientId) {
        navigate(`/admin/clients/${clientId}?tab=quotes&editQuote=${quote._id}`);
      }
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה ביצירת הצעה'),
  });

  const openAdd = () => { setEditingReq(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (req) => {
    setEditingReq(req);
    setForm({
      title: req.title || '', description: req.description || '',
      status: req.status || 'new', priority: req.priority || 'must',
      estimatedHours: req.estimatedHours ?? '', notes: req.notes || '',
      source: req.source || 'form',
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title?.trim()) { toast.error('נא למלא כותרת'); return; }
    const payload = { ...form, estimatedHours: Number(form.estimatedHours) || 0 };
    if (editingReq) {
      updateMutation.mutate({ reqId: editingReq._id, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const totalHours = requirements.reduce((s, r) => s + (r.estimatedHours || 0), 0);
  const approvedHours = approvedReqs.reduce((s, r) => s + (r.estimatedHours || 0), 0);

  return (
    <Box>
      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">דרישות</Typography>
          <Typography variant="h6">{requirements.length}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">מאושרות</Typography>
          <Typography variant="h6" color="success.main">{approvedReqs.length}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">שעות משוערות</Typography>
          <Typography variant="h6">{totalHours} ({approvedHours} מאושרות)</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">הצעות מחיר</Typography>
          <Typography variant="h6">{projectQuotes.length}</Typography>
        </Paper>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained" color="secondary" startIcon={<AutoAwesomeIcon />}
          onClick={() => generateQuoteMutation.mutate()}
          disabled={!canGenerateQuote || generateQuoteMutation.isPending}
        >
          {generateQuoteMutation.isPending ? 'יוצר...' : 'צור הצעת מחיר מדרישות מאושרות'}
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd}>
          הוסף דרישה
        </Button>
      </Box>

      {!canGenerateQuote && requirements.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          יש לאשר דרישות (סטטוס "אושר") כדי ליצור הצעת מחיר
        </Alert>
      )}

      {/* Requirements table */}
      {requirements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">אין דרישות. הוסף דרישה ראשונה</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 2 }}>
            הוסף דרישה
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>כותרת</TableCell>
                <TableCell align="center">עדיפות</TableCell>
                <TableCell align="center">סטטוס</TableCell>
                <TableCell align="right">שעות</TableCell>
                <TableCell align="center" width={80} />
              </TableRow>
            </TableHead>
            <TableBody>
              {requirements.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.title}</TableCell>
                  <TableCell align="center">{PRIORITY_LABELS[req.priority] || req.priority}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={STATUS_LABELS[req.status] || req.status}
                      size="small"
                      color={req.status === 'approved' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{req.estimatedHours || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(req)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setReqToDelete(req); setDeleteConfirmOpen(true); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Requirement Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReq ? 'עריכת דרישה' : 'הוספת דרישה'}</DialogTitle>
        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="כותרת" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth />
          <TextField label="תיאור" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
          <FormControl fullWidth>
            <InputLabel>סטטוס</InputLabel>
            <Select value={form.status} label="סטטוס" onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>עדיפות</InputLabel>
            <Select value={form.priority} label="עדיפות" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="שעות משוערות" type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} inputProps={{ min: 0 }} fullWidth />
          <TextField label="הערות" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button onClick={() => setModalOpen(false)}>ביטול</Button>
            <Button variant="contained" onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>שמור</Button>
          </Box>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="מחיקת דרישה"
        content="האם למחוק את הדרישה?"
        onConfirm={() => reqToDelete && deleteMutation.mutate(reqToDelete._id)}
        onClose={() => { setDeleteConfirmOpen(false); setReqToDelete(null); }}
        confirmColor="error"
      />
    </Box>
  );
};

export default ProjectProposalTab;
