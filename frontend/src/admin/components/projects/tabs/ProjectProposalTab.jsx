import React, { useState, useRef, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Divider, CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  PictureAsPdf as PdfIcon, UploadFile as UploadIcon,
  ArrowBack as BackIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../common/ConfirmDialog';

const STATUS_LABELS = {
  draft: 'טיוטה', sent: 'נשלח', viewed: 'נצפה',
  accepted: 'אושר', rejected: 'נדחה', expired: 'פג תוקף',
};
const STATUS_COLORS = {
  draft: 'default', sent: 'info', viewed: 'warning',
  accepted: 'success', rejected: 'error', expired: 'default',
};

const BILLING_LABELS = { one_time: 'חד פעמי', retainer: 'ריטיינר (חודשי)' };

const emptyItem = { name: '', description: '', quantity: 1, unitPrice: 0 };

const ProjectProposalTab = ({ project, projectId }) => {
  const queryClient = useQueryClient();
  const clientId = project?.clientId?._id || project?.clientId;
  const fileInputRef = useRef(null);

  // Views: 'list' | 'editor'
  const [view, setView] = useState('list');
  const [editingQuote, setEditingQuote] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  // Editor form state
  const [form, setForm] = useState({
    title: 'הצעת מחיר',
    items: [{ ...emptyItem }],
    billingType: 'one_time',
    includeVat: true,
    vatRate: 18,
    discount: 0,
    discountType: 'fixed',
    notes: '',
    terms: '',
    validUntil: '',
    status: 'draft',
  });

  // Fetch quotes for this project
  const { data: quotesRes, isLoading } = useQuery({
    queryKey: ['projectQuotes', projectId],
    queryFn: () => quotesAPI.getByProject(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
  const quotes = quotesRes?.data?.quotes || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => quotesAPI.create(clientId, { ...data, projectId }),
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['projectQuotes', projectId]);
      const created = resp?.data?.data;
      toast.success('הצעת מחיר נוצרה');
      if (created) {
        setEditingQuote(created);
        loadQuoteToForm(created);
      }
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה ביצירה'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => quotesAPI.update(id, data),
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['projectQuotes', projectId]);
      const updated = resp?.data?.data;
      toast.success('הצעת מחיר עודכנה');
      if (updated) {
        setEditingQuote(updated);
      }
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בעדכון'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => quotesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectQuotes', projectId]);
      setDeleteConfirmOpen(false);
      setQuoteToDelete(null);
      toast.success('הצעת מחיר נמחקה');
    },
  });

  const generatePdfMutation = useMutation({
    mutationFn: (quoteId) => quotesAPI.generatePDF(quoteId),
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['projectQuotes', projectId]);
      const pdfUrl = resp?.data?.data?.pdfUrl;
      if (pdfUrl) {
        setEditingQuote((prev) => prev ? { ...prev, pdfUrl } : prev);
      }
      toast.success('PDF נוצר בהצלחה');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה ביצירת PDF'),
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({ quoteId, formData }) => quotesAPI.uploadPDF(quoteId, formData),
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['projectQuotes', projectId]);
      const pdfUrl = resp?.data?.data?.pdfUrl;
      if (pdfUrl) {
        setEditingQuote((prev) => prev ? { ...prev, pdfUrl } : prev);
      }
      toast.success('קובץ הועלה בהצלחה');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בהעלאה'),
  });

  // Computed
  const calculated = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0
    );
    let discountAmount = 0;
    if (form.discount > 0) {
      discountAmount = form.discountType === 'percentage'
        ? subtotal * (form.discount / 100)
        : Number(form.discount);
    }
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = form.includeVat ? afterDiscount * (form.vatRate / 100) : 0;
    const total = afterDiscount + vatAmount;
    return { subtotal, discountAmount, vatAmount, total };
  }, [form.items, form.discount, form.discountType, form.includeVat, form.vatRate]);

  // Helpers
  const loadQuoteToForm = (quote) => {
    setForm({
      title: quote.title || 'הצעת מחיר',
      items: (quote.items?.length ? quote.items : [{ ...emptyItem }]).map((i) => ({
        name: i.name || '', description: i.description || '',
        quantity: i.quantity ?? 1, unitPrice: i.unitPrice ?? 0,
      })),
      billingType: quote.billingType || 'one_time',
      includeVat: quote.includeVat !== false,
      vatRate: quote.vatRate ?? 18,
      discount: quote.discount ?? 0,
      discountType: quote.discountType || 'fixed',
      notes: quote.notes || '',
      terms: quote.terms || '',
      validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : '',
      status: quote.status || 'draft',
    });
  };

  const openNewQuote = () => {
    setEditingQuote(null);
    setForm({
      title: `הצעת מחיר - ${project?.name || ''}`,
      items: [{ ...emptyItem }],
      billingType: 'one_time',
      includeVat: true, vatRate: 18,
      discount: 0, discountType: 'fixed',
      notes: '', terms: '', validUntil: '', status: 'draft',
    });
    setView('editor');
  };

  const openEditQuote = (quote) => {
    setEditingQuote(quote);
    loadQuoteToForm(quote);
    setView('editor');
  };

  const handleSave = () => {
    if (form.items.every((i) => !i.name?.trim())) {
      toast.error('נא להוסיף לפחות מוצר אחד');
      return;
    }
    const payload = {
      title: form.title,
      items: form.items.filter((i) => i.name?.trim()).map((i) => ({
        name: i.name,
        description: i.description,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.unitPrice) || 0,
        totalPrice: (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
      })),
      billingType: form.billingType,
      includeVat: form.includeVat,
      vatRate: Number(form.vatRate) || 18,
      discount: Number(form.discount) || 0,
      discountType: form.discountType,
      notes: form.notes,
      terms: form.terms,
      validUntil: form.validUntil || undefined,
      status: form.status,
    };

    if (editingQuote?._id) {
      updateMutation.mutate({ id: editingQuote._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingQuote?._id) return;
    const fd = new FormData();
    fd.append('pdf', file);
    uploadFileMutation.mutate({ quoteId: editingQuote._id, formData: fd });
    e.target.value = '';
  };

  // Item helpers
  const updateItem = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };
  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  };
  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== idx) : prev.items,
    }));
  };

  // =================== LIST VIEW ===================
  if (view === 'list') {
    if (isLoading) return <CircularProgress />;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">הצעות מחיר</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNewQuote}>
            צור הצעת מחיר חדשה
          </Button>
        </Box>

        {quotes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>אין הצעות מחיר לפרויקט זה</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNewQuote}>
              צור הצעת מחיר ראשונה
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>מספר</TableCell>
                  <TableCell>כותרת</TableCell>
                  <TableCell align="center">סטטוס</TableCell>
                  <TableCell align="right">סה"כ</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell align="center" width={100}>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow
                    key={q._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => openEditQuote(q)}
                  >
                    <TableCell>{q.quoteNumber || '-'}</TableCell>
                    <TableCell>{q.title || 'הצעת מחיר'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={STATUS_LABELS[q.status] || q.status}
                        size="small"
                        color={STATUS_COLORS[q.status] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ₪{(q.total || 0).toLocaleString()}
                      {q.billingType === 'retainer' && <Typography variant="caption" color="text.secondary"> /חודש</Typography>}
                    </TableCell>
                    <TableCell>
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('he-IL') : '-'}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => openEditQuote(q)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small" color="error"
                        onClick={() => { setQuoteToDelete(q); setDeleteConfirmOpen(true); }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <ConfirmDialog
          open={deleteConfirmOpen}
          title="מחיקת הצעת מחיר"
          content={`האם למחוק את הצעת מחיר ${quoteToDelete?.quoteNumber || ''}?`}
          onConfirm={() => quoteToDelete && deleteMutation.mutate(quoteToDelete._id)}
          onClose={() => { setDeleteConfirmOpen(false); setQuoteToDelete(null); }}
          confirmColor="error"
        />
      </Box>
    );
  }

  // =================== EDITOR VIEW ===================
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={<BackIcon />} onClick={() => setView('list')}>
          חזרה לרשימה
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {editingQuote ? `עריכת ${editingQuote.quoteNumber || 'הצעה'}` : 'הצעת מחיר חדשה'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {editingQuote?._id && (
            <>
              <Button
                variant="outlined" startIcon={<PdfIcon />}
                onClick={() => generatePdfMutation.mutate(editingQuote._id)}
                disabled={generatePdfMutation.isPending}
              >
                {generatePdfMutation.isPending ? 'יוצר...' : 'צור PDF'}
              </Button>
              <Button
                variant="outlined" startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadFileMutation.isPending}
              >
                העלה מסמך
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
            </>
          )}
          <Button
            variant="contained" startIcon={<SaveIcon />}
            onClick={handleSave} disabled={isSaving}
          >
            {isSaving ? 'שומר...' : 'שמור'}
          </Button>
        </Box>
      </Box>

      {/* Title & Status */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="כותרת"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>סוג חיוב</InputLabel>
            <Select
              value={form.billingType}
              label="סוג חיוב"
              onChange={(e) => setForm({ ...form, billingType: e.target.value })}
            >
              {Object.entries(BILLING_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>סטטוס</InputLabel>
            <Select
              value={form.status}
              label="סטטוס"
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="תוקף עד"
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
        </Box>
      </Paper>

      {/* Items Table */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>מוצרים / שירותים</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addItem}>הוסף שורה</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 160 }}>שם</TableCell>
                <TableCell sx={{ minWidth: 140 }}>תיאור</TableCell>
                <TableCell align="center" sx={{ width: 80 }}>כמות</TableCell>
                <TableCell align="right" sx={{ width: 120 }}>מחיר ליחידה</TableCell>
                <TableCell align="right" sx={{ width: 100 }}>סה"כ</TableCell>
                <TableCell align="center" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {form.items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        size="small" fullWidth variant="standard"
                        placeholder="שם מוצר"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" fullWidth variant="standard"
                        placeholder="תיאור"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small" variant="standard" type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small" variant="standard" type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                        inputProps={{ min: 0, style: { textAlign: 'right' } }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">₪{lineTotal.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 420, ml: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>סכום ביניים:</Typography>
            <Typography>₪{calculated.subtotal.toLocaleString()}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ minWidth: 50 }}>הנחה:</Typography>
            <TextField
              size="small" type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              inputProps={{ min: 0 }}
              sx={{ width: 100 }}
            />
            <Select
              size="small"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              sx={{ width: 80 }}
            >
              <MenuItem value="fixed">₪</MenuItem>
              <MenuItem value="percentage">%</MenuItem>
            </Select>
            {calculated.discountAmount > 0 && (
              <Typography color="error.main" variant="body2">
                -₪{calculated.discountAmount.toLocaleString()}
              </Typography>
            )}
          </Box>

          {calculated.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">לאחר הנחה:</Typography>
              <Typography>₪{(calculated.subtotal - calculated.discountAmount).toLocaleString()}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.includeVat}
                  onChange={(e) => setForm({ ...form, includeVat: e.target.checked })}
                  size="small"
                />
              }
              label={`מע"מ`}
            />
            <TextField
              size="small" type="number"
              value={form.vatRate}
              onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              sx={{ width: 70 }}
              disabled={!form.includeVat}
            />
            <Typography variant="body2" color="text.secondary">%</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography fontWeight={form.includeVat ? 600 : 400}>
              ₪{calculated.vatAmount.toLocaleString()}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h6" fontWeight={700}>
              סה"כ{form.includeVat ? ' (כולל מע"מ)' : ' (ללא מע"מ)'}:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ₪{calculated.total.toLocaleString()}
              {form.billingType === 'retainer' && (
                <Typography component="span" variant="body2" color="text.secondary"> / חודש</Typography>
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Notes & Terms */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="הערות"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            multiline rows={2} sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="תנאים"
            value={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.value })}
            multiline rows={2} sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>
      </Paper>

      {/* PDF Preview */}
      {editingQuote?.pdfUrl && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            תצוגת PDF
          </Typography>
          {editingQuote.pdfUrl.startsWith('data:') ? (
            <Box
              component="iframe"
              src={editingQuote.pdfUrl}
              sx={{ width: '100%', height: 500, border: 'none', borderRadius: 1 }}
            />
          ) : (
            <Button
              variant="outlined"
              onClick={() => window.open(editingQuote.pdfUrl, '_blank')}
            >
              פתח PDF
            </Button>
          )}
        </Paper>
      )}

      {!editingQuote?._id && (
        <Alert severity="info" sx={{ mt: 2 }}>
          שמור את ההצעה כדי לאפשר יצירת PDF והעלאת מסמכים
        </Alert>
      )}
    </Box>
  );
};

export default ProjectProposalTab;
