// frontend/src/pages/ActiveNurturing.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Stop as StopIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ActiveNurturing = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch instances
  const { data: instancesResponse, isLoading } = useQuery({
    queryKey: ['nurturing-instances', tabValue === 0 ? 'active' : tabValue === 1 ? 'completed' : 'stopped'],
    queryFn: () => {
      const status = tabValue === 0 ? 'active' : tabValue === 1 ? 'completed' : 'stopped';
      return api.get(`/lead-nurturing/instances?status=${status}`).then(res => res.data);
    }
  });

  // Stop instance mutation
  const stopInstance = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/lead-nurturing/instances/stop/${id}`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['nurturing-instances']);
      toast.success('רצף הופסק');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהפסקת רצף');
    }
  });

  const instances = instancesResponse?.data || [];

  const getStatusColor = (status) => {
    const colors = {
      active: 'primary',
      completed: 'success',
      stopped: 'warning',
      paused: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: '🔄 פעיל',
      completed: '✅ הושלם',
      stopped: '⏸️ הופסק',
      paused: '⏯️ מושהה'
    };
    return labels[status] || status;
  };

  const calculateProgress = (instance) => {
    if (!instance.nurturingTemplate) return 0;
    const totalSteps = instance.nurturingTemplate.sequence?.length || 1;
    return Math.round((instance.currentStep / totalSteps) * 100);
  };

  const handleStop = (instance) => {
    const reason = prompt('סיבת הפסקה (אופציונלי):');
    if (reason !== null) {
      stopInstance.mutate({ id: instance._id, reason: reason || 'הופסק ידנית' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>טוען...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔄 ניטור רצפי טיפוח פעילים
        </Typography>
        <Typography variant="body1" color="text.secondary">
          מעקב אחר לידים בתהליך אוטומציה
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: '#e3f2fd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {instances.filter(i => i.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  רצפים פעילים כעת
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: '#e8f5e9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {instances.filter(i => i.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הושלמו השבוע
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: '#fff3e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                <PauseIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {instances.filter(i => i.status === 'stopped').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הופסקו (הליד הגיב)
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="פעילים" />
          <Tab label="הושלמו" />
          <Tab label="הופסקו" />
        </Tabs>
      </Card>

      {/* Instances Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>לקוח</TableCell>
                <TableCell>תבנית</TableCell>
                <TableCell>התקדמות</TableCell>
                <TableCell>התחיל</TableCell>
                <TableCell>פעולה הבאה</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instances.length > 0 ? (
                instances.map((instance) => (
                  <TableRow key={instance._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar>
                          {instance.client?.personalInfo?.fullName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {instance.client?.personalInfo?.fullName || 'לא ידוע'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {instance.client?.businessInfo?.businessName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {instance.nurturingTemplate?.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ width: 150 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            שלב {instance.currentStep + 1} / {instance.nurturingTemplate?.sequence?.length || 0}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {calculateProgress(instance)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(instance)}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(instance.startedAt), {
                          addSuffix: true,
                          locale: he
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {instance.status === 'active' && instance.nextActionAt ? (
                        <Tooltip title={format(new Date(instance.nextActionAt), 'dd/MM/yyyy HH:mm')}>
                          <Chip
                            label={formatDistanceToNow(new Date(instance.nextActionAt), {
                              addSuffix: true,
                              locale: he
                            })}
                            size="small"
                            color="info"
                            icon={<ScheduleIcon />}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(instance.status)}
                        color={getStatusColor(instance.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setViewDialogOpen(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      {instance.status === 'active' && (
                        <IconButton
                          size="small"
                          onClick={() => handleStop(instance)}
                          disabled={stopInstance.isPending}
                        >
                          <StopIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {tabValue === 0 && 'אין רצפים פעילים כרגע'}
                        {tabValue === 1 && 'אין רצפים שהושלמו'}
                        {tabValue === 2 && 'אין רצפים שהופסקו'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Instance Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          פרטי רצף טיפוח
        </DialogTitle>
        <DialogContent>
          {selectedInstance && (
            <Box sx={{ mt: 2 }}>
              {/* Client Info */}
              <Card sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  פרטי הלקוח:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {selectedInstance.client?.personalInfo?.fullName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedInstance.client?.personalInfo?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedInstance.client?.businessInfo?.businessName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedInstance.client?.personalInfo?.phone}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Template Info */}
              <Typography variant="subtitle2" gutterBottom>
                תבנית: {selectedInstance.nurturingTemplate?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedInstance.nurturingTemplate?.description}
              </Typography>

              {/* Execution History */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                היסטוריית ביצוע:
              </Typography>
              {selectedInstance.executionHistory && selectedInstance.executionHistory.length > 0 ? (
                <Timeline>
                  {selectedInstance.executionHistory.map((execution, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={execution.success ? 'success' : 'error'}>
                          {execution.success ? <CheckIcon /> : <CancelIcon />}
                        </TimelineDot>
                        {index < selectedInstance.executionHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          שלב {execution.step + 1} - {execution.actionType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(execution.executedAt), 'dd/MM/yyyy HH:mm')}
                        </Typography>
                        {execution.response && (
                          <Typography variant="body2" color="text.secondary">
                            {execution.response}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  עדיין לא בוצעו פעולות
                </Typography>
              )}

              {/* Stop Reason */}
              {selectedInstance.stopReason && (
                <Card sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    סיבת הפסקה:
                  </Typography>
                  <Typography variant="body2">
                    {selectedInstance.stopReason}
                  </Typography>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>סגור</Button>
          {selectedInstance?.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={() => {
                handleStop(selectedInstance);
                setViewDialogOpen(false);
              }}
            >
              הפסק רצף
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveNurturing;

