import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import BugReportIcon from '@mui/icons-material/BugReport';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TaskIcon from '@mui/icons-material/Task';
import EventIcon from '@mui/icons-material/Event';

import axios from 'axios';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const MotionCard = motion(Card);

const actionIcons = {
  send_email: EmailIcon,
  send_sms: SmsIcon,
  send_notification: NotificationsIcon,
  create_task: TaskIcon,
  create_calendar_event: EventIcon
};

const AutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/marketing/automations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAutomations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בטעינת אוטומציות');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      if (isActive) {
        await axios.post(
          `${API_URL}/marketing/automations/${id}/pause`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSnackbar({ open: true, message: 'אוטומציה הושהתה', severity: 'success' });
      } else {
        await axios.post(
          `${API_URL}/marketing/automations/${id}/activate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSnackbar({ open: true, message: 'אוטומציה הופעלה', severity: 'success' });
      }
      fetchAutomations();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בשינוי סטטוס', severity: 'error' });
    }
  };

  const handleTest = async (id) => {
    try {
      await axios.post(
        `${API_URL}/marketing/automations/${id}/test`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSnackbar({ open: true, message: 'אוטומציה הורצה במצב בדיקה', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בבדיקת אוטומציה', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האוטומציה?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/marketing/automations/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSnackbar({ open: true, message: 'אוטומציה נמחקה בהצלחה', severity: 'success' });
      fetchAutomations();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה במחיקת אוטומציה', severity: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="טוען אוטומציות..." />;
  }

  return (
    <Box sx={{ pb: 4, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            אוטומציות שיווק 🤖
          </Typography>
          <Typography variant="body1" color="text.secondary">
            הגדר פעולות אוטומטיות לחיסכון בזמן
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          אוטומציה חדשה
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Automations Grid */}
      <Grid container spacing={3}>
        {automations.map((automation, index) => (
          <Grid item xs={12} md={6} lg={4} key={automation._id}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={automation.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Switch
                    checked={automation.isActive}
                    onChange={() => handleToggle(automation._id, automation.isActive)}
                    size="small"
                  />
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {automation.name}
                </Typography>

                {automation.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {automation.description}
                  </Typography>
                )}

                {/* Trigger */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    טריגר:
                  </Typography>
                  <Typography variant="body2">
                    {automation.trigger?.type || 'לא מוגדר'}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                    פעולות ({automation.actions?.length || 0}):
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {automation.actions?.slice(0, 3).map((action, idx) => {
                      const Icon = actionIcons[action.type] || NotificationsIcon;
                      return (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Icon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={action.type}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      );
                    })}
                    {automation.actions?.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{automation.actions.length - 3} נוספות
                      </Typography>
                    )}
                  </List>
                </Box>

                {/* Stats */}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      הרצות
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {automation.stats?.totalRuns || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      הצלחה
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {automation.stats?.successfulRuns || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<BugReportIcon />}
                  onClick={() => handleTest(automation._id)}
                >
                  בדוק
                </Button>
                <Box>
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(automation._id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardActions>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {automations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין אוטומציות
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            צור את האוטומציה הראשונה שלך כדי להתחיל לחסוך זמן
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            צור אוטומציה
          </Button>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* TODO: Add Dialog for creating/editing automations */}
    </Box>
  );
};

export default AutomationsPage;



