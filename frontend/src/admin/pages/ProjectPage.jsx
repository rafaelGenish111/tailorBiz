import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, quotesAPI, invoiceAPI } from '../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/common/ConfirmDialog';

const STAGES = ['assessment', 'proposal', 'contract', 'active', 'completed'];
const STAGE_LABELS = {
  assessment: 'אפיון',
  proposal: 'הצעה',
  contract: 'חוזה',
  active: 'פעיל',
  completed: 'הושלם',
};

const REQUIREMENT_STATUS_LABELS = {
  new: 'חדש',
  reviewed: 'נבדק',
  approved: 'אושר',
  rejected: 'נדחה',
  implemented: 'מיושם',
};

const REQUIREMENT_PRIORITY_LABELS = {
  must: 'חובה',
  nice_to_have: 'רצוי',
};

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);

  const [requirementForm, setRequirementForm] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'must',
    estimatedHours: '',
    notes: '',
    source: 'form',
  });

  const { data: projectRes, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id).then((res) => res.data),
    enabled: !!id,
  });

  const project = projectRes?.data;
  const clientId = project?.clientId?._id || project?.clientId;

  const { data: invoicesRes } = useQuery({
    queryKey: ['invoices', clientId],
    queryFn: () =>
      invoiceAPI
        .getAll({
          clientId,
          limit: 50,
        })
        .then((res) => res.data),
    enabled: !!clientId,
  });

  const { data: quotesRes } = useQuery({
    queryKey: ['clientQuotes', clientId],
    queryFn: () => quotesAPI.getByClient(clientId).then((res) => res.data),
    enabled: !!clientId,
  });

  const addRequirementMutation = useMutation({
    mutationFn: (data) => projectsAPI.addRequirement(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]);
      setRequirementModalOpen(false);
      resetRequirementForm();
      toast.success('הדרישה נוספה');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בהוספת דרישה'),
  });

  const updateRequirementMutation = useMutation({
    mutationFn: ({ reqId, data }) =>
      projectsAPI.updateRequirement(id, reqId, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]);
      setRequirementModalOpen(false);
      setEditingRequirement(null);
      resetRequirementForm();
      toast.success('הדרישה עודכנה');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בעדכון דרישה'),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]);
      setEditingBudget(false);
      setBudgetSaving(false);
      toast.success('התקציב עודכן');
    },
    onError: (err) => {
      setBudgetSaving(false);
      toast.error(err?.response?.data?.message || 'שגיאה בעדכון תקציב');
    },
  });

  const deleteRequirementMutation = useMutation({
    mutationFn: (reqId) =>
      projectsAPI.deleteRequirement(id, reqId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]);
      setDeleteConfirmOpen(false);
      setRequirementToDelete(null);
      toast.success('הדרישה נמחקה');
    },
    onError: (err) => toast.error(err?.message || 'שגיאה במחיקת דרישה'),
  });

  const generateQuoteMutation = useMutation({
    mutationFn: () => quotesAPI.generateFromProject(id).then((res) => res.data),
    onSuccess: (resp) => {
      const quote = resp?.data;
      queryClient.invalidateQueries(['clientQuotes', clientId]);
      toast.success('הצעת המחיר נוצרה בהצלחה');
      if (quote?._id && clientId) {
        navigate(`/admin/clients/${clientId}?tab=quotes&editQuote=${quote._id}`);
      }
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'שגיאה ביצירת הצעת מחיר'),
  });

  const resetRequirementForm = () => {
    setRequirementForm({
      title: '',
      description: '',
      status: 'new',
      priority: 'must',
      estimatedHours: '',
      notes: '',
      source: 'form',
    });
  };

  const requirements = project?.requirements || [];
  const approvedRequirements = requirements.filter((r) => r.status === 'approved');
  const canGenerateQuote = approvedRequirements.length > 0;

  const invoices = invoicesRes?.data || [];
  const clientInvoices = invoices;

  const quotes = quotesRes?.data?.quotes || [];
  const projectQuotes = quotes.filter(
    (q) => q.projectId === id || q.projectId?._id === id
  );

  const activeStepIndex = Math.max(
    0,
    STAGES.indexOf(project?.stage) >= 0 ? STAGES.indexOf(project?.stage) : 0
  );

  const handleSaveBudget = () => {
    const num = parseInt(budgetValue, 10);
    if (isNaN(num) || num < 0) {
      toast.error('יש להזין תקציב תקין');
      return;
    }
    setBudgetSaving(true);
    const paid = project?.financials?.paidAmount ?? 0;
    updateProjectMutation.mutate({
      financials: {
        totalValue: num,
        paidAmount: paid,
        balance: num - paid,
      },
    });
  };

  const openEditBudget = () => {
    setBudgetValue(String(project?.financials?.totalValue ?? 0));
    setEditingBudget(true);
  };

  const openAddRequirement = () => {
    setEditingRequirement(null);
    resetRequirementForm();
    setRequirementModalOpen(true);
  };

  const openEditRequirement = (req) => {
    setEditingRequirement(req);
    setRequirementForm({
      title: req.title || '',
      description: req.description || '',
      status: req.status || 'new',
      priority: req.priority || 'must',
      estimatedHours: req.estimatedHours ?? '',
      notes: req.notes || '',
      source: req.source || 'form',
    });
    setRequirementModalOpen(true);
  };

  const handleSaveRequirement = () => {
    if (!requirementForm.title?.trim()) {
      toast.error('יש למלא כותרת');
      return;
    }
    const payload = {
      ...requirementForm,
      estimatedHours: Number(requirementForm.estimatedHours) || 0,
    };
    if (editingRequirement) {
      updateRequirementMutation.mutate({ reqId: editingRequirement._id, data: payload });
    } else {
      addRequirementMutation.mutate(payload);
    }
  };

  const handleDeleteRequirement = (req) => {
    setRequirementToDelete(req);
    setDeleteConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error?.response?.data?.message || 'פרויקט לא נמצא'}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
        onClick={() => navigate(clientId ? `/admin/clients/${clientId}` : -1)}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        חזור ללקוח
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">{project.name}</Typography>
        <Chip label={STAGE_LABELS[project.stage] || project.stage} color="primary" size="small" />
      </Box>

      <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ mb: 3 }}>
        {STAGES.map((stage, idx) => (
          <Step key={stage}>
            <StepLabel>{STAGE_LABELS[stage]}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="סקירה" />
        <Tab label="דרישות והיקף" />
        <Tab label="כספים" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* תיאור ותאריכים */}
          {(project.description || project.startDate || project.endDate) && (
            <Card variant="outlined" sx={{ overflow: 'visible' }}>
              <CardContent>
                {project.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: project.startDate || project.endDate ? 2 : 0 }}>
                    {project.description}
                  </Typography>
                )}
                {(project.startDate || project.endDate) && (
                  <Typography variant="body2" color="text.secondary">
                    {project.startDate && `התחלה: ${new Date(project.startDate).toLocaleDateString('he-IL')}`}
                    {project.startDate && project.endDate && ' • '}
                    {project.endDate && `סיום: ${new Date(project.endDate).toLocaleDateString('he-IL')}`}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* סיכום כספי */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">תקציב</Typography>
                  {!editingBudget ? (
                    <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={openEditBudget}>
                      ערוך
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" variant="contained" onClick={handleSaveBudget} disabled={budgetSaving}>
                        {budgetSaving ? <CircularProgress size={16} /> : 'שמור'}
                      </Button>
                      <Button size="small" onClick={() => setEditingBudget(false)}>ביטול</Button>
                    </Box>
                  )}
                </Box>
                {editingBudget ? (
                  <TextField
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    inputProps={{ min: 0 }}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="h5">₪{(project.financials?.totalValue ?? 0).toLocaleString()}</Typography>
                )}
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 180 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">שולם</Typography>
                <Typography variant="h5" color="success.main">₪{(project.financials?.paidAmount ?? 0).toLocaleString()}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 180 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">יתרה</Typography>
                <Typography variant="h5" color="error.main">₪{(project.financials?.balance ?? 0).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* סיכום פרויקט */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ minWidth: 140 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">דרישות</Typography>
                <Typography variant="h6">{requirements.length}</Typography>
                <Typography variant="caption" color="text.secondary">מאושרות: {approvedRequirements.length}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 140 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">הצעות מחיר</Typography>
                <Typography variant="h6">{projectQuotes.length}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 140 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">חשבוניות</Typography>
                <Typography variant="h6">{clientInvoices.length}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => generateQuoteMutation.mutate()}
              disabled={!canGenerateQuote || generateQuoteMutation.isPending}
              sx={{ fontWeight: 600 }}
            >
              {generateQuoteMutation.isPending
                ? 'יוצר...'
                : 'צור הצעת מחיר מדרישות מאושרות'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openAddRequirement}
            >
              הוסף דרישה
            </Button>
          </Box>

          {!canGenerateQuote && requirements.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              יש לאשר דרישות (סטטוס "אושר") כדי ליצור הצעת מחיר
            </Alert>
          )}

          {requirements.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                אין דרישות. הוסף דרישה ראשונה
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddRequirement}
                sx={{ mt: 2 }}
              >
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
                    <TableCell align="right">שעות משוערות</TableCell>
                    <TableCell align="center" width={80} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>{req.title}</TableCell>
                      <TableCell align="center">
                        {REQUIREMENT_PRIORITY_LABELS[req.priority] || req.priority}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={REQUIREMENT_STATUS_LABELS[req.status] || req.status}
                          size="small"
                          color={req.status === 'approved' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{req.estimatedHours || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openEditRequirement(req)}
                          aria-label="ערוך"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRequirement(req)}
                          aria-label="מחק"
                          color="error"
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
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {projectQuotes.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                הצעות מחיר
              </Typography>
              {projectQuotes.map((q) => (
                <Button
                  key={q._id}
                  startIcon={<ReceiptIcon />}
                  onClick={() =>
                    navigate(`/admin/clients/${clientId}?tab=quotes&editQuote=${q._id}`)
                  }
                  sx={{ display: 'block', textAlign: 'right', justifyContent: 'flex-start' }}
                >
                  {q.quoteNumber} - ₪{q.total?.toLocaleString()}
                </Button>
              ))}
            </Paper>
          )}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              חשבוניות
            </Typography>
            {clientInvoices.length === 0 ? (
              <Typography color="text.secondary">אין חשבוניות</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>מספר</TableCell>
                      <TableCell align="right">סכום</TableCell>
                      <TableCell align="center">סטטוס</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientInvoices.slice(0, 10).map((inv) => (
                      <TableRow key={inv._id}>
                        <TableCell>{inv.invoiceNumber}</TableCell>
                        <TableCell align="right">
                          ₪{inv.totalAmount?.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">{inv.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}

      <Dialog open={requirementModalOpen} onClose={() => setRequirementModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRequirement ? 'עריכת דרישה' : 'הוספת דרישה'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="כותרת"
              value={requirementForm.title}
              onChange={(e) =>
                setRequirementForm((p) => ({ ...p, title: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              label="תיאור"
              value={requirementForm.description}
              onChange={(e) =>
                setRequirementForm((p) => ({ ...p, description: e.target.value }))
              }
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                value={requirementForm.status}
                label="סטטוס"
                onChange={(e) =>
                  setRequirementForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                {Object.entries(REQUIREMENT_STATUS_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>עדיפות</InputLabel>
              <Select
                value={requirementForm.priority}
                label="עדיפות"
                onChange={(e) =>
                  setRequirementForm((p) => ({ ...p, priority: e.target.value }))
                }
              >
                {Object.entries(REQUIREMENT_PRIORITY_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="שעות משוערות"
              type="number"
              value={requirementForm.estimatedHours}
              onChange={(e) =>
                setRequirementForm((p) => ({ ...p, estimatedHours: e.target.value }))
              }
              inputProps={{ min: 0 }}
              fullWidth
            />
            <TextField
              label="הערות"
              value={requirementForm.notes}
              onChange={(e) =>
                setRequirementForm((p) => ({ ...p, notes: e.target.value }))
              }
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setRequirementModalOpen(false)}>ביטול</Button>
              <Button
                variant="contained"
                onClick={handleSaveRequirement}
                disabled={
                  addRequirementMutation.isPending || updateRequirementMutation.isPending
                }
              >
                שמור
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="מחיקת דרישה"
        content="האם למחוק את הדרישה?"
        onConfirm={() =>
          requirementToDelete && deleteRequirementMutation.mutate(requirementToDelete._id)
        }
        onClose={() => {
          setDeleteConfirmOpen(false);
          setRequirementToDelete(null);
        }}
        confirmColor="error"
      />
    </Box>
  );
};

export default ProjectPage;
