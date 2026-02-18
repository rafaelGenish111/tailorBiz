// frontend/src/components/quotes/QuotesTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../admin/utils/api';
import QuoteEditor from './QuoteEditor';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const statusConfig = {
  draft: { label: 'טיוטה', color: 'default' },
  sent: { label: 'נשלח', color: 'primary' },
  viewed: { label: 'נצפה', color: 'info' },
  accepted: { label: 'אושר', color: 'success' },
  rejected: { label: 'נדחה', color: 'error' },
  expired: { label: 'פג תוקף', color: 'warning' }
};

const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

const resolvePdfUrl = (url) => {
  // בדיקה אם ה-URL תקין
  if (!url || url.includes('undefined') || url.includes('null')) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SERVER_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// המרת data URL ל-blob URL לתצוגה מקדימה ב-iframe
const dataUrlToBlobUrl = (dataUrl) => {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:application/pdf')) return dataUrl;
    const base64 = dataUrl.split(',')[1];
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to convert data URL to blob URL:', e);
    return null;
  }
};

// קבלת URL לתצוגה מקדימה (ממיר data URL ל-blob URL)
const getPreviewUrl = (url) => {
  const resolvedUrl = resolvePdfUrl(url);
  if (!resolvedUrl) return null;
  if (resolvedUrl.startsWith('data:')) {
    return dataUrlToBlobUrl(resolvedUrl);
  }
  return resolvedUrl;
};

const openPdf = (url) => {
  const finalUrl = resolvePdfUrl(url);
  if (!finalUrl) return;

  try {
    if (finalUrl.startsWith('data:application/pdf')) {
      const blobUrl = dataUrlToBlobUrl(finalUrl);
      if (blobUrl) window.open(blobUrl, '_blank');
    } else {
      window.open(finalUrl, '_blank');
    }
  } catch (e) {
    console.error('Failed to open PDF:', e);
  }
};

// eslint-disable-next-line no-unused-vars
const QuotesTab = ({ clientId, clientName, initialEditQuoteId, onClearEditQuote }) => {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuQuote, setMenuQuote] = useState(null);

  // טופס יצירה בסיסי
  const [basicForm, setBasicForm] = useState({
    title: 'הצעת מחיר',
    productName: '',
    description: '',
    quantity: 1,
    price: '',
    includeVat: true,
    discount: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [pdfFile, setPdfFile] = useState(null);

  const { data: quotesData, isLoading, error } = useQuery({
    queryKey: ['clientQuotes', clientId],
    queryFn: () => api.get(`/quotes/client/${clientId}`).then(res => res.data)
  });

  const quotes = quotesData?.data?.quotes || [];

  useEffect(() => {
    if (initialEditQuoteId && quotes.length > 0) {
      const quote = quotes.find((q) => q._id === initialEditQuoteId);
      if (quote) {
        setSelectedQuote(quote);
        setEditorOpen(true);
        onClearEditQuote?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditQuoteId, quotes]);

  const deleteMutation = useMutation({
    mutationFn: (quoteId) => api.delete(`/quotes/${quoteId}`),
    onSuccess: () => queryClient.invalidateQueries(['clientQuotes', clientId])
  });

  const duplicateMutation = useMutation({
    mutationFn: (quoteId) => api.post(`/quotes/${quoteId}/duplicate`).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      setSelectedQuote(data.data);
      setEditorOpen(true);
    }
  });

  const pdfMutation = useMutation({
    mutationFn: (quoteId) => api.post(`/quotes/${quoteId}/generate-pdf`).then(res => res.data),
    onSuccess: () => {
      // רק רענון הנתונים - לא פותח אוטומטית
      queryClient.invalidateQueries(['clientQuotes', clientId]);
    }
  });

  const createBasicQuoteMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/quotes/client/${clientId}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      setBasicForm((prev) => ({
        ...prev,
        productName: '',
        description: '',
        price: '',
        quantity: 1,
        discount: 0,
      }));
      setFormErrors({});
    },
  });

  const uploadPdfMutation = useMutation({
    mutationFn: async ({ quoteId, file }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      return api
        .post(`/quotes/${quoteId}/upload-pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      setPdfFile(null);
    },
  });

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuQuote(null);
  };

  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setEditorOpen(true);
    handleMenuClose();
  };

  const handleDelete = async (quoteId) => {
    if (window.confirm('האם למחוק את הצעת המחיר?')) {
      deleteMutation.mutate(quoteId);
    }
    handleMenuClose();
  };

  // ההצעה העיקרית שתוצג – ההצעה האחרונה (לפי createdAt מהשרת)
  const primaryQuote = quotes[0] || null;

  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  const activeQuote = useMemo(() => {
    if (!quotes.length) return null;
    const byId = quotes.find((q) => q._id === selectedQuoteId);
    return byId || primaryQuote;
  }, [quotes, selectedQuoteId, primaryQuote]);

  const totals = useMemo(() => {
    const quantity = Number(basicForm.quantity) || 1;
    const unitPrice = Number(basicForm.price) || 0;
    const subtotal = quantity * unitPrice;
    const discount = Number(basicForm.discount) || 0;
    const afterDiscount = Math.max(subtotal - discount, 0);
    const vatRate = 17; // ברירת מחדל, כמו בשרת
    const vatAmount = basicForm.includeVat ? (afterDiscount * vatRate) / 100 : 0;
    const total = afterDiscount + vatAmount;
    return { subtotal, discount, vatAmount, total, vatRate };
  }, [basicForm]);

  const handleCreateBasicQuote = () => {
    const errors = {};
    if (!basicForm.productName.trim()) {
      errors.productName = 'יש למלא שם מוצר / שירות';
    }
    if (!basicForm.price || Number(basicForm.price) <= 0) {
      errors.price = 'יש להזין מחיר חיובי';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const quantity = Number(basicForm.quantity) || 1;
    const unitPrice = Number(basicForm.price) || 0;
    const item = {
      name: basicForm.productName,
      description: basicForm.description,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };

    const payload = {
      title: basicForm.title,
      items: [item],
      includeVat: basicForm.includeVat,
      discount: Number(basicForm.discount) || 0,
      discountType: 'fixed',
      notes: '',
      terms: '',
      validUntil: null,
    };

    createBasicQuoteMutation.mutate(payload);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">הצעת מחיר</Typography>
        {activeQuote && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setSelectedQuote(activeQuote);
              setEditorOpen(true);
            }}
          >
            ערוך פרטים מתקדמים
          </Button>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">שגיאה בטעינת הצעות מחיר</Alert>
      ) : !activeQuote ? (
        <Paper sx={{ p: 3, maxWidth: 640 }}>
          <Typography variant="subtitle1" gutterBottom>
            יצירת הצעת מחיר בסיסית
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            מלא/י פרטים בסיסיים (מוצר + מחיר). אחר כך תוכל/י להעלות קובץ PDF מותאם אישית שיתפוס את רוב הטאב.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="כותרת ההצעה"
              value={basicForm.title}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="מוצר / שירות"
              value={basicForm.productName}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, productName: e.target.value }))}
              fullWidth
              error={Boolean(formErrors.productName)}
              helperText={formErrors.productName}
            />
            <TextField
              label="תיאור (אופציונלי)"
              value={basicForm.description}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="כמות"
                type="number"
                value={basicForm.quantity}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value) || 1,
                  }))
                }
                sx={{ width: 120 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="מחיר ליחידה (₪)"
                type="number"
                value={basicForm.price}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                sx={{ width: 180 }}
                error={Boolean(formErrors.price)}
                helperText={formErrors.price}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="הנחה (₪)"
                type="number"
                value={basicForm.discount}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    discount: e.target.value,
                  }))
                }
                sx={{ width: 180 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={basicForm.includeVat}
                  onChange={(e) =>
                    setBasicForm((prev) => ({ ...prev, includeVat: e.target.checked }))
                  }
                />
              }
              label="כולל מע״מ"
            />

            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                סיכום מהיר
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">סה״כ לפני מע״מ:</Typography>
                <Typography variant="body2">₪{totals.subtotal.toLocaleString()}</Typography>
              </Box>
              {totals.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">הנחה:</Typography>
                  <Typography variant="body2" color="error">
                    -₪{totals.discount.toLocaleString()}
                  </Typography>
                </Box>
              )}
              {basicForm.includeVat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">מע״מ ({totals.vatRate}%):</Typography>
                  <Typography variant="body2">₪{totals.vatAmount.toLocaleString()}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">סה״כ להצעת המחיר:</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  ₪{totals.total.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBasicQuote}
                disabled={createBasicQuoteMutation.isPending}
              >
                {createBasicQuoteMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  'צור הצעת מחיר'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 2fr' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {/* צד שמאל – פרטי הצעה ופעולות */}
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  הצעת מחיר
                </Typography>
                <Typography variant="h6">
                  {activeQuote.title || 'הצעת מחיר'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מספר: {activeQuote.quoteNumber}{' '}
                  · תאריך:{' '}
                  {activeQuote.createdAt &&
                    new Date(activeQuote.createdAt).toLocaleDateString('he-IL')}
                </Typography>
              </Box>
              <Chip
                label={statusConfig[activeQuote.status]?.label || activeQuote.status}
                color={statusConfig[activeQuote.status]?.color || 'default'}
                size="small"
              />
            </Box>

            {quotes.length > 1 && (
              <FormControl size="small" fullWidth>
                <InputLabel id="quote-select-label">בחר הצעת מחיר</InputLabel>
                <Select
                  labelId="quote-select-label"
                  label="בחר הצעת מחיר"
                  value={activeQuote._id}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                >
                  {quotes.map((q) => (
                    <MenuItem key={q._id} value={q._id}>
                      {q.quoteNumber} · ₪{q.total?.toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                סיכום כספי
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">סה״כ לפני מע״מ:</Typography>
                <Typography variant="body2">
                  ₪{activeQuote.subtotal?.toLocaleString()}
                </Typography>
              </Box>
              {activeQuote.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">הנחה:</Typography>
                  <Typography variant="body2" color="error">
                    -₪
                    {(
                      activeQuote.subtotal - (activeQuote.total - (activeQuote.vatAmount || 0))
                    ).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {activeQuote.includeVat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    מע״מ ({activeQuote.vatRate || 17}%):
                  </Typography>
                  <Typography variant="body2">
                    ₪{activeQuote.vatAmount?.toLocaleString()}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">סה״כ להצעה:</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  ₪{activeQuote.total?.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* העלאת PDF */}
            <Typography variant="subtitle1">קובץ PDF של ההצעה</Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PdfIcon />}
            >
              בחר קובץ PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFile(file);
                  }
                }}
              />
            </Button>
            {pdfFile && (
              <Typography variant="body2" color="text.secondary">
                נבחר: {pdfFile.name}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!pdfFile || uploadPdfMutation.isPending}
                onClick={() => {
                  if (!pdfFile) return;
                  uploadPdfMutation.mutate({ quoteId: activeQuote._id, file: pdfFile });
                }}
              >
                {uploadPdfMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  'העלה / עדכן PDF'
                )}
              </Button>
              {activeQuote.pdfUrl && resolvePdfUrl(activeQuote.pdfUrl) && (
                <Button
                  variant="text"
                  startIcon={<PdfIcon />}
                  onClick={() => openPdf(activeQuote.pdfUrl)}
                >
                  פתח בחלון חדש
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(activeQuote._id)}
              >
                מחק הצעה
              </Button>
            </Box>
          </Paper>

          {/* צד ימין – תצוגת PDF שתופסת את רוב הטאב */}
          <Paper
            sx={{
              p: 0,
              height: { xs: 400, md: 600 },
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
            {activeQuote.pdfUrl && getPreviewUrl(activeQuote.pdfUrl) ? (
              <iframe
                title="תצוגה מקדימה של הצעת המחיר"
                src={getPreviewUrl(activeQuote.pdfUrl)}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <PdfIcon sx={{ fontSize: 64, color: 'grey.400', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  עדיין לא הועלה קובץ PDF להצעה זו
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  העלה PDF בצד שמאל, והוא יוצג כאן בגודל מלא בכל פעם שתיכנס לטאב "הצעת מחיר".
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* תפריט ניהול נוסף (כרגע בעיקר לעריכה מתקדמת / שכפול אם תרצה להשתמש) */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEdit(menuQuote)}>
          <EditIcon sx={{ mr: 1 }} /> ערוך
        </MenuItem>
        <MenuItem onClick={() => { duplicateMutation.mutate(menuQuote?._id); handleMenuClose(); }}>
          <DuplicateIcon sx={{ mr: 1 }} /> שכפל
        </MenuItem>
        <MenuItem onClick={() => { pdfMutation.mutate(menuQuote?._id); handleMenuClose(); }}>
          <PdfIcon sx={{ mr: 1 }} /> צור PDF
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuQuote?._id)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> מחק
        </MenuItem>
      </Menu>

      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '80vh' } }}
      >
        <QuoteEditor
          clientId={clientId}
          quote={selectedQuote}
          onSave={() => setEditorOpen(false)}
          onClose={() => setEditorOpen(false)}
        />
      </Dialog>
    </Box>
  );
};

export default QuotesTab;

