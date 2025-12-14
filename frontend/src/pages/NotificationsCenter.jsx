// frontend/src/pages/NotificationsCenter.jsx
import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification
} from '../admin/hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const NotificationsCenter = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notificationsResponse?.unreadCount || 0;

  // פילטר לפי טאב
  const filteredNotifications = React.useMemo(() => {
    if (tabValue === 0) return notifications; // הכל
    if (tabValue === 1) return notifications.filter(n => !n.read); // לא נקראו
    if (tabValue === 2) return notifications.filter(n => n.read); // נקראו
    return notifications;
  }, [notifications, tabValue]);

  const getNotificationIcon = (type) => {
    const icons = {
      task_reminder: '📋',
      task_assigned: '✅',
      task_overdue: '⚠️',
      payment_reminder: '💰',
      payment_overdue: '🚨',
      meeting_reminder: '📅',
      new_lead: '🆕',
      client_update: '📝',
      follow_up: '📞',
      system: 'ℹ️',
      achievement: '🎉'
    };
    return icons[type] || 'ℹ️';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#9e9e9e'
    };
    return colors[priority] || '#9e9e9e';
  };

  const handleNotificationClick = async (notification) => {
    // סמן כנקרא
    if (!notification.read) {
      await markAsRead.mutateAsync(notification._id);
    }

    // נווט לעמוד המתאים
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification.mutateAsync(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🔔 מרכז ההתראות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} התראות לא נקראו` : 'אין התראות חדשות'}
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            startIcon={<MarkReadIcon />}
            variant="outlined"
            onClick={handleMarkAllRead}
          >
            סמן הכל כנקרא
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`הכל (${notifications.length})`} />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                לא נקראו
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="error" />
                )}
              </Box>
            }
          />
          <Tab label="נקראו" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        {filteredNotifications.length > 0 ? (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    },
                    borderRight: notification.read ? 'none' : `4px solid ${getPriorityColor(notification.priority)}`
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => handleDelete(notification._id, e)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: notification.color || getPriorityColor(notification.priority)
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="חדש" size="small" color="error" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: he
                          })}
                        </Typography>
                        {notification.actionText && (
                          <>
                            {' • '}
                            <Typography
                              component="span"
                              variant="caption"
                              color="primary"
                              sx={{ cursor: 'pointer' }}
                            >
                              {notification.actionText}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              אין התראות
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 1 && 'אין התראות לא נקראו'}
              {tabValue === 2 && 'אין התראות שנקראו'}
              {tabValue === 0 && 'אין התראות כלל'}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default NotificationsCenter;









