// frontend/src/components/documents/DocumentsTab.jsx
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Menu,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, Alert, Tabs, Tab,
  TextField, FormControl, InputLabel, Select
} from '@mui/material';
import {
  Add as AddIcon, MoreVert as MoreIcon, Delete as DeleteIcon,
  Download as DownloadIcon, Visibility as VisibilityIcon, Archive as ArchiveIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';
const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

const categoryLabels = {
  quote: 'הצעת מחיר',
  contract: 'חוזה',
  invoice: 'חשבונית',
  receipt: 'קבלה',
  proposal: 'הצעה',
  specification: 'מפרט',
  other: 'אחר'
};

const resolvePdfUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SERVER_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const openPdf = (url) => {
  const finalUrl = resolvePdfUrl(url);
  if (!finalUrl) return;

  try {
    if (finalUrl.startsWith('data:application/pdf')) {
      const base64 = finalUrl.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(finalUrl, '_blank');
    }
  } catch (e) {
    console.error('Failed to open document PDF:', e);
  }
};

const DocumentsTab = ({ clientId }) => {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuDocument, setMenuDocument] = useState(null);
  const [uploadData, setUploadData] = useState({
    file: null,
    category: 'other',
    description: ''
  });

  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['clientDocuments', clientId, selectedCategory],
    queryFn: () => axios.get(`${API_URL}/documents/client/${clientId}`, {
      params: { category: selectedCategory }
    }).then(res => res.data)
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return axios.post(`${API_URL}/documents/client/${clientId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clientDocuments', clientId]);
      setUploadDialogOpen(false);
      setUploadData({ file: null, category: 'other', description: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId) => axios.delete(`${API_URL}/documents/${documentId}`),
    onSuccess: () => queryClient.invalidateQueries(['clientDocuments', clientId])
  });

  const archiveMutation = useMutation({
    mutationFn: (documentId) => axios.put(`${API_URL}/documents/${documentId}/archive`),
    onSuccess: () => queryClient.invalidateQueries(['clientDocuments', clientId])
  });

  const handleFileChange = (e) => {
    setUploadData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUpload = () => {
    if (!uploadData.file) return;

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('category', uploadData.category);
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }

    uploadMutation.mutate(formData);
  };

  const handleMenuOpen = (event, document) => {
    setMenuAnchor(event.currentTarget);
    setMenuDocument(document);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuDocument(null);
  };

  const handleDelete = (documentId) => {
    if (window.confirm('האם למחוק את המסמך?')) {
      deleteMutation.mutate(documentId);
    }
    handleMenuClose();
  };

  const handleArchive = (documentId) => {
    archiveMutation.mutate(documentId);
    handleMenuClose();
  };

  const documents = documentsData?.data?.documents || [];
  const categoryCounts = documentsData?.data?.categoryCounts || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">מסמכים</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadDialogOpen(true)}>
          העלה מסמך
        </Button>
      </Box>

      {/* פילטר לפי קטגוריה */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`הכל (${documents.length})`} value="all" />
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Tab
              key={key}
              label={`${label} (${categoryCounts[key] || 0})`}
              value={key}
            />
          ))}
        </Tabs>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">שגיאה בטעינת המסמכים</Alert>
      ) : documents.length === 0 ? (
        <Alert severity="info">
          אין מסמכים עדיין.
          <Button size="small" onClick={() => setUploadDialogOpen(true)} sx={{ ml: 1 }}>
            העלה מסמך ראשון
          </Button>
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>שם קובץ</TableCell>
                <TableCell>קטגוריה</TableCell>
                <TableCell>תאריך העלאה</TableCell>
                <TableCell>גודל</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{doc.fileName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={categoryLabels[doc.category] || doc.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(doc.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    {doc.fileSizeFormatted || `${(doc.fileSize / 1024).toFixed(1)} KB`}
                  </TableCell>
                  <TableCell>{doc.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="צפה">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openPdf(doc.cloudinaryUrl)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, doc)}>
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { openPdf(menuDocument?.cloudinaryUrl); handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 1 }} /> צפה
        </MenuItem>
        <MenuItem onClick={() => { openPdf(menuDocument?.cloudinaryUrl); handleMenuClose(); }}>
          <DownloadIcon sx={{ mr: 1 }} /> הורד
        </MenuItem>
        <MenuItem onClick={() => handleArchive(menuDocument?._id)}>
          <ArchiveIcon sx={{ mr: 1 }} /> העבר לארכיון
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuDocument?._id)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> מחק
        </MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>העלה מסמך</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
              onChange={handleFileChange}
              style={{ marginBottom: 16 }}
            />
            {uploadData.file && (
              <Typography variant="body2" color="text.secondary">
                נבחר: {uploadData.file.name}
              </Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>קטגוריה</InputLabel>
              <Select
                value={uploadData.category}
                label="קטגוריה"
                onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="תיאור (אופציונלי)"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !uploadData.file}
          >
            {uploadMutation.isPending ? <CircularProgress size={20} /> : 'העלה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsTab;

