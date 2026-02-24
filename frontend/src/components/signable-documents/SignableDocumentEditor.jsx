// frontend/src/components/signable-documents/SignableDocumentEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const documentTypes = [
  { value: 'contract', label: 'חוזה' },
  { value: 'agreement', label: 'הסכם' },
  { value: 'form', label: 'טופס' },
  { value: 'proposal', label: 'הצעה' },
  { value: 'other', label: 'אחר' }
];

export default function SignableDocumentEditor({ open, onClose, onSave, initialData, loading }) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('contract');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDocumentType(initialData.documentType || 'contract');
      setContent(initialData.content || '');
    } else {
      setTitle('');
      setDocumentType('contract');
      setContent('');
    }
    setError('');
  }, [initialData, open]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('נא להזין כותרת למסמך');
      return;
    }
    if (!content.trim()) {
      setError('נא להזין תוכן למסמך');
      return;
    }
    setError('');
    onSave({ title: title.trim(), documentType, content: content.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'עריכת מסמך' : 'מסמך חדש לחתימה'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="כותרת המסמך"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="לדוגמה: חוזה שירותים"
          />

          <FormControl fullWidth>
            <InputLabel>סוג מסמך</InputLabel>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="סוג מסמך"
            >
              {documentTypes.map((dt) => (
                <MenuItem key={dt.value} value={dt.value}>{dt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="תוכן המסמך"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={16}
            fullWidth
            placeholder="הדבק כאן את תוכן המסמך..."
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap'
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {initialData ? 'שמור שינויים' : 'צור מסמך'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
