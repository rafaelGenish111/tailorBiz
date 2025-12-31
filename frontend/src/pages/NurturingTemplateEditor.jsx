// frontend/src/pages/NurturingTemplateEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

const NurturingTemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [template, setTemplate] = useState({
    name: '',
    description: '',
    trigger: {
      type: 'manual',
      conditions: {}
    },
    sequence: [],
    isActive: true
  });

  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);

  // Fetch template if editing
  const { data: templateResponse, isLoading: templateLoading } = useQuery({
    queryKey: ['nurturing-template', id],
    queryFn: () => api.get(`/lead-nurturing/templates/${id}`).then(res => res.data),
    enabled: isEditMode && !!id
  });

  // Load template data
  useEffect(() => {
    if (templateResponse?.data && isEditMode) {
      setTemplate(templateResponse.data);
    }
  }, [templateResponse, isEditMode]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        return api.put(`/lead-nurturing/templates/${id}`, data);
      } else {
        return api.post('/lead-nurturing/templates', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nurturing-templates']);
      queryClient.invalidateQueries(['nurturing-template', id]);
      toast.success(isEditMode ? 'תבנית עודכנה בהצלחה' : 'תבנית נוצרה בהצלחה');
      navigate('/admin/nurturing');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בשמירת התבנית');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(template);
  };

  const handleAddStep = () => {
    const newStep = {
      step: template.sequence.length,
      delayDays: 0,
      actionType: 'send_whatsapp',
      content: {
        message: ''
      },
      stopIfResponse: true
    };
    setCurrentStep(newStep);
    setEditingStepIndex(null);
    setStepDialogOpen(true);
  };

  const handleEditStep = (index) => {
    setCurrentStep({ ...template.sequence[index] });
    setEditingStepIndex(index);
    setStepDialogOpen(true);
  };

  const handleDeleteStep = (index) => {
    const newSequence = template.sequence.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step: i }));
    setTemplate({ ...template, sequence: newSequence });
  };

  const handleSaveStep = () => {
    if (editingStepIndex !== null) {
      // Update existing step
      const newSequence = [...template.sequence];
      newSequence[editingStepIndex] = currentStep;
      setTemplate({ ...template, sequence: newSequence });
    } else {
      // Add new step
      const newSequence = [...template.sequence, { ...currentStep, step: template.sequence.length }];
      setTemplate({ ...template, sequence: newSequence });
    }
    setStepDialogOpen(false);
    setCurrentStep(null);
    setEditingStepIndex(null);
  };

  const getActionTypeLabel = (type) => {
    const labels = {
      send_whatsapp: '📱 WhatsApp',
      create_task: '✅ משימה',
      send_email: '📧 אימייל',
      update_client_status: '🔄 עדכון סטטוס',
      update_lead_score: '⭐ עדכון ציון',
      add_tag: '🏷️ תג',
      create_notification: '🔔 התראה'
    };
    return labels[type] || type;
  };

  if (templateLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/nurturing')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'עריכת תבנית' : 'תבנית חדשה'}
        </Typography>
      </Box>

      {/* Main Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="שם התבנית"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="תיאור"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>טריגר</InputLabel>
              <Select
                value={template.trigger?.type || 'manual'}
                onChange={(e) => setTemplate({
                  ...template,
                  trigger: { ...template.trigger, type: e.target.value }
                })}
                label="טריגר"
              >
                <MenuItem value="manual">👤 ידני</MenuItem>
                <MenuItem value="new_lead">🆕 ליד חדש</MenuItem>
                <MenuItem value="no_response">❄️ ללא תגובה</MenuItem>
                <MenuItem value="status_change">🔄 שינוי סטטוס</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>פעיל:</Typography>
              <Chip
                label={template.isActive ? 'פעיל' : 'לא פעיל'}
                color={template.isActive ? 'success' : 'default'}
                onClick={() => setTemplate({ ...template, isActive: !template.isActive })}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Sequence Steps */}
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">רצף הפעולות</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleAddStep}
          >
            הוסף שלב
          </Button>
        </Box>

        {template.sequence.length === 0 ? (
          <Alert severity="info">
            אין שלבים ברצף. לחץ על "הוסף שלב" כדי להתחיל.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {template.sequence.map((step, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={`שלב ${step.step + 1}`} size="small" />
                      <Chip label={getActionTypeLabel(step.actionType)} size="small" color="primary" />
                      {step.delayDays > 0 && (
                        <Chip label={`אחרי ${step.delayDays} ימים`} size="small" variant="outlined" />
                      )}
                    </Box>

                    {step.content?.message && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        {step.content.message}
                      </Typography>
                    )}

                    {step.content?.taskTitle && (
                      <Typography variant="body2" color="text.secondary">
                        משימה: {step.content.taskTitle}
                      </Typography>
                    )}

                    {step.stopIfResponse && (
                      <Chip label="מפסיק אם יש תגובה" size="small" color="warning" sx={{ mt: 1 }} />
                    )}
                  </Box>

                  <Box>
                    <IconButton size="small" onClick={() => handleEditStep(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteStep(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={() => navigate('/admin/nurturing')}>
          ביטול
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saveMutation.isPending || !template.name || template.sequence.length === 0}
        >
          {saveMutation.isPending ? 'שומר...' : 'שמור'}
        </Button>
      </Box>

      {/* Step Editor Dialog */}
      <Dialog
        open={stepDialogOpen}
        onClose={() => {
          setStepDialogOpen(false);
          setCurrentStep(null);
          setEditingStepIndex(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStepIndex !== null ? 'עריכת שלב' : 'הוספת שלב חדש'}
        </DialogTitle>
        <DialogContent>
          {currentStep && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>סוג פעולה</InputLabel>
                    <Select
                      value={currentStep.actionType}
                      onChange={(e) => setCurrentStep({
                        ...currentStep,
                        actionType: e.target.value,
                        content: { ...currentStep.content, message: currentStep.content?.message || '' }
                      })}
                      label="סוג פעולה"
                    >
                      <MenuItem value="send_whatsapp">📱 WhatsApp</MenuItem>
                      <MenuItem value="create_task">✅ משימה</MenuItem>
                      <MenuItem value="send_email">📧 אימייל</MenuItem>
                      <MenuItem value="update_client_status">🔄 עדכון סטטוס</MenuItem>
                      <MenuItem value="update_lead_score">⭐ עדכון ציון</MenuItem>
                      <MenuItem value="add_tag">🏷️ תג</MenuItem>
                      <MenuItem value="create_notification">🔔 התראה</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="עיכוב (ימים)"
                    value={currentStep.delayDays || 0}
                    onChange={(e) => setCurrentStep({
                      ...currentStep,
                      delayDays: parseInt(e.target.value) || 0
                    })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {(currentStep.actionType === 'send_whatsapp' || currentStep.actionType === 'send_email') && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="תוכן ההודעה"
                      value={currentStep.content?.message || ''}
                      onChange={(e) => setCurrentStep({
                        ...currentStep,
                        content: { ...currentStep.content, message: e.target.value }
                      })}
                      placeholder="הזן את תוכן ההודעה כאן..."
                      helperText={
                        <Box component="span">
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            משתנים זמינים (המערכת תחליף אותם אוטומטית):
                          </Typography>
                          <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip label="{name}" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                            <Chip label="{firstName}" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                            <Chip label="{business}" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                            <Chip label="{email}" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                            <Chip label="{phone}" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                          </Box>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            {'דוגמה: "היי {firstName}, תודה שפנית ל-{business}. אשמח לשוחח איתך בטלפון {phone}..."'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                )}

                {currentStep.actionType === 'create_task' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="כותרת המשימה"
                        value={currentStep.content?.taskTitle || ''}
                        onChange={(e) => setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, taskTitle: e.target.value }
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="תיאור המשימה"
                        value={currentStep.content?.taskDescription || ''}
                        onChange={(e) => setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, taskDescription: e.target.value }
                        })}
                      />
                    </Grid>
                  </>
                )}

                {currentStep.actionType === 'update_client_status' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>סטטוס חדש</InputLabel>
                      <Select
                        value={currentStep.content?.newStatus || ''}
                        onChange={(e) => setCurrentStep({
                          ...currentStep,
                          content: { ...currentStep.content, newStatus: e.target.value }
                        })}
                        label="סטטוס חדש"
                      >
                        <MenuItem value="lead">ליד</MenuItem>
                        <MenuItem value="contacted">נוצר קשר</MenuItem>
                        <MenuItem value="qualified">מותאם</MenuItem>
                        <MenuItem value="proposal">הצעה</MenuItem>
                        <MenuItem value="negotiation">משא ומתן</MenuItem>
                        <MenuItem value="won">זכייה</MenuItem>
                        <MenuItem value="lost">הפסד</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {currentStep.actionType === 'add_tag' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="שם התג"
                      value={currentStep.content?.tagName || ''}
                      onChange={(e) => setCurrentStep({
                        ...currentStep,
                        content: { ...currentStep.content, tagName: e.target.value }
                      })}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="stopIfResponse"
                      checked={currentStep.stopIfResponse || false}
                      onChange={(e) => setCurrentStep({
                        ...currentStep,
                        stopIfResponse: e.target.checked
                      })}
                    />
                    <label htmlFor="stopIfResponse">
                      <Typography variant="body2">
                        הפסק את הרצף אם הלקוח הגיב
                      </Typography>
                    </label>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStepDialogOpen(false);
            setCurrentStep(null);
            setEditingStepIndex(null);
          }}>
            ביטול
          </Button>
          <Button variant="contained" onClick={handleSaveStep}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NurturingTemplateEditor;

