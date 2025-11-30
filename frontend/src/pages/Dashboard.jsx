import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
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
  Card,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  WhatsApp as WhatsAppIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useClientStats, usePipelineStats } from '../admin/hooks/useClients';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: statsResponse } = useClientStats();
  const { data: pipelineResponse } = usePipelineStats();
  
  // State עבור מיקוד בוקר
  const [morningFocus, setMorningFocus] = useState([]);
  const [loadingFocus, setLoadingFocus] = useState(true);

  const stats = statsResponse?.data || {};
  const pipelineData = pipelineResponse?.data || {};

  // שליפת נתוני מיקוד בוקר
  useEffect(() => {
    const fetchMorningFocus = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/clients/stats/morning-focus`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        if (res.data.success) {
          setMorningFocus(res.data.data);
        }
      } catch (error) {
        console.log('Morning focus widget fetching error', error);
      } finally {
        setLoadingFocus(false);
      }
    };
    fetchMorningFocus();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const handleWhatsApp = (phone) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (cleanPhone) {
      // אם המספר מתחיל ב-0, נחליף ל-972
      const normalized = cleanPhone.startsWith('0') ? `972${cleanPhone.slice(1)}` : cleanPhone;
      window.open(`https://wa.me/${normalized}`, '_blank');
    }
  };

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
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
            דשבורד ניהול
          </Typography>
          <Typography variant="body1" color="text.secondary">
            תמונת מצב עדכנית ומיקוד להיום
          </Typography>
        </Box>
        <Box
          sx={{
            mt: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            display: 'flex',
            justifyContent: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AssignmentIcon />}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            דוח חדש
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                minHeight: 140,
                position: 'relative',
                overflow: 'hidden',
                borderTop: `4px solid ${card.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                   <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'text.primary' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                 <Chip 
                    label={card.change} 
                    size="small" 
                    color={card.trend === 'up' ? 'success' : 'error'} 
                    variant="filled"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                 />
                 <Typography variant="caption" color="text.secondary">לחודש קודם</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        
        {/* Left Column: Pipeline & Tasks */}
        <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
                {/* Pipeline Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">משפך המכירות (Pipeline)</Typography>
                            <IconButton size="small"><MoreVertIcon /></IconButton>
                        </Box>
                        <Box sx={{ height: 350, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData.pipeline || []} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" hide />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" hide />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#f5f5f5' }}
                            />
                            <Legend iconType="circle" />
                            <Bar yAxisId="left" dataKey="count" fill="#5e35b1" name="כמות לידים" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="value" fill="#ffb74d" name="שווי כספי (₪)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                 {/* Tasks / Pipeline Details */}
                 <Grid item xs={12}>
                     <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>המרה לפי שלבים</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        {pipelineData.pipeline?.map((stage, index) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>{stage.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                    {stage.count} לידים • ₪{stage.value?.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((stage.count / (Math.max(stats.totalClients, 1))) * 100, 100)}
                                    sx={{ 
                                        height: 8, 
                                        borderRadius: 4,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
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

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
            <Grid container spacing={3} direction="column">
                
                {/* --- Morning Focus Widget (חדש) --- */}
                <Grid item xs={12}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      p: 0, 
                      background: 'linear-gradient(135deg, #fff 0%, #fcfcff 100%)',
                      border: '1px solid #e3f2fd'
                    }}
                  >
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FireIcon color="error" />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1565c0">
                          מיקוד בוקר
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                          הזדמנויות חמות שלא טופלו (24 שעות)
                        </Typography>
                      </Box>
                    </Box>

                    <List disablePadding>
                      {loadingFocus ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            טוען...
                          </Typography>
                        </Box>
                      ) : morningFocus.length > 0 ? (
                        morningFocus.map((lead, index) => (
                          <React.Fragment key={lead._id}>
                            <ListItem sx={{ px: 2, py: 1.5 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: lead.leadScore > 80 ? '#ffcdd2' : '#fff9c4', color: 'text.primary', fontWeight: 'bold' }}>
                                  {lead.leadScore}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {lead.personalInfo?.fullName}
                                  </Typography>
                                }
                                secondary={
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    {lead.metadata?.lastContactedAt 
                                      ? 'דיברתם לאחרונה ב-' + new Date(lead.metadata.lastContactedAt).toLocaleDateString('he-IL')
                                      : 'טרם נוצר קשר'
                                    }
                                  </Typography>
                                }
                              />
                              <Tooltip title="שלח הודעה בוואטסאפ">
                                <IconButton 
                                  color="success" 
                                  size="small" 
                                  sx={{ bgcolor: '#e8f5e9' }}
                                  onClick={() => handleWhatsApp(lead.personalInfo?.phone || lead.businessInfo?.phone)}
                                >
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="צפה בכרטיס">
                                <IconButton size="small" onClick={() => navigate(`/admin/clients/${lead._id}`)}>
                                  <ArrowForwardIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                                </IconButton>
                              </Tooltip>
                            </ListItem>
                            {index < morningFocus.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            🎉 כל הכבוד! אין לידים מוזנחים.
                          </Typography>
                        </Box>
                      )}
                    </List>
                    {morningFocus.length > 0 && (
                      <Box sx={{ p: 1.5, bgcolor: '#fafafa', borderTop: '1px solid #eee', textAlign: 'center' }}>
                        <Button size="small" onClick={() => navigate('/admin/active-nurturing')}>
                          למסך טיפוח לידים מלא
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Lead Sources Pie */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>מקורות לידים</Typography>
                        <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={stats.leadsBySource || []}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                >
                                    {(stats.leadsBySource || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Activity Feed */}
                <Grid item xs={12} sx={{ flexGrow: 1 }}>
                    <Paper sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="subtitle1" fontWeight="bold">פעילות אחרונה</Typography>
                             <Button size="small" onClick={() => navigate('/admin/clients')}>
                                הכל
                             </Button>
                        </Box>
                        
                        <List sx={{ p: 0 }}>
                        {stats.recentActivity?.slice(0, 4).map((activity, index) => (
                            <React.Fragment key={index}>
                                <ListItem
                                component="button"
                                onClick={() => navigate(`/admin/clients/${activity._id}`)}
                                sx={{ 
                                    px: 2, py: 1.5,
                                    cursor: 'pointer',
                                    border: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    textAlign: 'right',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 32, height: 32, fontSize: '0.8rem' }}>
                                    {activity.personalInfo?.fullName?.charAt(0) || '?'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="bold">
                                            {activity.personalInfo?.fullName}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                           {activity.status === 'lead' ? 'ליד חדש' : activity.businessInfo?.businessName}
                                        </Typography>
                                    }
                                />
                                <Chip
                                    label={activity.status}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                                </ListItem>
                                {index < Math.min(stats.recentActivity.length, 4) - 1 && <Divider component="li" variant="inset" />}
                            </React.Fragment>
                        ))}
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
