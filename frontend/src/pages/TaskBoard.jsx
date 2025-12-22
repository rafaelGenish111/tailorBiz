// frontend/src/pages/TaskBoard.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Work as WorkIcon,
  Campaign as CampaignIcon,
  Science as ScienceIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProjects } from '../admin/hooks/useTasks';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, isBefore, isAfter } from 'date-fns';
import { he } from 'date-fns/locale';
import TaskForm from '../admin/components/content/tasks/TaskForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTask } from '../admin/hooks/useTasks';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmDialog from '../admin/components/common/ConfirmDialog';

const STATUS_LABELS = {
  todo: { label: 'לעשות', color: '#607d8b', icon: <AssignmentIcon /> },
  in_progress: { label: 'בביצוע', color: '#2196f3', icon: <ScheduleIcon /> },
  waiting: { label: 'ממתין', color: '#ff9800', icon: <PendingIcon /> },
  completed: { label: 'הושלם', color: '#4caf50', icon: <CheckCircleIcon /> },
};

const PRIORITY_LABELS = {
  urgent: { label: 'דחוף', color: 'error' },
  high: { label: 'גבוה', color: 'warning' },
  medium: { label: 'בינוני', color: 'info' },
  low: { label: 'נמוך', color: 'default' },
};

const TaskBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: taskIdFromUrl } = useParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState('this_week'); // Default: This Week
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskModalId, setTaskModalId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todo');
  const [expandedAccordions, setExpandedAccordions] = useState({
    todo: true, // Default: "To Do" is open
    in_progress: false,
    waiting: false,
    completed: false,
  });
  const [taskFormMode, setTaskFormMode] = useState('task'); // Track form mode (task/meeting)

  const openCreateTaskFromNav = Boolean(location.state?.openCreateTask);
  const effectiveCreateDialogOpen = createDialogOpen || openCreateTaskFromNav;
  const effectiveEditTask = taskIdFromUrl ? null : editTask;
  const createFormId = 'task-create-form';
  const editFormId = 'task-edit-form';

  const clearRouteContext = () => {
    if (taskIdFromUrl || openCreateTaskFromNav) {
      navigate('/admin/tasks', { replace: true });
    }
  };

  const openTaskModal = (id) => {
    if (!id) return;
    setTaskModalId(id);
  };

  const closeTaskModal = () => setTaskModalId(null);

  // Build filters object
  const filters = {};
  if (statusFilter) filters.status = statusFilter;
  if (priorityFilter) filters.priority = priorityFilter;
  if (projectFilter) filters.projectId = projectFilter;

  const { data: tasksResponse, isLoading } = useTasks(Object.keys(filters).length > 0 ? filters : undefined);
  const { data: projectsResponse } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const allTasks = (tasksResponse?.data || []).slice();
  const projects = projectsResponse?.data || [];

  // Timeframe filtering function
  const filterByTimeframe = (task) => {
    if (!task.dueDate) {
      // Tasks without dueDate: show in "All" only
      return timeframeFilter === 'all';
    }

    const taskDate = new Date(task.dueDate);
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { locale: he });
    const weekEnd = endOfWeek(now, { locale: he });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    switch (timeframeFilter) {
      case 'today':
        // Show tasks due today OR overdue (before today)
        return taskDate <= todayEnd;
      
      case 'this_week':
        // Show tasks due between start of week and end of week
        return taskDate >= weekStart && taskDate <= weekEnd;
      
      case 'this_month':
        // Show tasks due this month
        return isSameMonth(taskDate, now);
      
      case 'all':
        // Show everything
        return true;
      
      default:
        return true;
    }
  };

  // Client-side filtering: timeframe + search
  const filteredTasks = allTasks.filter((task) => {
    // Apply timeframe filter
    if (!filterByTimeframe(task)) return false;

    // Apply search filter
    if (search) {
      const query = search.toLowerCase();
      const matchesTitle = (task.title || '').toLowerCase().includes(query);
      const matchesDescription = (task.description || '').toLowerCase().includes(query);
      const matchesClient = task.relatedClient?.personalInfo?.fullName?.toLowerCase().includes(query);
      const matchesProject = task.projectId?.name?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesClient && !matchesProject) return false;
    }
    return true;
  });

  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    waiting: filteredTasks.filter(t => t.status === 'waiting'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const columns = [
    { id: 'todo', title: 'לעשות', ...STATUS_LABELS.todo },
    { id: 'in_progress', title: 'בביצוע', ...STATUS_LABELS.in_progress },
    { id: 'waiting', title: 'ממתין', ...STATUS_LABELS.waiting },
    { id: 'completed', title: 'הושלם', ...STATUS_LABELS.completed }
  ];

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    clearRouteContext();
  };

  const closeEditDialog = () => {
    setEditTask(null);
    clearRouteContext();
  };

  const handleAdd = () => {
    setEditTask(null);
    setSelectedStatus('todo');
    setTaskFormMode('task'); // Reset to task mode when opening create dialog
    setCreateDialogOpen(true);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setTaskFormMode(task?.type || 'task'); // Set mode based on task type
  };

  const handleView = (task) => {
    openTaskModal(task._id);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTask.mutateAsync(taskToDelete._id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { status: newStatus }
    });
  };

  const handleCreate = (data) => {
    createTask.mutate(data, {
      onSuccess: () => closeCreateDialog()
    });
  };

  const handleUpdate = (data) => {
    const id = effectiveEditTask?._id;
    if (!id) return;
    updateTask.mutate({ id, data }, {
      onSuccess: () => {
        closeEditDialog();
      }
    });
  };

  const handleAccordionChange = (columnId) => (event, isExpanded) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [columnId]: isExpanded,
    }));
  };

  const getTaskContext = (task) => {
    const projectName = (task.projectId?.name || '').toLowerCase();
    const taskTitle = (task.title || '').toLowerCase();
    const marketingKeywords = ['marketing', 'sales', 'שיווק', 'מכירות', 'קמפיין'];
    const hasMarketingKeyword = marketingKeywords.some(keyword => 
      projectName.includes(keyword) || taskTitle.includes(keyword)
    );
    if (hasMarketingKeyword) return 'marketing';
    if (task.projectId?.clientId || task.relatedClient) return 'client';
    return 'internal';
  };

  // Helper function to render a task card (used in both desktop and mobile)
  const renderTaskCard = (task) => {
    const priorityInfo = PRIORITY_LABELS[task.priority] || { label: task.priority, color: 'default' };
    const taskContext = getTaskContext(task);
    const contextColors = {
      client: '#3b82f6',
      marketing: '#7c3aed',
      internal: '#10b981',
    };
    const projectTagColor = task.projectId?.color || contextColors[taskContext] || '#6366f1';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    return (
      <Card
        key={task._id}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
          cursor: 'pointer',
        }}
        onClick={() => handleView(task)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Top: Priority + Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Chip
              label={priorityInfo.label}
              color={priorityInfo.color}
              size="small"
              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(task);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: '#6b7280',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                    color: '#ec7211',
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(task);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: '#6b7280',
                  '&:hover': {
                    bgcolor: '#fee2e2',
                    color: '#dc2626',
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Middle: Title */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#16191f',
              mb: 1.5,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.title || 'ללא כותרת'}
          </Typography>

          {/* Bottom: Tags + Date + Avatar */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {task.projectId && (
              <Chip
                label={task.projectId.name}
                size="small"
                sx={{
                  bgcolor: `${projectTagColor}15`,
                  color: projectTagColor,
                  fontSize: '0.7rem',
                  height: 20,
                  fontWeight: 500,
                  border: `1px solid ${projectTagColor}30`,
                }}
              />
            )}
            {task.dueDate && (
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: '0.7rem !important' }} />}
                label={format(new Date(task.dueDate), 'dd/MM', { locale: he })}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  bgcolor: isOverdue ? '#fee2e2' : '#f3f4f6',
                  color: isOverdue ? '#991b1b' : '#6b7280',
                  border: isOverdue ? '1px solid #fecaca' : 'none',
                  fontWeight: isOverdue ? 600 : 400,
                }}
              />
            )}
            {task.relatedClient && (
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.7rem', 
                  bgcolor: '#6366f1',
                  fontWeight: 600,
                }}
              >
                {task.relatedClient.personalInfo?.fullName?.charAt(0) || '?'}
              </Avatar>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: 'calc(100vh - 200px)',
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          flexShrink: 0,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#16191f',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              📊 לוח משימות
            </Typography>
            <Typography 
              variant="body1" 
              sx={{
                color: '#6b7280',
                fontSize: '0.95rem',
              }}
            >
              ניהול משימות ומעקב ביצוע
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleAdd}
            sx={{
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

        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: '#9ca3af', fontSize: '1.2rem', mr: 1 }} />
              ),
            }}
            sx={{ 
              flex: 1,
              minWidth: { xs: '100%', sm: 200 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          <TextField
            select
            size="small"
            label="סטטוס"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem value="">הכל</MenuItem>
            {Object.entries(STATUS_LABELS).map(([value, info]) => (
              <MenuItem key={value} value={value}>
                {info.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="עדיפות"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ 
              minWidth: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem value="">הכל</MenuItem>
            {Object.entries(PRIORITY_LABELS).map(([value, info]) => (
              <MenuItem key={value} value={value}>
                {info.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="פרויקט"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            sx={{ 
              minWidth: { xs: '100%', sm: 180 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem value="">הכל</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="תקופה"
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value)}
            sx={{ 
              minWidth: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem value="today">היום</MenuItem>
            <MenuItem value="this_week">השבוע</MenuItem>
            <MenuItem value="this_month">החודש</MenuItem>
            <MenuItem value="all">הכל</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Desktop Kanban Board - 4 Equal Columns */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          p: 3,
          overflow: 'hidden',
          minHeight: 0,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {columns.map((column) => {
          const tasksInColumn = tasksByStatus[column.id];
          const isEmpty = tasksInColumn.length === 0;
          
          return (
            <Box
              key={column.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                minWidth: 0,
                width: '100%',
                bgcolor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {/* Column Header - Fixed */}
              <Box
                sx={{
                  p: 2.5,
                  borderTop: `4px solid ${column.color}`,
                  bgcolor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: column.color, display: 'flex', alignItems: 'center' }}>
                    {column.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#16191f',
                    }}
                  >
                    {column.title}
                  </Typography>
                </Box>
                <Chip 
                  label={tasksInColumn.length} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${column.color}15`,
                    color: column.color,
                    fontWeight: 600,
                    height: 24,
                    fontSize: '0.75rem',
                    border: `1px solid ${column.color}30`,
                  }}
                />
              </Box>

              {/* Tasks Container - Scrollable */}
              <Box 
                sx={{ 
                  flex: 1,
                  p: 2,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  minHeight: 0,
                  bgcolor: isEmpty ? '#f9fafb' : '#ffffff',
                  backgroundImage: isEmpty 
                    ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)'
                    : 'none',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}
              >
                {isEmpty ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 8,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: `${column.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(column.icon, { sx: { fontSize: '2rem', color: column.color } })}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      אין משימות
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        mt: 0.5,
                      }}
                    >
                      גרור משימות לכאן
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasksInColumn.map((task) => renderTaskCard(task))}
                  </Box>
                )}
                
                {/* Add Task Button */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{
                      border: '1px dashed #d1d5db',
                      borderColor: '#d1d5db',
                      color: '#6b7280',
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1.5,
                      '&:hover': {
                        borderColor: column.color,
                        bgcolor: `${column.color}10`,
                        color: column.color,
                      }
                    }}
                    onClick={() => {
                      setSelectedStatus(column.id);
                      setCreateDialogOpen(true);
                    }}
                  >
                    הוסף משימה
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Mobile Accordion View */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'block', md: 'none' },
          p: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {columns.map((column) => {
          const tasksInColumn = tasksByStatus[column.id];
          const isEmpty = tasksInColumn.length === 0;
          const isExpanded = expandedAccordions[column.id];
          
          return (
            <Accordion
              key={column.id}
              expanded={isExpanded}
              onChange={handleAccordionChange(column.id)}
              sx={{
                mb: 2,
                borderRadius: '12px !important',
                border: '1px solid #f3f4f6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '0 0 16px 0',
                },
              }}
            >
              {/* Accordion Header */}
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: column.color }} />}
                sx={{
                  minHeight: 50,
                  height: 50,
                  bgcolor: '#ffffff',
                  borderLeft: `4px solid ${column.color}`,
                  borderRadius: '12px',
                  '&.Mui-expanded': {
                    minHeight: 50,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                    alignItems: 'center',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Box sx={{ color: column.color, display: 'flex', alignItems: 'center' }}>
                    {column.icon}
                  </Box>
                  <Typography 
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#16191f',
                    }}
                  >
                    {column.title}
                  </Typography>
                </Box>
                <Chip 
                  label={tasksInColumn.length} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${column.color}15`,
                    color: column.color,
                    fontWeight: 600,
                    height: 24,
                    fontSize: '0.75rem',
                    border: `1px solid ${column.color}30`,
                    ml: 'auto',
                    mr: 1,
                  }}
                />
              </AccordionSummary>

              {/* Accordion Body */}
              <AccordionDetails
                sx={{
                  p: 2,
                  bgcolor: isEmpty ? '#f9fafb' : '#ffffff',
                  backgroundImage: isEmpty 
                    ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)'
                    : 'none',
                }}
              >
                {isEmpty ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 4,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: `${column.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                      }}
                    >
                      {React.cloneElement(column.icon, { sx: { fontSize: '1.5rem', color: column.color } })}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      אין משימות
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        mt: 0.5,
                      }}
                    >
                      גרור משימות לכאן
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasksInColumn.map((task) => renderTaskCard(task))}
                  </Box>
                )}
                
                {/* Add Task Button */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{
                      border: '1px dashed #d1d5db',
                      borderColor: '#d1d5db',
                      color: '#6b7280',
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1.5,
                      '&:hover': {
                        borderColor: column.color,
                        bgcolor: `${column.color}10`,
                        color: column.color,
                      }
                    }}
                    onClick={() => {
                      setSelectedStatus(column.id);
                      setCreateDialogOpen(true);
                    }}
                  >
                    הוסף משימה
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Create Task Dialog */}
      <Dialog
        open={effectiveCreateDialogOpen}
        onClose={closeCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          משימה חדשה
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            initialData={selectedStatus ? { status: selectedStatus } : null}
            onSubmit={handleCreate}
            onCancel={closeCreateDialog}
            isLoading={createTask.isPending}
            formId={createFormId}
            showActions={false}
            onModeChange={setTaskFormMode}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeCreateDialog} 
            disabled={createTask.isPending}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            form={createFormId}
            variant="contained"
            disabled={createTask.isPending}
            sx={{
              backgroundColor: '#ec7211',
              '&:hover': {
                backgroundColor: '#c75e0c'
              }
            }}
          >
            {createTask.isPending 
              ? 'יוצר...' 
              : taskFormMode === 'meeting' 
                ? 'צור פגישה' 
                : 'צור משימה'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={Boolean(effectiveEditTask)}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          עדכן משימה
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            initialData={effectiveEditTask}
            onSubmit={handleUpdate}
            onCancel={closeEditDialog}
            isLoading={updateTask.isPending}
            formId={editFormId}
            showActions={false}
            onModeChange={setTaskFormMode}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeEditDialog} 
            disabled={updateTask.isPending}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            form={editFormId}
            variant="contained"
            disabled={updateTask.isPending}
            sx={{
              backgroundColor: '#ec7211',
              '&:hover': {
                backgroundColor: '#c75e0c'
              }
            }}
          >
            {updateTask.isPending 
              ? 'שומר…' 
              : taskFormMode === 'meeting' 
                ? 'עדכן פגישה' 
                : 'עדכן משימה'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Modal */}
      {taskModalId && (
        <TaskModal
          taskId={taskModalId}
          open={Boolean(taskModalId)}
          onClose={closeTaskModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת משימה"
        content={`האם אתה בטוח שברצונך למחוק את המשימה "${taskToDelete?.title}"?`}
        confirmText="מחק"
        confirmColor="error"
      />
    </Box>
  );
};

export default TaskBoard;
