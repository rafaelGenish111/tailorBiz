import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';

// Components
import StatCard from '../../../components/marketing/shared/StatCard';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';
import UpcomingCampaigns from '../../../components/marketing/dashboard/UpcomingCampaigns';
import PerformanceChart from '../../../components/marketing/dashboard/PerformanceChart';
import InsightsPanel from '../../../components/marketing/dashboard/InsightsPanel';

// Hooks & Services
import { useUpcomingCampaigns } from '../../../hooks/marketing/useCampaigns';
import { getOverview, getInsights } from '../../../services/marketing/analyticsService';

const MotionBox = motion(Box);

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { campaigns: upcomingCampaigns, loading: campaignsLoading } = useUpcomingCampaigns(30);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview
      const overviewResponse = await getOverview();
      setOverview(overviewResponse.data);

      // Fetch insights
      const insightsResponse = await getInsights();
      setInsights(insightsResponse.data || []);

    } catch (err) {
      setError(err.message || 'שגיאה בטעינת נתונים');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="טוען דשבורד..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            מרכז שיווק 📊
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול מרכזי של כל פעילות השיווק
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/marketing/campaigns/new')}
          sx={{ borderRadius: 2 }}
        >
          קמפיין חדש
        </Button>
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
            trend="up"
            trendValue="+12% מחודש שעבר"
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
            trendValue={`${overview?.performance?.avgROI > 0 ? '+' : ''}${overview?.performance?.avgROI?.toFixed(1) || 0}%`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="לידים"
            value={overview?.performance?.totalLeads || 0}
            subtitle="30 ימים אחרונים"
            icon={PeopleIcon}
            color="primary"
            trend="up"
            trendValue="+24 מאתמול"
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

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Upcoming Campaigns */}
        <Grid item xs={12} lg={8}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UpcomingCampaigns 
              campaigns={upcomingCampaigns} 
              loading={campaignsLoading}
            />
          </MotionBox>

          {/* Performance Chart */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ mt: 3 }}
          >
            <PerformanceChart data={overview} />
          </MotionBox>
        </Grid>

        {/* Insights Panel */}
        <Grid item xs={12} lg={4}>
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <InsightsPanel insights={insights} />
          </MotionBox>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          פעולות מהירות
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/marketing/campaigns')}
            >
              ניהול קמפיינים
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/marketing/channels')}
            >
              ערוצי שיווק
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/marketing/analytics')}
            >
              אנליטיקה
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/marketing/automations')}
            >
              אוטומציות
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MarketingDashboard;


