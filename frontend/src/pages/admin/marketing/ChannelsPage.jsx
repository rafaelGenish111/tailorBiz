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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SyncIcon from '@mui/icons-material/Sync';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import axios from 'axios';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MotionCard = motion(Card);

const channelIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  email: EmailIcon,
  whatsapp: WhatsAppIcon,
  google: TrendingUpIcon
};

const channelColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  email: '#EA4335',
  whatsapp: '#25D366',
  google: '#4285F4'
};

const ChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    type: 'social_media',
    platform: 'facebook',
    budget: {
      monthly: 0
    },
    isActive: true
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/marketing/channels`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setChannels(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בטעינת ערוצים');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (channel = null) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({
        name: channel.name,
        type: channel.type,
        platform: channel.platform,
        budget: channel.budget || { monthly: 0 },
        isActive: channel.isActive
      });
    } else {
      setEditingChannel(null);
      setFormData({
        name: '',
        type: 'social_media',
        platform: 'facebook',
        budget: { monthly: 0 },
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChannel(null);
  };

  const handleSave = async () => {
    try {
      if (editingChannel) {
        await axios.put(
          `${API_URL}/marketing/channels/${editingChannel._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({ open: true, message: 'ערוץ עודכן בהצלחה', severity: 'success' });
      } else {
        await axios.post(
          `${API_URL}/marketing/channels`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({ open: true, message: 'ערוץ נוצר בהצלחה', severity: 'success' });
      }
      handleCloseDialog();
      fetchChannels();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בשמירת ערוץ', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הערוץ?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/marketing/channels/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSnackbar({ open: true, message: 'ערוץ נמחק בהצלחה', severity: 'success' });
      fetchChannels();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה במחיקת ערוץ', severity: 'error' });
    }
  };

  const handleConnect = async (id) => {
    try {
      await axios.post(
        `${API_URL}/marketing/channels/${id}/connect`,
        { apiKey: 'demo-key' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSnackbar({ open: true, message: 'ערוץ חובר בהצלחה', severity: 'success' });
      fetchChannels();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בחיבור ערוץ', severity: 'error' });
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await axios.post(
        `${API_URL}/marketing/channels/${id}/disconnect`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSnackbar({ open: true, message: 'ערוץ נותק בהצלחה', severity: 'success' });
      fetchChannels();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בניתוק ערוץ', severity: 'error' });
    }
  };

  const handleSync = async (id) => {
    try {
      await axios.post(
        `${API_URL}/marketing/channels/${id}/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSnackbar({ open: true, message: 'ערוץ סונכרן בהצלחה', severity: 'success' });
      fetchChannels();
    } catch (err) {
      setSnackbar({ open: true, message: 'שגיאה בסנכרון ערוץ', severity: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="טוען ערוצים..." />;
  }

  return (
    <Box sx={{ pb: 4, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            ערוצי שיווק 📡
          </Typography>
          <Typography variant="body1" color="text.secondary">
            נהל את כל ערוצי השיווק שלך במקום אחד
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          ערוץ חדש
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Channels Grid */}
      <Grid container spacing={3}>
        {channels.map((channel, index) => {
          const Icon = channelIcons[channel.platform] || TrendingUpIcon;
          const color = channelColors[channel.platform] || '#666';
          const budgetUsage = channel.budget?.monthly > 0 
            ? ((channel.budget?.spent || 0) / channel.budget.monthly * 100) 
            : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={channel._id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: channel.integration?.connected ? 'success.main' : 'divider',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color }} />
                    </Box>
                    <Box>
                      <Chip
                        label={channel.isActive ? 'פעיל' : 'לא פעיל'}
                        size="small"
                        color={channel.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>

                  {/* Name */}
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {channel.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={channel.type} size="small" variant="outlined" />
                    <Chip label={channel.platform} size="small" />
                  </Box>

                  {/* Connection Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {channel.integration?.connected ? (
                      <>
                        <LinkIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main">
                          מחובר
                        </Typography>
                      </>
                    ) : (
                      <>
                        <LinkOffIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          לא מחובר
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Budget */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        תקציב חודשי
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {budgetUsage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budgetUsage, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: budgetUsage > 90 ? 'error.main' : color
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      ₪{(channel.budget?.spent || 0).toLocaleString()} / ₪{(channel.budget?.monthly || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Performance */}
                  {channel.performance && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Clicks
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {channel.performance.clicks?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            CTR
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {channel.performance.ctr?.toFixed(2) || 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ROI
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {channel.performance.roi?.toFixed(1) || 0}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {channel.integration?.connected ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleSync(channel._id)}
                          title="סנכרן"
                        >
                          <SyncIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDisconnect(channel._id)}
                          title="נתק"
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={() => handleConnect(channel._id)}
                      >
                        חבר
                      </Button>
                    )}
                  </Box>

                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(channel)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(channel._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </MotionCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {channels.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין ערוצים
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            הוסף את הערוץ הראשון שלך כדי להתחיל
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            הוסף ערוץ
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingChannel ? 'עריכת ערוץ' : 'ערוץ חדש'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="שם הערוץ"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="סוג"
              select
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="social_media">Social Media</MenuItem>
              <MenuItem value="paid_ads">Paid Ads</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </TextField>

            <TextField
              label="פלטפורמה"
              select
              fullWidth
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="google">Google</MenuItem>
              <MenuItem value="email_service">Email Service</MenuItem>
              <MenuItem value="whatsapp_business">WhatsApp Business</MenuItem>
            </TextField>

            <TextField
              label="תקציב חודשי (₪)"
              type="number"
              fullWidth
              value={formData.budget.monthly}
              onChange={(e) => setFormData({
                ...formData,
                budget: { ...formData.budget, monthly: Number(e.target.value) }
              })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="ערוץ פעיל"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">
            {editingChannel ? 'עדכן' : 'צור'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default ChannelsPage;


