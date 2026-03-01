import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';
import { toast } from 'react-toastify';

const CATEGORY_LABELS = {
  contract: 'חוזה',
  proposal: 'הצעה',
  invoice: 'חשבונית',
  design: 'עיצוב',
  spec: 'מפרט',
  other: 'אחר',
};

const ProjectDocumentsTab = ({ project, projectId }) => {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'other' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['projectDocuments', projectId],
    queryFn: () => projectsAPI.getDocuments(projectId).then((r) => r.data),
  });

  const documents = res?.data || [];

  const addMutation = useMutation({
    mutationFn: (data) => projectsAPI.addDocument(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectDocuments', projectId]);
      setUploadOpen(false);
      setForm({ description: '', category: 'other' });
      toast.success('המסמך נוסף');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'שגיאה'),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => projectsAPI.deleteDocument(projectId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectDocuments', projectId]);
      toast.success('המסמך נמחק');
    },
  });

  const handleAdd = () => {
    addMutation.mutate({
      filename: form.description || 'מסמך',
      description: form.description,
      category: form.category,
    });
  };

  const handleDelete = (docId) => {
    if (window.confirm('למחוק מסמך?')) deleteMutation.mutate(docId);
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">מסמכים</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadOpen(true)}>
          הוסף מסמך
        </Button>
      </Box>

      {documents.length === 0 ? (
        <Alert severity="info">אין מסמכים</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>שם</TableCell>
                <TableCell>קטגוריה</TableCell>
                <TableCell>תאריך</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.originalName || doc.filename}</TableCell>
                  <TableCell>
                    <Chip label={CATEGORY_LABELS[doc.category] || doc.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('he-IL') : '-'}
                  </TableCell>
                  <TableCell>{doc.description || '-'}</TableCell>
                  <TableCell align="center">
                    {doc.url && (
                      <IconButton size="small" color="primary" onClick={() => window.open(doc.url, '_blank')}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(doc._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוסף מסמך</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="תיאור"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>קטגוריה</InputLabel>
              <Select value={form.category} label="קטגוריה"
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleAdd} disabled={addMutation.isPending}>הוסף</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDocumentsTab;
