// frontend/src/pages/TodayAgenda.jsx
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Avatar,
  Tooltip,
  Paper,
  Stack,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTodayAgenda, useUpdateTask, useTaskStats } from '../admin/hooks/useTasks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const TodayAgenda = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  // --- פונקציות עזר לפעולות ---
  const handleWhatsApp = (phone) => {
    const cleanPhone = phone?.replace(/\D/g, '').replace(/^0/, '972');
    if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleCall = (phone) => window.location.href = `tel:${phone}`;
  const handleEmail = (email) => window.location.href = `mailto:${email}`;

  const getTaskColor = (priority) => {
    switch (priority) {
      case 'urgent': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main; // low
    }
  };

  const getTaskPriorityLabel = (priority) => {
    const labels = { urgent: 'דחוף', high: 'גבוה', medium: 'בינוני', low: 'רגיל' };
    return labels[priority] || priority;
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  // חישוב סטטיסטיקות לבר העליון
  const totalTasks = (agenda.today?.length || 0) + (agenda.overdue?.length || 0);
  const completedToday = stats.completedToday || 0;
  const progress = totalTasks > 0 ? Math.round((completedToday / (totalTasks + completedToday)) * 100) : 100;

  // --- קומפוננטת כרטיס משימה ---
  const TaskCard = ({ task, isOverdue }) => {
    const client = task.relatedClient;
    const phone = client?.personalInfo?.phone || client?.businessInfo?.phone;
    const email = client?.personalInfo?.email || client?.businessInfo?.email;
    const borderColor = getTaskColor(task.priority);

    return (
      <Grid item xs={12} md={6}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `6px solid ${borderColor}`, // פס צבע מימין המעיד על דחיפות
            bgcolor: isOverdue ? '#fff5f5' : 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            {/* כותרת ושבב עדיפות */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="div" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {task.title}
              </Typography>
              <Chip
                label={getTaskPriorityLabel(task.priority)}
                size="small"
                sx={{
                  bgcolor: `${borderColor}22`,
                  color: borderColor,
                  fontWeight: 'bold',
                  height: 24
                }}
              />
            </Box>

            {/* פרטי לקוח */}
            {client && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={500}>
                    {client.personalInfo?.fullName}
                  </Typography>
                </Box>
                {client.businessInfo?.businessName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {client.businessInfo.businessName}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* זמן יעד */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isOverdue ? 'error.main' : 'text.secondary' }}>
              <TimeIcon fontSize="small" />
              <Typography variant="body2" fontWeight={isOverdue ? 'bold' : 'regular'}>
                {isOverdue ? 'באיחור! ' : ''}
                {format(new Date(task.dueDate), 'HH:mm')}
                <Typography component="span" variant="caption" sx={{ mx: 1, color: 'grey.500' }}>
                  ({format(new Date(task.dueDate), 'dd/MM')})
                </Typography>
              </Typography>
            </Box>
          </CardContent>

          <Divider />

          {/* איזור פעולות תחתון */}
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={1}>
              {phone && (
                <Tooltip title="שלח וואטסאפ">
                  <IconButton
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}
                    onClick={() => handleWhatsApp(phone)}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {phone && task.type === 'call' && (
                <Tooltip title={`חייג: ${phone}`}>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb' }}
                    onClick={() => handleCall(phone)}
                  >
                    <PhoneIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {email && task.type === 'email' && (
                <Tooltip title="שלח אימייל">
                  <IconButton
                    size="small"
                    sx={{ bgcolor: '#fff3e0', color: '#ef6c00', border: '1px solid #ffe0b2' }}
                    onClick={() => handleEmail(email)}
                  >
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => handleCompleteTask(task._id)}
              sx={{ borderRadius: 4, textTransform: 'none', px: 2 }}
            >
              בוצע
            </Button>
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: { xs: 1.5, md: 3 } }}>
      {/* --- כותרת ראשית --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'transparent' }}>
        <Grid container alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1a237e' }}>
              סדר היום שלך ☀️
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" />
              {format(new Date(), 'EEEE, d בMMMM yyyy', { locale: he })}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              mt: { xs: 2, md: 0 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<TaskIcon />}
              onClick={() => navigate('/admin/tasks', { state: { openCreateTask: true } })}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1,
                boxShadow: 4,
                width: { xs: '100%', md: 'auto' },
              }}
            >
              משימה חדשה
            </Button>
          </Grid>
        </Grid>

        {/* בר התקדמות */}
        <Box sx={{ mt: 3, width: '100%', maxWidth: 600 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">התקדמות יומית</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { borderRadius: 5 } }}
          />
        </Box>
      </Paper>

      {/* --- משימות באיחור --- */}
      {agenda.overdue?.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <WarningIcon />
            דורש טיפול מיידי ({agenda.overdue.length})
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            {agenda.overdue.map(task => (
              <TaskCard key={task._id} task={task} isOverdue={true} />
            ))}
          </Grid>
        </Box>
      )}

      {/* --- משימות להיום --- */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'text.primary' }}>
          <TimeIcon color="primary" />
          המשימות להיום ({agenda.today?.length || 0})
        </Typography>

        {agenda.today && agenda.today.length > 0 ? (
          <Grid container spacing={3} alignItems="stretch">
            {agenda.today.map(task => (
              <TaskCard key={task._id} task={task} isOverdue={false} />
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f5f5f5', borderStyle: 'dashed', borderColor: '#bdbdbd' }}>
            <Typography variant="h6" color="text.secondary">
              אין משימות נוספות להיום 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary">
              זמן מצוין לעבור על ה-Pipeline או לקחת הפסקה.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TodayAgenda;