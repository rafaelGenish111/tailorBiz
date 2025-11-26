import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { getOverview, getROIAnalysis, getCampaignsPerformance, getChannelsPerformance } from '../../../services/marketing/analyticsService';
import StatCard from '../../../components/marketing/shared/StatCard';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const MotionPaper = motion(Paper);

const COLORS = ['#1a237e', '#00bcd4', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [roiAnalysis, setRoiAnalysis] = useState(null);
  const [campaignsPerf, setCampaignsPerf] = useState([]);
  const [channelsPerf, setChannelsPerf] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const [overviewRes, roiRes, campaignsRes, channelsRes] = await Promise.all([
        getOverview(startDate.toISOString(), endDate.toISOString()),
        getROIAnalysis(startDate.toISOString(), endDate.toISOString()),
        getCampaignsPerformance({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
        getChannelsPerformance()
      ]);

      setOverview(overviewRes.data);
      setRoiAnalysis(roiRes.data);
      setCampaignsPerf(campaignsRes.data || []);
      setChannelsPerf(channelsRes.data || []);

    } catch (err) {
      setError(err.message || 'שגיאה בטעינת אנליטיקה');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    alert('ייצוא נתונים - בקרוב!');
  };

  if (loading) {
    return <LoadingSpinner message="טוען אנליטיקה..." />;
  }

  return (
    <Box sx={{ pb: 4, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            אנליטיקה ודוחות 📊
          </Typography>
          <Typography variant="body1" color="text.secondary">
            מעקב אחר ביצועי השיווק שלך
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>תקופה</InputLabel>
            <Select
              value={period}
              label="תקופה"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7">7 ימים אחרונים</MenuItem>
              <MenuItem value="30">30 ימים אחרונים</MenuItem>
              <MenuItem value="90">90 ימים אחרונים</MenuItem>
              <MenuItem value="365">שנה אחרונה</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
          >
            רענן
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            ייצא נתונים
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="קמפיינים פעילים"
            value={overview?.campaigns?.active || 0}
            subtitle={`מתוך ${overview?.campaigns?.total || 0} סה"כ`}
            icon={CampaignIcon}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ROI ממוצע"
            value={`${overview?.performance?.avgROI?.toFixed(1) || 0}%`}
            subtitle="תשואה על השקעה"
            icon={TrendingUpIcon}
            color="secondary"
            trend={overview?.performance?.avgROI > 0 ? 'up' : 'down'}
            trendValue={`${overview?.performance?.avgROI?.toFixed(1) || 0}%`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="לידים"
            value={overview?.performance?.totalLeads || 0}
            subtitle={`${period} ימים`}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="תקציב מנוצל"
            value={`₪${(overview?.financial?.totalSpent || 0).toLocaleString()}`}
            subtitle={`מתוך ₪${(overview?.financial?.totalBudget || 0).toLocaleString()}`}
            icon={AttachMoneyIcon}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* ROI Trend */}
        <Grid item xs={12} lg={8}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              מגמת ROI לאורך זמן
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiAnalysis?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#00bcd4"
                  strokeWidth={3}
                  name="ROI (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </MotionPaper>
        </Grid>

        {/* ROI by Type */}
        <Grid item xs={12} lg={4}>
          <MotionPaper
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ROI לפי סוג קמפיין
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roiAnalysis?.byType || []}
                  dataKey="roi"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(roiAnalysis?.byType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </MotionPaper>
        </Grid>

        {/* Campaigns Performance */}
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ביצועי קמפיינים
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignsPerf.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="roi" fill="#00bcd4" name="ROI (%)" />
                <Bar dataKey="leads" fill="#1a237e" name="לידים" />
              </BarChart>
            </ResponsiveContainer>
          </MotionPaper>
        </Grid>

        {/* Channels Performance */}
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ביצועי ערוצים
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelsPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="performance.roi" fill="#4caf50" name="ROI (%)" />
                <Bar dataKey="performance.clicks" fill="#ff9800" name="Clicks" />
                <Bar dataKey="performance.conversions" fill="#f44336" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </MotionPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;

