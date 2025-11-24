// frontend/src/pages/Dashboard.jsx

import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useClientStats, usePipelineStats } from '../admin/hooks/useClients';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: statsResponse } = useClientStats();
  const { data: pipelineResponse } = usePipelineStats();

  const stats = statsResponse?.data || {};
  const pipelineData = pipelineResponse?.data || {};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // כרטיסי סטטיסטיקה
  const statCards = [
    {
      title: 'סה\"כ לקוחות',
      value: stats.totalClients || 0,
      icon: <PeopleIcon />,
      color: '#1976d2',
      change: '+12%',
    },
    {
      title: 'לידים פעילים',
      value: stats.activeLeads || 0,
      icon: <TrendingUpIcon />,
      color: '#2e7d32',
      change: '+8%',
    },
    {
      title: 'עסקאות פתוחות',
      value: stats.activeDeals || 0,
      icon: <AssignmentIcon />,
      color: '#ed6c02',
      change: '+15%',
    },
    {
      title: 'הכנסות חודש זה',
      value: `₪${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: '#9c27b0',
      change: '+23%',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          דשבורד ניהול
        </Typography>
        <Typography variant="body1" color="text.secondary">
          סקירה כללית של המערכת
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  {card.icon}
                </Box>
                <Chip label={card.change} size="small" color="success" sx={{ height: 24 }} />
              </Box>
              <Typography variant="h4" gutterBottom>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Pipeline */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pipeline מכירות
            </Typography>
            <Box sx={{ height: 400, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData.pipeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="מספר לידים" />
                  <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="ערך פוטנציאלי" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Pipeline Details */}
            <Box sx={{ mt: 3 }}>
              {pipelineData.pipeline?.map((stage, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{stage.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stage.count} לידים • ₪{stage.value?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stage.count / (stats.totalClients || 1)) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>

            {/* Metrics Summary */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{pipelineData.metrics?.totalLeads || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    סה\"כ לידים
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{pipelineData.metrics?.wonDeals || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    עסקאות שנסגרו
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {pipelineData.metrics?.conversionRate || 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    שיעור המרה
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">
                    ₪{(pipelineData.metrics?.totalPipelineValue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ערך Pipeline
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Lead Sources */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              מקורות לידים
            </Typography>
            <Box sx={{ height: 250, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leadsBySource || []}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(stats.leadsBySource || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            <Box sx={{ mt: 2 }}>
              {stats.leadsBySource?.map((source, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2">{source._id}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {source.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Recent Activity */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">פעילות אחרונה</Typography>
              <IconButton size="small" onClick={() => navigate('/admin/clients')}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>

            <List>
              {stats.recentActivity?.map((activity, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/admin/clients/${activity._id}`)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {activity.personalInfo?.fullName?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.personalInfo?.fullName || 'לא ידוע'}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {activity.businessInfo?.businessName}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {activity.metadata?.lastContactedAt
                            ? new Date(
                                activity.metadata.lastContactedAt
                              ).toLocaleDateString('he-IL')
                            : 'אין תאריך'}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={activity.status}
                    size="small"
                    color={
                      activity.status === 'won'
                        ? 'success'
                        : activity.status === 'lead'
                        ? 'info'
                        : 'default'
                    }
                  />
                </ListItem>
              ))}

              {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    אין פעילות אחרונה
                  </Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>

        {/* Tasks & Reminders */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              משימות ותזכורות להיום
            </Typography>
            <Typography variant="body2" color="text.secondary">
              יישום משימות יבוא בקרוב...
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;


