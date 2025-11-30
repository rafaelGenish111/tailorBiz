// frontend/src/components/quotes/QuoteEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel, Divider, Card, CardContent, Alert, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';
const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

const resolvePdfUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // נתיב יחסי לשרת (למשל /uploads/quotes/...)
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
    console.error('Failed to open PDF:', e);
  }
};
const emptyItem = {
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0
};

const QuoteEditor = ({ clientId, quote: existingQuote, onSave, onClose }) => {
  const queryClient = useQueryClient();
  const [quote, setQuote] = useState({
    title: 'הצעת מחיר',
    items: [{ ...emptyItem }],
    includeVat: true,
    vatRate: 17,
    discount: 0,
    discountType: 'fixed',
    notes: '',
    terms: 'תוקף ההצעה: 30 יום מתאריך ההפקה.\nתנאי תשלום: שוטף + 30.',
    validUntil: null,
    businessInfo: {
      name: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      taxId: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    if (existingQuote) {
      setQuote({
        ...existingQuote,
        items: existingQuote.items?.length > 0 ? existingQuote.items : [{ ...emptyItem }]
      });
    }
  }, [existingQuote]);

  // חישוב סכומים
  const calculateTotals = () => {
    const subtotal = quote.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    let discountAmount = 0;
    if (quote.discount > 0) {
      if (quote.discountType === 'percentage') {
        discountAmount = subtotal * (quote.discount / 100);
      } else {
        discountAmount = quote.discount;
      }
    }

    const afterDiscount = subtotal - discountAmount;
    const vatAmount = quote.includeVat ? afterDiscount * (quote.vatRate / 100) : 0;
    const total = afterDiscount + vatAmount;

    return { subtotal, discountAmount, vatAmount, total };
  };

  const { subtotal, discountAmount, vatAmount, total } = calculateTotals();

  // הוספת שורה
  const addItem = () => {
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }]
    }));
  };

  // מחיקת שורה
  const removeItem = (index) => {
    if (quote.items.length === 1) {
      setQuote(prev => ({
        ...prev,
        items: [{ ...emptyItem }]
      }));
    } else {
      setQuote(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // עדכון שורה
  const updateItem = (index, field, value) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        updated.totalPrice = updated.quantity * updated.unitPrice;
        return updated;
      })
    }));
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingQuote?._id) {
        return axios.put(`${API_URL}/quotes/${existingQuote._id}`, data).then(res => res.data);
      } else {
        return axios.post(`${API_URL}/quotes/client/${clientId}`, data).then(res => res.data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      if (onSave) onSave(data.data);
    }
  });

  // Generate PDF mutation
  const pdfMutation = useMutation({
    mutationFn: (quoteId) => 
      axios.post(`${API_URL}/quotes/${quoteId}/generate-pdf`).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      const url = data?.data?.pdfUrl;
      openPdf(url);
    }
  });

  // העלאת PDF חיצוני
  const uploadPdfMutation = useMutation({
    mutationFn: async ({ quoteId, file }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      return axios
        .post(`${API_URL}/quotes/${quoteId}/upload-pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      const newUrl = data?.data?.pdfUrl;
      if (newUrl) {
        setQuote((prev) => ({ ...prev, pdfUrl: newUrl }));
      }
      setPdfFile(null);
    }
  });

  // שמירה
  const handleSave = async () => {
    const newErrors = {};
    if (quote.items.some(item => !item.name)) {
      newErrors.items = 'יש למלא שם לכל פריט';
    }
    if (quote.items.every(item => item.unitPrice === 0)) {
      newErrors.price = 'יש להזין מחיר לפחות לפריט אחד';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSave = {
      ...quote,
      subtotal,
      vatAmount,
      total,
      items: quote.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }))
    };

    saveMutation.mutate(dataToSave);
  };

  // יצירת PDF
  const handleGeneratePDF = async () => {
    if (!existingQuote?._id) {
      const result = await saveMutation.mutateAsync({
        ...quote,
        subtotal,
        vatAmount,
        total,
        items: quote.items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      });
      pdfMutation.mutate(result.data._id);
    } else {
      pdfMutation.mutate(existingQuote._id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* כותרת */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {existingQuote?._id ? `עריכת הצעת מחיר ${existingQuote.quoteNumber}` : 'הצעת מחיר חדשה'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <CircularProgress size={20} /> : 'שמור'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleGeneratePDF}
            disabled={pdfMutation.isPending}
            color="error"
          >
            {pdfMutation.isPending ? <CircularProgress size={20} /> : 'צור PDF'}
          </Button>
        </Box>
      </Box>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {Object.values(errors).join(', ')}
        </Alert>
      )}

      {/* כותרת ההצעה */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="כותרת ההצעה"
              value={quote.title}
              onChange={(e) => setQuote(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="תוקף עד"
              type="date"
              value={quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : ''}
              onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* טבלת פריטים */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">פריטים</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={addItem}>
            הוסף פריט
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700, width: '25%' }}>מוצר/שירות</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '30%' }}>תיאור</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }} align="center">כמות</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }} align="center">מחיר יחידה</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }} align="center">סה"כ</TableCell>
                <TableCell sx={{ width: '5%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quote.items.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <TextField
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="שם המוצר/שירות"
                      size="small"
                      fullWidth
                      error={errors.items && !item.name}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="תיאור (אופציונלי)"
                      size="small"
                      fullWidth
                      multiline
                      maxRows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      size="small"
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      size="small"
                      InputProps={{ startAdornment: '₪' }}
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600}>
                      ₪{(item.quantity * item.unitPrice).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ borderStyle: 'dashed' }}>
            הוסף שורה
          </Button>
        </Box>
      </Paper>

      {/* סיכום */}
      <Grid container spacing={3}>
        {/* הגדרות */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>הגדרות</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={quote.includeVat}
                  onChange={(e) => setQuote(prev => ({ ...prev, includeVat: e.target.checked }))}
                />
              }
              label="כולל מע״מ"
            />

            {quote.includeVat && (
              <TextField
                label="אחוז מע״מ"
                type="number"
                value={quote.vatRate}
                onChange={(e) => setQuote(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 17 }))}
                size="small"
                sx={{ ml: 2, width: 100 }}
                InputProps={{ endAdornment: '%' }}
              />
            )}

            <Box sx={{ mt: 2 }}>
              <TextField
                label="הנחה"
                type="number"
                value={quote.discount}
                onChange={(e) => setQuote(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                size="small"
                sx={{ width: 120, mr: 1 }}
              />
              <Button
                variant={quote.discountType === 'fixed' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setQuote(prev => ({ ...prev, discountType: 'fixed' }))}
                sx={{ mr: 0.5 }}
              >
                ₪
              </Button>
              <Button
                variant={quote.discountType === 'percentage' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setQuote(prev => ({ ...prev, discountType: 'percentage' }))}
              >
                %
              </Button>
            </Box>

            <TextField
              label="הערות"
              value={quote.notes}
              onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />

            <TextField
              label="תנאים"
              value={quote.terms}
              onChange={(e) => setQuote(prev => ({ ...prev, terms: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
            {/* העלאת קובץ PDF חיצוני + תצוגה מקדימה */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              קובץ PDF חיצוני
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PdfIcon />}
              sx={{ mb: 1 }}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                נבחר: {pdfFile.name}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={
                !pdfFile ||
                uploadPdfMutation.isPending ||
                !existingQuote?._id
              }
              onClick={async () => {
                if (!pdfFile) return;

                const quoteId = existingQuote?._id;
                if (!quoteId) return;

                uploadPdfMutation.mutate({ quoteId, file: pdfFile });
              }}
            >
              {uploadPdfMutation.isPending ? <CircularProgress size={20} /> : 'העלה PDF להצעה'}
            </Button>

            {quote.pdfUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  תצוגה מקדימה של ה‑PDF
                </Typography>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', height: 300 }}>
                  <iframe
                    title="תצוגה מקדימה של הצעת המחיר"
                    src={resolvePdfUrl(quote.pdfUrl)}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </Box>
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => openPdf(quote.pdfUrl)}
                  startIcon={<PdfIcon />}
                >
                  פתח בחלון חדש
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* סיכום מחירים */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>סיכום</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>סה"כ לפני מע"מ:</Typography>
                <Typography fontWeight={600}>₪{subtotal.toLocaleString()}</Typography>
              </Box>

              {quote.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>הנחה:</Typography>
                  <Typography fontWeight={600} color="error.light">
                    -₪{discountAmount.toLocaleString()}
                  </Typography>
                </Box>
              )}

              {quote.includeVat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>מע"מ ({quote.vatRate}%):</Typography>
                  <Typography fontWeight={600}>₪{vatAmount.toLocaleString()}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">סה"כ לתשלום:</Typography>
                <Typography variant="h4" fontWeight={700}>
                  ₪{total.toLocaleString()}
                </Typography>
              </Box>

              {!quote.includeVat && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  * המחיר אינו כולל מע"מ (עוסק פטור)
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuoteEditor;

