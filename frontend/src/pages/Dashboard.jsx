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
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
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
  AreaChart,
  Area,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: statsResponse } = useClientStats();
  const { data: pipelineResponse } = usePipelineStats();

  const stats = statsResponse?.data || {};
  const pipelineData = pipelineResponse?.data || {};

  // AWS Palette inspired
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // כרטיסי סטטיסטיקה - מעוצבים מחדש
  const statCards = [
    {
      title: 'סה"כ לקוחות',
      value: stats.totalClients || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main,
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'לידים פעילים',
      value: stats.activeLeads || 0,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#2e7d32',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'עסקאות פתוחות',
      value: stats.activeDeals || 0,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#ed6c02',
      change: '-2%',
      trend: 'down',
    },
    {
      title: 'הכנסות חודש זה',
      value: `₪${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <MoneyIcon fontSize="large" />,
      color: '#9c27b0',
      change: '+23%',
      trend: 'up',
    },
  ];

  return (
    <Box sx={{ pb: 4, width: '100%' }}>
      {/* Header Area */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
            דשבורד ניהול
          </Typography>
          <Typography variant="body1" color="text.secondary">
            סקירה כללית של ביצועי העסק ומדדים מרכזיים
          </Typography>
        </Box>
        <Box>
            <Button variant="contained" color="secondary" startIcon={<AssignmentIcon />}>
                דוח חדש
            </Button>
        </Box>
      </Box>

      {/* Stat Cards - Full Width Row - 3 cards per row on large screens */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                minHeight: 160,
                position: 'relative',
                overflow: 'hidden',
                borderTop: `4px solid ${card.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                   <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.85rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: `${card.color}15`,
                    color: card.color,
                    ml: 2,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                 <Chip 
                    label={card.change} 
                    size="small" 
                    color={card.trend === 'up' ? 'success' : 'error'} 
                    variant="filled"
                    sx={{ height: 24, fontWeight: 'bold', fontSize: '0.8rem' }}
                 />
                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    לעומת חודש שעבר
                 </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Pipeline & Tasks - Larger Area */}
        <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
                {/* Pipeline Chart - Larger */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold">Pipeline מכירות</Typography>
                            <IconButton size="small"><MoreVertIcon /></IconButton>
                        </Box>
                        <Box sx={{ height: 450, mt: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData.pipeline || []} barSize={50}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" fill="#3f51b5" name="מספר לידים" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="value" fill="#ff9800" name="ערך פוטנציאלי" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                 {/* Tasks / Pipeline Details - Larger */}
                 <Grid item xs={12}>
                     <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>פירוט שלבים ב-Pipeline</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        {pipelineData.pipeline?.map((stage, index) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography variant="body1" fontWeight={600}>{stage.name}</Typography>
                                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    {stage.count} לידים | ₪{stage.value?.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(stage.count / (stats.totalClients || 1)) * 100}
                                    sx={{ 
                                        height: 12, 
                                        borderRadius: 6,
                                        bgcolor: 'grey.200',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 6,
                                            bgcolor: COLORS[index % COLORS.length]
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                        </Box>
                     </Paper>
                 </Grid>
            </Grid>
        </Grid>

        {/* Right Column: Lead Sources & Activity - Side Panel */}
        <Grid item xs={12} lg={4}>
            <Grid container spacing={3} direction="column" sx={{ height: '100%' }}>
                {/* Lead Sources Pie - Larger */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>מקורות לידים</Typography>
                        <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={stats.leadsBySource || []}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={5}
                                >
                                    {(stats.leadsBySource || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Activity Feed - Larger */}
                <Grid item xs={12} sx={{ flexGrow: 1 }}>
                    <Paper sx={{ p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="h5" fontWeight="bold">פעילות אחרונה</Typography>
                             <Button size="small" onClick={() => navigate('/admin/clients')} endIcon={<ArrowForwardIcon />}>
                                הכל
                             </Button>
                        </Box>
                        
                        <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
                        {stats.recentActivity?.map((activity, index) => (
                            <React.Fragment key={index}>
                                <ListItem
                                button
                                onClick={() => navigate(`/admin/clients/${activity._id}`)}
                                sx={{ 
                                    p: 2.5, 
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], fontWeight: 'bold', width: 40, height: 40 }}>
                                    {activity.personalInfo?.fullName?.charAt(0) || '?'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {activity.personalInfo?.fullName || 'לא ידוע'}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {activity.businessInfo?.businessName}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {activity.metadata?.lastContactedAt
                                                    ? new Date(activity.metadata.lastContactedAt).toLocaleDateString('he-IL')
                                                    : 'לא נוצר קשר'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <Chip
                                    label={activity.status}
                                    size="small"
                                    sx={{ 
                                        height: 26, 
                                        fontSize: '0.75rem',
                                        bgcolor: activity.status === 'won' ? 'success.light' : 'info.light',
                                        color: activity.status === 'won' ? 'success.dark' : 'info.dark',
                                        fontWeight: 600
                                    }}
                                />
                                </ListItem>
                                {index < stats.recentActivity.length - 1 && <Divider component="li" variant="inset" />}
                            </React.Fragment>
                        ))}
                         {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="body1" color="text.secondary">אין פעילות אחרונה להצגה</Typography>
                            </Box>
                        )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
