import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const MotionCard = motion(Card);

const campaignTypeLabels = {
  holiday: '🎉 חג',
  seasonal: '🌟 עונתי',
  product_launch: '🚀 השקה',
  retention: '🔄 שימור',
  acquisition: '📈 רכישה',
  event: '🎪 אירוע',
  content: '📝 תוכן',
  networking: '🤝 נטוורקינג'
};

const statusColors = {
  planning: 'default',
  preparing: 'info',
  active: 'success',
  paused: 'warning',
  completed: 'default',
  cancelled: 'error'
};

const statusLabels = {
  planning: 'תכנון',
  preparing: 'הכנות',
  active: 'פעיל',
  paused: 'מושהה',
  completed: 'הושלם',
  cancelled: 'בוטל'
};

const CampaignCard = ({ campaign, index, view, onMenuClick, onClick }) => {
  const budgetUsagePercent = campaign.budget?.total > 0
    ? ((campaign.budget.spent || 0) / campaign.budget.total) * 100
    : 0;

  const getDaysText = (days) => {
    if (days === null || days === undefined) return '';
    if (days === 0) return 'היום';
    if (days === 1) return 'מחר';
    if (days < 0) return `לפני ${Math.abs(days)} ימים`;
    return `בעוד ${days} ימים`;
  };

  const getUrgencyColor = (days) => {
    if (days === null || days === undefined) return 'default';
    if (days <= 3) return 'error';
    if (days <= 7) return 'warning';
    return 'default';
  };

  if (view === 'list') {
    return (
      <MotionCard
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4
          }
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: `${statusColors[campaign.status]}.main`,
                  width: 56,
                  height: 56
                }}
              >
                {campaign.name.charAt(0)}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {campaign.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={campaignTypeLabels[campaign.type] || campaign.type}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={statusLabels[campaign.status]}
                    size="small"
                    color={statusColors[campaign.status]}
                  />
                  <Chip
                    label={getDaysText(campaign.daysUntilTarget)}
                    size="small"
                    color={getUrgencyColor(campaign.daysUntilPreparation)}
                    icon={<CalendarTodayIcon />}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {campaign.analytics?.roi?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ROI
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700}>
                  ₪{(campaign.budget?.spent || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מתוך ₪{(campaign.budget?.total || 0).toLocaleString()}
                </Typography>
              </Box>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick?.(e, campaign);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </MotionCard>
    );
  }

  // Grid view
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        },
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={statusLabels[campaign.status]}
            size="small"
            color={statusColors[campaign.status]}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.(e, campaign);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {campaign.name}
        </Typography>

        <Chip
          label={campaignTypeLabels[campaign.type] || campaign.type}
          size="small"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {getDaysText(campaign.daysUntilTarget)}
          </Typography>
          {campaign.daysUntilPreparation !== null && campaign.daysUntilPreparation >= 0 && (
            <Chip
              label={`התחל הכנות: ${getDaysText(campaign.daysUntilPreparation)}`}
              size="small"
              color={getUrgencyColor(campaign.daysUntilPreparation)}
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              תקציב
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {budgetUsagePercent.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(budgetUsagePercent, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: budgetUsagePercent > 90 ? 'error.main' : 'primary.main'
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            ₪{(campaign.budget?.spent || 0).toLocaleString()} / ₪{(campaign.budget?.total || 0).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Tooltip title="ROI">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="body2" fontWeight={600}>
                {campaign.analytics?.roi?.toFixed(1) || 0}%
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="לידים">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: 'info.main' }} />
              <Typography variant="body2">
                {campaign.channels?.reduce((sum, ch) => sum + (ch.metrics?.clicked || 0), 0) || 0}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="עלות לליד">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoneyIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2">
                ₪{campaign.analytics?.costPerLead?.toFixed(0) || 0}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default CampaignCard;






