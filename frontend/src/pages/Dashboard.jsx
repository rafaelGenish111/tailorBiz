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
import { getCurrentUserFromQueryData, useCurrentUserQuery } from '../admin/hooks/useCurrentUser';
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
  const { data: meData } = useCurrentUserQuery();
  const me = getCurrentUserFromQueryData(meData);
  const isEmployee = me?.role === 'employee';
  const canSeeClients = Boolean(me?.permissions?.clients?.enabled) || me?.role === 'admin' || me?.role === 'super_admin';

  // State עבור מיקוד בוקר
  const [morningFocus, setMorningFocus] = useState([]);
  const [loadingFocus, setLoadingFocus] = useState(true);

  const stats = statsResponse?.data || {};
  const pipelineData = pipelineResponse?.data || {};

  // שליפת נתוני מיקוד בוקר
  useEffect(() => {
    const fetchMorningFocus = async () => {
      try {
        // ב-Production נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${API_BASE_URL}/clients/stats/morning-focus`, {
          withCredentials: true
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
      title: isEmployee ? (canSeeClients ? 'סה"כ לקוחות שלי' : 'סה"כ לידים שלי') : 'סה"כ לקוחות',
      value: stats.totalClients || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main,
      change: '+12%',
      trend: 'up',
    },
    {
      title: isEmployee ? 'לידים פעילים שלי' : 'לידים פעילים',
      value: stats.activeLeads || 0,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#2e7d32',
      change: '+8%',
      trend: 'up',
    },
    {
      title: isEmployee ? 'עסקאות פתוחות שלי' : 'עסקאות פתוחות',
      value: stats.activeDeals || 0,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#ed6c02',
      change: '-2%',
      trend: 'down',
    },
    ...(canSeeClients
      ? [
        {
          title: isEmployee ? 'הכנסות שלי (לקוחות)' : 'הכנסות חודש זה',
          value: `₪${(stats.totalRevenue || 0).toLocaleString()}`,
          icon: <MoneyIcon fontSize="large" />,
          color: '#9c27b0',
          change: '+23%',
          trend: 'up',
        },
      ]
      : []),
  ];

  return (
    <Box 
      sx={{ 
        pb: 4, 
        width: '100%',
        maxWidth: '100%',
        bgcolor: '#f8f9fa', // Light grey background for depth
      }}
    >
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
          <Typography 
            variant="h4" 
            fontWeight={700} 
            gutterBottom 
            sx={{ 
              color: '#16191f',
              fontSize: { xs: '1.5rem', md: '2rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {isEmployee ? 'הדשבורד שלי' : 'דשבורד ניהול'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b7280',
              fontSize: '0.95rem',
              fontWeight: 400,
            }}
          >
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
            sx={{ 
              width: { xs: '100%', md: 'auto' },
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            דוח חדש
          </Button>
        </Box>
      </Box>

      {/* Stat Cards - Full Width 4-Column Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statCards.map((card, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 4,
              height: '160px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b7280',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#16191f',
                    fontWeight: 700,
                    fontSize: '2rem',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {card.value}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: `${card.color}15`, 
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                }}
              >
                {card.icon}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
              <Chip
                label={card.change}
                size="small"
                sx={{ 
                  height: 24, 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  bgcolor: card.trend === 'up' ? '#d1fae5' : '#fee2e2',
                  color: card.trend === 'up' ? '#065f46' : '#991b1b',
                  border: 'none',
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                }}
              >
                לחודש קודם
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Main Content Grid - Full Width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            lg: '2fr 1fr' 
          },
          gap: 3,
          width: '100%',
        }}
      >
        {/* Left Column: Pipeline & Tasks */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Pipeline Chart */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              height: '520px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#16191f',
                  letterSpacing: '-0.01em',
                }}
              >
                משפך המכירות (Pipeline)
              </Typography>
              <IconButton 
                size="small"
                sx={{
                  color: '#6b7280',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: '400px', width: '100%', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData.pipeline || []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" hide />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" hide />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      padding: '12px',
                    }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#6366f1" name="כמות לידים" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="value" fill="#f59e0b" name="שווי כספי (₪)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Tasks / Pipeline Details */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#16191f',
                letterSpacing: '-0.01em',
                mb: 3,
              }}
            >
              המרה לפי שלבים
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pipelineData.pipeline?.map((stage, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#16191f',
                        fontSize: '0.875rem',
                      }}
                    >
                      {stage.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {stage.count} לידים • ₪{stage.value?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stage.count / (Math.max(pipelineData.metrics?.totalLeads || 1, 1))) * 100, 100)}
                    sx={{
                      height: 10,
                      borderRadius: '8px',
                      bgcolor: '#f3f4f6',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '8px',
                        bgcolor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* --- Morning Focus Widget --- */}
          <Card
            elevation={0}
            sx={{
              p: 0,
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: '#fef3c7', 
                borderBottom: '1px solid #fde68a', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5 
              }}
            >
              <FireIcon sx={{ color: '#f59e0b', fontSize: '1.5rem' }} />
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#92400e',
                    fontSize: '1rem',
                  }}
                >
                  מיקוד בוקר
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#78350f',
                    fontSize: '0.75rem',
                    display: 'block',
                    lineHeight: 1.4,
                    mt: 0.5,
                  }}
                >
                  הזדמנויות חמות שלא טופלו (24 שעות)
                </Typography>
              </Box>
            </Box>

            <List 
              disablePadding
              sx={{ 
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {loadingFocus ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    טוען...
                  </Typography>
                </Box>
              ) : morningFocus.length > 0 ? (
                morningFocus.map((lead, index) => (
                  <React.Fragment key={lead._id}>
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: lead.leadScore > 80 ? '#fee2e2' : '#fef3c7', 
                            color: lead.leadScore > 80 ? '#991b1b' : '#92400e',
                            fontWeight: 700,
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                          }}
                        >
                          {lead.leadScore}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#16191f',
                              fontSize: '0.875rem',
                            }}
                          >
                            {lead.personalInfo?.fullName}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            component="span" 
                            variant="caption" 
                            sx={{ 
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            <TimeIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                            {lead.metadata?.lastContactedAt
                              ? 'דיברתם לאחרונה ב-' + new Date(lead.metadata.lastContactedAt).toLocaleDateString('he-IL')
                              : 'טרם נוצר קשר'
                            }
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                        <Tooltip title="שלח הודעה בוואטסאפ">
                          <IconButton
                            size="small"
                            sx={{ 
                              bgcolor: '#d1fae5',
                              color: '#065f46',
                              '&:hover': {
                                bgcolor: '#a7f3d0',
                              }
                            }}
                            onClick={() => handleWhatsApp(lead.personalInfo?.phone || lead.businessInfo?.phone)}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="צפה בכרטיס">
                          <IconButton 
                            size="small"
                            sx={{
                              color: '#6b7280',
                              '&:hover': {
                                bgcolor: '#f3f4f6',
                              }
                            }}
                            onClick={() => navigate(`/admin/clients/${lead._id}`)}
                          >
                            <ArrowForwardIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < morningFocus.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: '#f3f4f6' }} />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    🎉 כל הכבוד! אין לידים מוזנחים.
                  </Typography>
                </Box>
              )}
            </List>
            {morningFocus.length > 0 && (
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: '#f9fafb', 
                  borderTop: '1px solid #e5e7eb', 
                  textAlign: 'center' 
                }}
              >
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/active-nurturing')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#6366f1',
                    '&:hover': {
                      bgcolor: '#eef2ff',
                    }
                  }}
                >
                  למסך טיפוח לידים מלא
                </Button>
              </Box>
            )}
          </Card>

          {/* Lead Sources Pie */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#16191f',
                letterSpacing: '-0.01em',
                mb: 3,
              }}
            >
              מקורות לידים
            </Typography>
            <Box sx={{ height: '300px', width: '100%', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leadsBySource || []}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {(stats.leadsBySource || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="#ffffff" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Recent Activity Feed */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                borderBottom: '1px solid #e5e7eb', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#16191f',
                }}
              >
                פעילות אחרונה
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/clients')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#6366f1',
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: '#eef2ff',
                  }
                }}
              >
                הכל
              </Button>
            </Box>

            <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
              {stats.recentActivity?.slice(0, 4).map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    component="button"
                    onClick={() => navigate(`/admin/clients/${activity._id}`)}
                    sx={{
                      px: 3, 
                      py: 2,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'right',
                      '&:hover': { bgcolor: '#f9fafb' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: COLORS[index % COLORS.length], 
                          width: 40, 
                          height: 40, 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#ffffff',
                        }}
                      >
                        {activity.personalInfo?.fullName?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#16191f',
                            fontSize: '0.875rem',
                          }}
                        >
                          {activity.personalInfo?.fullName}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            noWrap: true,
                          }}
                        >
                          {activity.status === 'lead' ? 'ליד חדש' : activity.businessInfo?.businessName}
                        </Typography>
                      }
                    />
                    <Chip
                      label={activity.status}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: 24, 
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                      }}
                    />
                  </ListItem>
                  {index < Math.min(stats.recentActivity.length, 4) - 1 && (
                    <Divider component="li" variant="inset" sx={{ borderColor: '#f3f4f6' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
