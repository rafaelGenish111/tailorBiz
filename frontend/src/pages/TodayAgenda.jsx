// frontend/src/pages/TodayAgenda.jsx
import React from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Stack,
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
import TaskModal from '../components/tasks/TaskModal';

const TodayAgenda = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: agendaResponse, isLoading } = useTodayAgenda();
  const { data: statsResponse } = useTaskStats();
  const updateTask = useUpdateTask();
  const [taskModalId, setTaskModalId] = React.useState(null);

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

  // Helper to get priority border color
  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444'; // Red
      case 'high': return '#f59e0b'; // Orange
      case 'medium': return '#3b82f6'; // Blue
      default: return '#9ca3af'; // Gray (low)
    }
  };

  // --- קומפוננטת כרטיס משימה ---
  const TaskCard = ({ task, isOverdue }) => {
    const client = task.relatedClient;
    const phone = client?.personalInfo?.phone || client?.businessInfo?.phone;
    const email = client?.personalInfo?.email || client?.businessInfo?.email;
    const priorityBorderColor = getPriorityBorderColor(task.priority);

    return (
      <Card
        elevation={0}
        sx={{
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `4px solid ${priorityBorderColor}`,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#d1d5db',
          }
        }}
        onClick={() => setTaskModalId(task._id)}
      >
        {/* Top Section: Priority Badge + Time */}
        <Box
          sx={{
            p: 2,
            pb: 1.5,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Chip
            label={getTaskPriorityLabel(task.priority)}
            size="small"
            sx={{
              bgcolor: `${priorityBorderColor}15`,
              color: priorityBorderColor,
              fontWeight: 600,
              height: 22,
              fontSize: '0.7rem',
              border: `1px solid ${priorityBorderColor}30`,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon 
              sx={{ 
                fontSize: '0.875rem', 
                color: isOverdue ? '#ef4444' : '#6b7280' 
              }} 
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: isOverdue ? 600 : 400,
                color: isOverdue ? '#ef4444' : '#6b7280',
              }}
            >
              {format(new Date(task.dueDate), 'HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* Middle Section: Task Title */}
        <Box
          sx={{
            px: 2,
            pb: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#16191f',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 1,
            }}
          >
            {task.title}
          </Typography>
          
          {/* Client Info (if exists) */}
          {client && (
            <Box sx={{ mt: 'auto' }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <PersonIcon sx={{ fontSize: '0.875rem' }} />
                {client.personalInfo?.fullName || client.businessInfo?.businessName}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom Section: Action Button + Contact Icons - Pinned to bottom */}
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 1.5,
            borderTop: '1px solid #f3f4f6',
            flexShrink: 0,
            mt: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Stack direction="row" spacing={0.5}>
            {phone && (
              <Tooltip title="שלח וואטסאפ">
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: '#d1fae5',
                    color: '#065f46',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: '#a7f3d0',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsApp(phone);
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: '0.875rem' }} />
                </IconButton>
              </Tooltip>
            )}
            {phone && task.type === 'call' && (
              <Tooltip title={`חייג: ${phone}`}>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: '#dbeafe',
                    color: '#1e40af',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: '#bfdbfe',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCall(phone);
                  }}
                >
                  <PhoneIcon sx={{ fontSize: '0.875rem' }} />
                </IconButton>
              </Tooltip>
            )}
            {email && task.type === 'email' && (
              <Tooltip title="שלח אימייל">
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#92400e',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: '#fde68a',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmail(email);
                  }}
                >
                  <EmailIcon sx={{ fontSize: '0.875rem' }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Button
            variant="contained"
            size="small"
            startIcon={<CheckIcon sx={{ fontSize: '0.875rem' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteTask(task._id);
            }}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: '#10b981',
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            בוצע
          </Button>
        </Box>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        pb: 4,
        bgcolor: '#f8f9fa',
      }}
    >
      {/* --- Header Section --- */}
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
            סדר היום שלי ☀️
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              fontSize: '0.95rem',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CalendarIcon sx={{ fontSize: '1rem' }} />
            {format(new Date(), 'EEEE, d בMMMM yyyy', { locale: he })}
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
            startIcon={<TaskIcon />}
            onClick={() => navigate('/admin/tasks', { state: { openCreateTask: true } })}
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
            משימה חדשה
          </Button>
        </Box>
      </Box>

      {/* Progress Bar - Premium Design */}
      <Box
        sx={{
          mb: 5,
          bgcolor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          p: 3,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#16191f',
            }}
          >
            התקדמות יומית
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#6366f1',
            }}
          >
            {progress}%
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: '6px',
            bgcolor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '9999px',
              transition: 'width 0.6s ease-out',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          />
        </Box>
      </Box>

      {/* Section A: 🔥 Critical / Overdue */}
      {agenda.overdue && agenda.overdue.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
            }}
          >
            <WarningIcon sx={{ color: '#ef4444', fontSize: '1.5rem' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#16191f',
                letterSpacing: '-0.01em',
              }}
            >
              דורש טיפול מיידי
            </Typography>
            <Chip
              label={agenda.overdue.length}
              size="small"
              sx={{
                bgcolor: '#fee2e2',
                color: '#991b1b',
                fontWeight: 600,
                height: 24,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {agenda.overdue.map(task => (
              <TaskCard key={task._id} task={task} isOverdue={true} />
            ))}
          </Box>
        </Box>
      )}

      {/* Section B: 📅 Today's Focus */}
      <Box sx={{ mb: 5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          <TimeIcon sx={{ color: '#10b981', fontSize: '1.5rem' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#16191f',
              letterSpacing: '-0.01em',
            }}
          >
            המשימות להיום
          </Typography>
          {agenda.today && agenda.today.length > 0 && (
            <Chip
              label={agenda.today.length}
              size="small"
              sx={{
                bgcolor: '#d1fae5',
                color: '#065f46',
                fontWeight: 600,
                height: 24,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {agenda.today && agenda.today.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {agenda.today.map(task => (
              <TaskCard key={task._id} task={task} isOverdue={false} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #d1d5db',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#6b7280',
                fontWeight: 500,
                mb: 1,
              }}
            >
              אין משימות נוספות להיום 🎉
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#9ca3af',
                fontSize: '0.875rem',
              }}
            >
              זמן מצוין לעבור על ה-Pipeline או לקחת הפסקה.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Section C: 📥 Upcoming (if exists) */}
      {agenda.upcoming && agenda.upcoming.length > 0 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
            }}
          >
            <CalendarIcon sx={{ color: '#6b7280', fontSize: '1.5rem' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#16191f',
                letterSpacing: '-0.01em',
              }}
            >
              בקרוב
            </Typography>
            <Chip
              label={agenda.upcoming.length}
              size="small"
              sx={{
                bgcolor: '#f3f4f6',
                color: '#374151',
                fontWeight: 600,
                height: 24,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {agenda.upcoming.map(task => (
              <TaskCard key={task._id} task={task} isOverdue={false} />
            ))}
          </Box>
        </Box>
      )}

      <TaskModal
        open={Boolean(taskModalId)}
        taskId={taskModalId}
        onClose={() => setTaskModalId(null)}
      />
    </Box>
  );
};

export default TodayAgenda;