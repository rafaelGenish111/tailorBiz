// frontend/src/pages/TodayAgenda.jsx
import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Button,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTodayAgenda, useUpdateTask, useTaskStats } from '../admin/hooks/useTasks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const TodayAgenda = () => {
  const navigate = useNavigate();
  const { data: agendaResponse, isLoading } = useTodayAgenda();
  const { data: statsResponse } = useTaskStats();
  const updateTask = useUpdateTask();

  const agenda = agendaResponse?.data || {};
  const stats = statsResponse?.data || {};

  const handleCompleteTask = async (taskId) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { status: 'completed' }
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'דחוף',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך'
    };
    return labels[priority] || priority;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  const totalTasks = (agenda.today?.length || 0) + (agenda.overdue?.length || 0);
  const completedToday = stats.completedToday || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          ☀️ בוקר טוב! סדר היום שלך
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Today's Progress */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6">התקדמות היום</Typography>
            </Box>
            <Typography variant="h3" gutterBottom>
              {progressPercentage}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ height: 8, borderRadius: 1, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {completedToday} מתוך {totalTasks} משימות הושלמו
            </Typography>
          </Card>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>
              📋 משימות להיום
            </Typography>
            <Typography variant="h3">
              {agenda.today?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              משימות מתוכננות
            </Typography>
          </Card>
        </Grid>

        {/* Overdue */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: agenda.overdue?.length > 0 ? '#ffebee' : '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              ⚠️ באיחור
            </Typography>
            <Typography variant="h3" color={agenda.overdue?.length > 0 ? 'error' : 'text.secondary'}>
              {agenda.overdue?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              דורשות טיפול מיידי
            </Typography>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom>
              🔔 התראות
            </Typography>
            <Typography variant="h3">
              {agenda.summary?.unreadCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              התראות לא נקראו
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column - Tasks */}
        <Grid item xs={12} md={8}>
          {/* Overdue Tasks */}
          {agenda.overdue && agenda.overdue.length > 0 && (
            <Card sx={{ mb: 3, borderLeft: '4px solid #f44336' }}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WarningIcon color="error" />
                  <Typography variant="h6">
                    משימות באיחור ({agenda.overdue.length})
                  </Typography>
                </Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                  יש לך {agenda.overdue.length} משימות שעברו את מועד היעד!
                </Alert>
                <List>
                  {agenda.overdue.map((task) => (
                    <ListItem
                      key={task._id}
                      sx={{
                        border: '1px solid #ffcdd2',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: '#ffebee'
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleCompleteTask(task._id)}
                        >
                          <UncheckedIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          {task.relatedClient?.personalInfo?.fullName?.charAt(0) || '!'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {task.title}
                            </Typography>
                            <Chip
                              label={getPriorityLabel(task.priority)}
                              color={getPriorityColor(task.priority)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            {task.relatedClient && (
                              <Typography component="span" variant="body2">
                                {task.relatedClient.personalInfo.fullName} -{' '}
                                {task.relatedClient.businessInfo.businessName}
                                <br />
                              </Typography>
                            )}
                            <Typography component="span" variant="caption" color="error">
                              יעד: {format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon color="primary" />
                  <Typography variant="h6">
                    משימות להיום ({agenda.today?.length || 0})
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/admin/tasks/new')}
                >
                  משימה חדשה
                </Button>
              </Box>

              {agenda.today && agenda.today.length > 0 ? (
                <List>
                  {agenda.today.map((task, index) => (
                    <React.Fragment key={task._id}>
                      <ListItem
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => navigate(`/admin/tasks/${task._id}`)}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteTask(task._id);
                            }}
                          >
                            <UncheckedIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: task.color || 'primary.main' }}>
                            {task.relatedClient?.personalInfo?.fullName?.charAt(0) ||
                             task.title.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {task.title}
                              </Typography>
                              <Chip
                                label={getPriorityLabel(task.priority)}
                                color={getPriorityColor(task.priority)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              {task.relatedClient && (
                                <Typography component="span" variant="body2">
                                  {task.relatedClient.personalInfo.fullName}
                                  <br />
                                </Typography>
                              )}
                              {task.dueDate && (
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {format(new Date(task.dueDate), 'HH:mm')}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < agenda.today.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    🎉 אין משימות להיום!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    יום פנוי או שכבר סיימת הכל?
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Notifications & Urgent */}
        <Grid item xs={12} md={4}>
          {/* Urgent Tasks */}
          {agenda.urgent && agenda.urgent.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔥 משימות דחופות
                </Typography>
                <List dense>
                  {agenda.urgent.map((task) => (
                    <ListItem
                      key={task._id}
                      sx={{
                        border: '1px solid #ff9800',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/admin/tasks/${task._id}`)}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={task.relatedClient?.personalInfo?.fullName}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Card>
          )}

          {/* Recent Notifications */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={agenda.summary?.unreadCount} color="error">
                    <NotificationIcon />
                  </Badge>
                  התראות אחרונות
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/notifications')}>
                  הכל
                </Button>
              </Box>

              {agenda.notifications && agenda.notifications.length > 0 ? (
                <List dense>
                  {agenda.notifications.slice(0, 5).map((notif) => (
                    <ListItem
                      key={notif._id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: notif.read ? 'transparent' : 'action.hover'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={notif.read ? 'normal' : 'bold'}>
                            {notif.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {notif.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    אין התראות חדשות
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodayAgenda;


