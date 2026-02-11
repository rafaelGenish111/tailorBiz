import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useClientStats } from '../admin/hooks/useClients';
import { getCurrentUserFromQueryData, useCurrentUserQuery } from '../admin/hooks/useCurrentUser';

const STATUS_LABELS = {
  new_lead: 'ליד חדש',
  contacted: 'יצרנו קשר',
  engaged: 'מעורבות',
  meeting_set: 'פגישה נקבעה',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר',
  lost: 'הפסדנו',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: statsResponse, isLoading } = useClientStats();
  const { data: meData } = useCurrentUserQuery();
  const me = getCurrentUserFromQueryData(meData);
  const canSeeClients = Boolean(me?.permissions?.clients?.enabled) || me?.role === 'admin' || me?.role === 'super_admin';

  const stats = statsResponse?.data || {};
  const clientsByStatus = stats.clientsByStatus || [];
  const totalLeads = (clientsByStatus.filter((s) => s._id !== 'won' && s._id !== 'lost').reduce((sum, s) => sum + s.count, 0)) || 0;
  const totalCustomers = clientsByStatus.find((s) => s._id === 'won')?.count || 0;

  const newLeadCount = clientsByStatus.find((s) => s._id === 'new_lead')?.count || 0;

  const statCards = [
    {
      title: canSeeClients ? 'סה"כ לקוחות' : 'סה"כ לידים',
      value: canSeeClients ? totalCustomers : totalLeads,
      icon: canSeeClients ? <CheckCircleIcon fontSize="large" /> : <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main,
      path: canSeeClients ? '/admin/customers' : '/admin/leads',
    },
    ...(canSeeClients
      ? [
        {
          title: 'לידים פעילים',
          value: totalLeads,
          icon: <TrendingUpIcon fontSize="large" />,
          color: '#2e7d32',
          path: '/admin/leads',
        },
      ]
      : []),
    {
      title: 'לידים חדשים',
      value: newLeadCount,
      icon: <ArrowForwardIcon fontSize="large" sx={{ transform: 'rotate(180deg)' }} />,
      color: '#ed6c02',
      path: '/admin/leads',
    },
  ];

  return (
    <Box sx={{ pb: 4, width: '100%', maxWidth: '100%', bgcolor: 'background.default' }}>
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
          <Typography variant="h4" fontWeight={700} gutterBottom>
            דשבורד
          </Typography>
          <Typography variant="body1" color="text.secondary">
            סקירה מהירה של הלידים והלקוחות
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '140px',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: card.color,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {isLoading ? '...' : card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
                onClick={() => navigate(card.path)}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
              >
                לנתונים
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" gutterBottom>
          לידים לפי סטטוס
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {isLoading ? (
            <Typography color="text.secondary">טוען...</Typography>
          ) : (
            clientsByStatus
              .filter((s) => s._id && s._id !== 'won')
              .map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {STATUS_LABELS[item._id] || item._id}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.count}
                  </Typography>
                </Box>
              ))
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
