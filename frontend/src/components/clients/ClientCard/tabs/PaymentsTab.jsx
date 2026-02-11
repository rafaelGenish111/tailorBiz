import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { clientAPI } from '../../../../admin/utils/api';

const PAYMENT_METHODS = ['העברה בנקאית', 'אשראי', 'מזומן', 'צ\'ק', 'PayPal', 'bit', 'אחר'];
const STATUS_LABELS = { pending: 'ממתין', paid: 'שולם', overdue: 'באיחור', partial: 'חלקי', cancelled: 'בוטל' };

const PaymentsTab = ({ client }) => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [planForm, setPlanForm] = useState({
    totalAmount: '',
    currency: 'ILS',
    paymentStructure: 'installments',
    numInstallments: 2,
    firstAmount: '',
  });
  const [paidForm, setPaidForm] = useState({ paymentMethod: 'העברה בנקאית' });

  const createPlanMutation = useMutation({
    mutationFn: (data) => clientAPI.createPaymentPlan(client._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', client._id]);
      toast.success('תוכנית תשלומים נוצרה בהצלחה');
      setCreateOpen(false);
      setPlanForm({ totalAmount: '', currency: 'ILS', paymentStructure: 'installments', numInstallments: 2, firstAmount: '' });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה'),
  });

  const updateInstallmentMutation = useMutation({
    mutationFn: ({ installmentId, data }) => clientAPI.updateInstallment(client._id, installmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', client._id]);
      toast.success('התשלום עודכן');
      setMarkPaidOpen(false);
      setSelectedInstallment(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה'),
  });

  const plan = client?.paymentPlan;
  const installments = plan?.installments || [];
  const totalAmount = plan?.totalAmount || 0;
  const totalPaid = installments.reduce((sum, i) => sum + (i.paidAmount || (i.status === 'paid' ? i.amount : 0)), 0);
  const balance = totalAmount - totalPaid;

  const handleCreatePlan = () => {
    const total = Number(planForm.totalAmount);
    if (!total || total <= 0) {
      toast.error('נא להזין סכום כולל');
      return;
    }
    const count = planForm.paymentStructure === 'one_time' ? 1 : Math.max(1, Math.min(24, Number(planForm.numInstallments) || 2));
    const first = planForm.firstAmount ? Number(planForm.firstAmount) : null;
    const rest = count > 1 ? (total - (first || 0)) / (count - 1) : total;

    const inst = [];
    let remaining = total;
    for (let i = 0; i < count; i++) {
      let amt;
      if (i === 0 && first != null) amt = first;
      else if (i === count - 1) amt = Math.round(remaining * 100) / 100;
      else amt = Math.round(rest * 100) / 100;
      inst.push({
        installmentNumber: i + 1,
        amount: amt,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
        description: count === 1 ? 'תשלום מלא' : `תשלום ${i + 1}`,
        status: 'pending',
      });
      remaining -= amt;
    }

    createPlanMutation.mutate({
      totalAmount: total,
      currency: planForm.currency,
      paymentStructure: planForm.paymentStructure,
      installments: inst,
    });
  };

  const handleMarkPaid = (inst) => {
    setSelectedInstallment(inst);
    setPaidForm({ paymentMethod: 'העברה בנקאית' });
    setMarkPaidOpen(true);
  };

  const confirmMarkPaid = () => {
    if (!selectedInstallment) return;
    updateInstallmentMutation.mutate({
      installmentId: selectedInstallment._id,
      data: { status: 'paid', paidAmount: selectedInstallment.amount, paidDate: new Date(), paymentMethod: paidForm.paymentMethod },
    });
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>תשלומים</Typography>
        {plan ? (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">סכום כולל</Typography>
                  <Typography variant="h6">₪{totalAmount.toLocaleString()}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">שולם</Typography>
                  <Typography variant="h6" color="success.main">₪{totalPaid.toLocaleString()}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">יתרה</Typography>
                  <Typography variant="h6" color={balance > 0 ? 'warning.main' : 'success.main'}>₪{balance.toLocaleString()}</Typography>
                </Paper>
              </Grid>
            </Grid>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>תיאור</TableCell>
                    <TableCell>סכום</TableCell>
                    <TableCell>תאריך יעד</TableCell>
                    <TableCell>סטטוס</TableCell>
                    <TableCell>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {installments.map((inst) => (
                    <TableRow key={inst._id}>
                      <TableCell>{inst.installmentNumber}</TableCell>
                      <TableCell>{inst.description || '-'}</TableCell>
                      <TableCell>₪{(inst.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('he-IL') : '-'}</TableCell>
                      <TableCell>
                        <Chip label={STATUS_LABELS[inst.status] || inst.status} size="small" color={inst.status === 'paid' ? 'success' : inst.status === 'overdue' ? 'error' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {inst.status !== 'paid' && (
                          <IconButton size="small" color="primary" onClick={() => handleMarkPaid(inst)} title="סמן שולם">
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {installments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                אין תשלומים בתוכנית. ניתן לעדכן את הלקוח עם תוכנית תשלומים מלאה.
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ py: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              אין תוכנית תשלומים. הוסף תוכנית חדשה.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              צור תוכנית תשלומים
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>תוכנית תשלומים חדשה</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="סכום כולל (₪)" type="number" fullWidth value={planForm.totalAmount} onChange={(e) => setPlanForm({ ...planForm, totalAmount: e.target.value })} inputProps={{ min: 1 }} />
            <FormControl fullWidth>
              <InputLabel>מבנה</InputLabel>
              <Select value={planForm.paymentStructure} label="מבנה" onChange={(e) => setPlanForm({ ...planForm, paymentStructure: e.target.value })}>
                <MenuItem value="one_time">תשלום אחד</MenuItem>
                <MenuItem value="installments">תשלומים</MenuItem>
              </Select>
            </FormControl>
            {planForm.paymentStructure === 'installments' && (
              <>
                <TextField label="מספר תשלומים" type="number" fullWidth value={planForm.numInstallments} onChange={(e) => setPlanForm({ ...planForm, numInstallments: e.target.value })} inputProps={{ min: 1, max: 24 }} />
                <TextField label="מקדמה (תשלום ראשון, אופציונלי)" type="number" fullWidth value={planForm.firstAmount} onChange={(e) => setPlanForm({ ...planForm, firstAmount: e.target.value })} inputProps={{ min: 0 }} />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleCreatePlan} disabled={createPlanMutation.isLoading}>צור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={markPaidOpen} onClose={() => setMarkPaidOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>סמן תשלום כ־שולם</DialogTitle>
        <DialogContent>
          {selectedInstallment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2">סכום: ₪{(selectedInstallment.amount || 0).toLocaleString()}</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>אמצעי תשלום</InputLabel>
                <Select value={paidForm.paymentMethod} label="אמצעי תשלום" onChange={(e) => setPaidForm({ ...paidForm, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkPaidOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={confirmMarkPaid} disabled={updateInstallmentMutation.isLoading}>אישור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const PaymentsTabWithProvider = (props) => (
  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
    <PaymentsTab {...props} />
  </LocalizationProvider>
);

export default PaymentsTabWithProvider;
