import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../shared/LoadingSpinner';

const MotionListItem = motion.create(ListItem);

const campaignTypeLabels = {
  holiday: 'חג',
  seasonal: 'עונתי',
  product_launch: 'השקת מוצר',
  retention: 'שימור',
  acquisition: 'רכישה',
  event: 'אירוע',
  content: 'תוכן',
  networking: 'נטוורקינג'
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

const UpcomingCampaigns = ({ campaigns = [], loading = false }) => {
  const navigate = useNavigate();

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
    return 'info';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <LoadingSpinner message="טוען קמפיינים..." />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          קמפיינים קרובים
        </Typography>
        <Chip
          label={campaigns.length}
          size="small"
          sx={{ ml: 1 }}
          color="primary"
        />
      </Box>

      {campaigns.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary'
          }}
        >
          <EventIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">
            אין קמפיינים קרובים
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {campaigns.map((campaign, index) => (
            <MotionListItem
              key={campaign._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(`/admin/marketing/campaigns/${campaign._id}`)}
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: `${statusColors[campaign.status]}.main`,
                  width: 48,
                  height: 48
                }}
              >
                {campaign.name.charAt(0)}
              </Avatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {campaign.name}
                    </Typography>
                    <Chip
                      label={campaignTypeLabels[campaign.type] || campaign.type}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={statusLabels[campaign.status]}
                      size="small"
                      color={statusColors[campaign.status]}
                    />
                    <Chip
                      label={getDaysText(campaign.daysUntilTarget)}
                      size="small"
                      color={getUrgencyColor(campaign.daysUntilPreparation)}
                      variant="outlined"
                    />
                    {campaign.budget && (
                      <Chip
                        label={`₪${campaign.budget.total.toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Tooltip title="ערוך">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/marketing/campaigns/${campaign._id}/edit`);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {campaign.status === 'planning' && (
                  <Tooltip title="הפעל">
                    <IconButton
                      edge="end"
                      size="small"
                      sx={{ ml: 1 }}
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Activate campaign
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemSecondaryAction>
            </MotionListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default UpcomingCampaigns;
