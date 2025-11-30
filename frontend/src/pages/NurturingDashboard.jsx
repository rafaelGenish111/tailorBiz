// frontend/src/pages/NurturingDashboard.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const NurturingDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch templates
  const { data: templatesResponse, isLoading: templatesLoading } = useQuery({
    queryKey: ['nurturing-templates'],
    queryFn: () => api.get('/lead-nurturing/templates').then(res => res.data)
  });

  // Fetch stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['nurturing-stats'],
    queryFn: () => api.get('/lead-nurturing/stats').then(res => res.data)
  });

  // Toggle active mutation
  const toggleActive = useMutation({
    mutationFn: (id) => api.patch(`/lead-nurturing/templates/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['nurturing-templates']);
      queryClient.invalidateQueries(['nurturing-stats']);
      toast.success('סטטוס עודכן');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון סטטוס');
    }
  });

  // Delete mutation
  const deleteTemplate = useMutation({
    mutationFn: (id) => api.delete(`/lead-nurturing/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['nurturing-templates']);
      queryClient.invalidateQueries(['nurturing-stats']);
      toast.success('תבנית נמחקה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת תבנית');
    }
  });

  const templates = templatesResponse?.data || [];
  const stats = statsResponse?.data || {};

  const getTriggerLabel = (type) => {
    const labels = {
      new_lead: '🆕 ליד חדש',
      no_response: '❄️ ללא תגובה',
      status_change: '🔄 שינוי סטטוס',
      assessment_completed: '📋 אפיון הושלם',
      proposal_sent: '💼 הצעה נשלחה',
      manual: '👤 ידני'
    };
    return labels[type] || type;
  };

  if (templatesLoading || statsLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>טוען...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            🤖 ניהול אוטומציות טיפוח
          </Typography>
          <Typography variant="body1" color="text.secondary">
            רצפי follow-up אוטומטיים ללידים
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            toast.info('יצירת תבנית חדשה - יתווסף בהמשך');
          }}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          תבנית חדשה
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>תבניות פעילות</Typography>
            <Typography variant="h3">{stats.activeTemplates || 0}</Typography>
            <Typography variant="caption" color="text.secondary">
              מתוך {stats.totalTemplates || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>רצפים פעילים</Typography>
            <Typography variant="h3">{stats.activeInstances || 0}</Typography>
            <Typography variant="caption" color="text.secondary">
              לידים בטיפוח כרגע
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" gutterBottom>הושלמו</Typography>
            <Typography variant="h3">{stats.completedInstances || 0}</Typography>
            <Typography variant="caption" color="text.secondary">
              רצפים שהסתיימו
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom>הופסקו</Typography>
            <Typography variant="h3">{stats.stoppedInstances || 0}</Typography>
            <Typography variant="caption" color="text.secondary">
              הליד הגיב
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          💡 <strong>איך זה עובד?</strong> כשליד חדש נכנס או עומד בתנאים מסוימים, המערכת מפעילה אוטומטית רצף של פעולות
          (הודעות WhatsApp, משימות, התראות) לפי לוח הזמנים שהגדרת.
        </Typography>
      </Alert>

      {/* Templates Table */}
      <Card>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">תבניות זמינות</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>פעיל</TableCell>
                <TableCell>שם התבנית</TableCell>
                <TableCell>טריגר</TableCell>
                <TableCell>שלבים</TableCell>
                <TableCell>הופעל</TableCell>
                <TableCell>הושלם</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      אין תבניות. הרץ <code>npm run seed:nurturing</code> ב-backend כדי ליצור תבניות מוכנות.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell>
                      <Switch
                        checked={template.isActive}
                        onChange={() => toggleActive.mutate(template._id)}
                        color="success"
                        disabled={toggleActive.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTriggerLabel(template.trigger.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${template.sequence.length} שלבים`} size="small" />
                    </TableCell>
                    <TableCell>{template.stats?.totalTriggered || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {template.stats?.totalCompleted || 0}
                        {template.stats?.totalTriggered > 0 && (
                          <Chip
                            label={`${Math.round((template.stats.totalCompleted / template.stats.totalTriggered) * 100)}%`}
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setViewDialogOpen(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          toast.info('עריכת תבנית - יתווסף בהמשך');
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (window.confirm('למחוק תבנית זו?')) {
                            deleteTemplate.mutate(template._id);
                          }
                        }}
                        disabled={deleteTemplate.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Template Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                תיאור:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedTemplate.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                רצף הפעולות:
              </Typography>
              {selectedTemplate.sequence.map((step, index) => (
                <Card key={index} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    שלב {step.step + 1} - {step.actionType}
                    {step.delayDays > 0 && ` (אחרי ${step.delayDays} ימים)`}
                  </Typography>
                  {step.content.message && (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {step.content.message}
                    </Typography>
                  )}
                  {step.content.taskTitle && (
                    <Typography variant="body2" color="text.secondary">
                      משימה: {step.content.taskTitle}
                    </Typography>
                  )}
                  {step.content.notificationTitle && (
                    <Typography variant="body2" color="text.secondary">
                      התראה: {step.content.notificationTitle}
                    </Typography>
                  )}
                  {step.content.tagName && (
                    <Typography variant="body2" color="text.secondary">
                      תג: {step.content.tagName}
                    </Typography>
                  )}
                  {step.stopIfResponse && (
                    <Chip label="מפסיק אם יש תגובה" size="small" color="warning" sx={{ mt: 1 }} />
                  )}
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NurturingDashboard;

