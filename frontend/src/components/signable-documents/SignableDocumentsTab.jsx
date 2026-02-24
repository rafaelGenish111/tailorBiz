// frontend/src/components/signable-documents/SignableDocumentsTab.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signableDocumentsAPI } from '../../admin/utils/api';
import { toast } from 'react-toastify';
import SignableDocumentEditor from './SignableDocumentEditor';
import SendDocumentDialog from './SendDocumentDialog';

const statusConfig = {
  draft: { label: 'טיוטה', color: 'default' },
  sent: { label: 'נשלח', color: 'primary' },
  viewed: { label: 'נצפה', color: 'info' },
  signed: { label: 'נחתם', color: 'success' },
  expired: { label: 'פג תוקף', color: 'warning' }
};

const typeLabels = {
  contract: 'חוזה',
  agreement: 'הסכם',
  form: 'טופס',
  proposal: 'הצעה',
  other: 'אחר'
};

export default function SignableDocumentsTab({ clientId, client }) {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendingDoc, setSendingDoc] = useState(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuDoc, setMenuDoc] = useState(null);

  // Fetch documents
  const { data: docsRes, isLoading, error: fetchError } = useQuery({
    queryKey: ['signable-documents', clientId],
    queryFn: () => signableDocumentsAPI.getByClient(clientId).then(r => r.data),
    enabled: !!clientId
  });
  const docs = docsRes?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => signableDocumentsAPI.create(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signable-documents', clientId] });
      setEditorOpen(false);
      setEditingDoc(null);
      toast.success('מסמך נוצר בהצלחה');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'שגיאה ביצירת מסמך')
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => signableDocumentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signable-documents', clientId] });
      setEditorOpen(false);
      setEditingDoc(null);
      toast.success('מסמך עודכן בהצלחה');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'שגיאה בעדכון מסמך')
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => signableDocumentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signable-documents', clientId] });
      toast.success('מסמך נמחק');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'שגיאה במחיקת מסמך')
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: ({ id, data }) => signableDocumentsAPI.send(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['signable-documents', clientId] });
      setSendDialogOpen(false);
      setSendingDoc(null);
      toast.success('מסמך נשלח ללקוח');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'שגיאה בשליחת מסמך')
  });

  // Preview PDF mutation
  const previewMutation = useMutation({
    mutationFn: (id) => signableDocumentsAPI.generatePreviewPDF(id),
    onSuccess: (res) => {
      const url = res.data?.data?.pdfUrl;
      if (url) {
        setPdfPreviewUrl(url);
        setPdfPreviewOpen(true);
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'שגיאה ביצירת תצוגה מקדימה')
  });

  const handleSave = (formData) => {
    if (editingDoc) {
      updateMutation.mutate({ id: editingDoc._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleMenuOpen = (event, doc) => {
    setMenuAnchor(event.currentTarget);
    setMenuDoc(doc);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuDoc(null);
  };

  const handleEdit = () => {
    setEditingDoc(menuDoc);
    setEditorOpen(true);
    handleMenuClose();
  };

  const handleSend = () => {
    setSendingDoc(menuDoc);
    setSendDialogOpen(true);
    handleMenuClose();
  };

  const handlePreview = () => {
    previewMutation.mutate(menuDoc._id);
    handleMenuClose();
  };

  const handleViewSignedPdf = () => {
    if (menuDoc?.signedPdfUrl) {
      if (menuDoc.signedPdfUrl.startsWith('data:')) {
        setPdfPreviewUrl(menuDoc.signedPdfUrl);
        setPdfPreviewOpen(true);
      } else {
        window.open(menuDoc.signedPdfUrl, '_blank');
      }
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm(`האם למחוק את המסמך "${menuDoc?.title}"?`)) {
      deleteMutation.mutate(menuDoc._id);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return <Alert severity="error">שגיאה בטעינת מסמכים: {fetchError.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">מסמכים לחתימה דיגיטלית</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingDoc(null); setEditorOpen(true); }}
          size="small"
        >
          מסמך חדש
        </Button>
      </Box>

      {docs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            אין מסמכים עדיין. צור מסמך חדש כדי לשלוח ללקוח לחתימה.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {docs.map((doc) => (
            <Paper
              key={doc._id}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRight: doc.status === 'signed' ? '3px solid #4caf50' : 'none'
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" noWrap>
                    {doc.title}
                  </Typography>
                  <Chip
                    label={statusConfig[doc.status]?.label || doc.status}
                    color={statusConfig[doc.status]?.color || 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {doc.documentNumber} | {typeLabels[doc.documentType] || doc.documentType} | {new Date(doc.createdAt).toLocaleDateString('he-IL')}
                  {doc.signedAt && ` | נחתם: ${new Date(doc.signedAt).toLocaleDateString('he-IL')}`}
                  {doc.signerName && ` ע"י ${doc.signerName}`}
                </Typography>
              </Box>

              <Tooltip title="פעולות">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, doc)}
                >
                  <MoreIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {menuDoc?.status === 'draft' && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ ml: 1 }} /> עריכה
          </MenuItem>
        )}
        {menuDoc?.status !== 'signed' && (
          <MenuItem onClick={handleSend}>
            <SendIcon fontSize="small" sx={{ ml: 1 }} /> שלח ללקוח
          </MenuItem>
        )}
        <MenuItem onClick={handlePreview}>
          <PdfIcon fontSize="small" sx={{ ml: 1 }} /> תצוגה מקדימה PDF
        </MenuItem>
        {menuDoc?.status === 'signed' && menuDoc?.signedPdfUrl && (
          <MenuItem onClick={handleViewSignedPdf}>
            <ViewIcon fontSize="small" sx={{ ml: 1 }} /> צפה ב-PDF חתום
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ ml: 1 }} /> מחק
        </MenuItem>
      </Menu>

      {/* Editor Dialog */}
      <SignableDocumentEditor
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingDoc(null); }}
        onSave={handleSave}
        initialData={editingDoc}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Send Dialog */}
      <SendDocumentDialog
        open={sendDialogOpen}
        onClose={() => { setSendDialogOpen(false); setSendingDoc(null); }}
        onSend={(data) => sendMutation.mutate({ id: sendingDoc?._id, data })}
        document={sendingDoc}
        client={client}
        loading={sendMutation.isPending}
      />

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>תצוגה מקדימה</DialogTitle>
        <DialogContent>
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              style={{ width: '100%', height: '70vh', border: 'none' }}
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
