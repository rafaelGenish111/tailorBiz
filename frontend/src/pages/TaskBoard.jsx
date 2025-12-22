// frontend/src/pages/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProjects } from '../admin/hooks/useTasks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import TaskForm from '../admin/components/content/tasks/TaskForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTask } from '../admin/hooks/useTasks';
import TaskModal from '../components/tasks/TaskModal';

const TaskBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: taskIdFromUrl } = useParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todo');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [taskModalId, setTaskModalId] = useState(null);

  const { data: taskByIdResponse } = useTask(taskIdFromUrl);
  const taskFromUrl = taskIdFromUrl ? taskByIdResponse?.data : null;
  const openCreateTaskFromNav = Boolean(location.state?.openCreateTask);
  const effectiveCreateDialogOpen = createDialogOpen || openCreateTaskFromNav;
  const effectiveSelectedStatus = openCreateTaskFromNav ? 'todo' : selectedStatus;
  const effectiveEditTask = taskFromUrl || editTask;
  const createFormId = 'task-create-form';
  const editFormId = 'task-edit-form';

  const clearRouteContext = () => {
    // מנקה state/params כדי לא לפתוח מחדש דיאלוג ברענון
    if (taskIdFromUrl || openCreateTaskFromNav) {
      navigate('/admin/tasks', { replace: true });
    }
  };

  const openTaskModal = (id) => {
    if (!id) return;
    setTaskModalId(id);
  };

  const closeTaskModal = () => setTaskModalId(null);

  const { data: tasksResponse } = useTasks(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );
  const { data: projectsResponse } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = (tasksResponse?.data || []).slice();
  const projects = projectsResponse?.data || [];

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    clearRouteContext();
  };

  const closeEditDialog = () => {
    setEditTask(null);
    clearRouteContext();
  };

  // סינון לפי עדיפות וטווח תאריכים (בצד הלקוח)
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      const dueTs = t.dueDate ? new Date(t.dueDate).getTime() : 0;
      if (dueTs < fromTs) return false;
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime();
      const dueTs = t.dueDate ? new Date(t.dueDate).getTime() : 0;
      if (dueTs > toTs) return false;
    }
    return true;
  });

  // מיון משימות לפי תאריך יעד (ואז לפי כותרת)
  filteredTasks.sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    if (aDate !== bDate) return aDate - bDate;
    return (a.title || '').localeCompare(b.title || '');
  });

  // קיבוץ משימות לפי סטטוס
  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    waiting: filteredTasks.filter(t => t.status === 'waiting'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const columns = [
    { id: 'todo', title: 'לעשות', color: '#607d8b', icon: <AssignmentIcon /> },
    { id: 'in_progress', title: 'בביצוע', color: '#2196f3', icon: <ScheduleIcon /> },
    { id: 'waiting', title: 'ממתין', color: '#ff9800', icon: <PendingIcon /> },
    { id: 'completed', title: 'הושלם', color: '#4caf50', icon: <CheckCircleIcon /> }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { status: newStatus }
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      await deleteTask.mutateAsync(taskId);
    }
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

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: 'calc(100vh - 200px)', // Minus header and padding
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          flexShrink: 0,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          minHeight: 'fit-content',
        }}
      >
        <Box sx={{ minWidth: 220, flex: '1 1 auto' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            📊 לוח משימות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול משימות ומעקב ביצוע
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            width: { xs: '100%', md: 'auto' }
          }}
        >
          {projects.length > 0 && (
            <TextField
              select
              size="small"
              label="סינון לפי פרויקט"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
            >
              <MenuItem value="">כל הפרויקטים</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            size="small"
            label="עדיפות"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 160 } }}
          >
            <MenuItem value="">כל העדיפויות</MenuItem>
            <MenuItem value="urgent">דחופה</MenuItem>
            <MenuItem value="high">גבוהה</MenuItem>
            <MenuItem value="medium">בינונית</MenuItem>
            <MenuItem value="low">נמוכה</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="date"
            label="מתאריך"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 180 } }}
          />
          <TextField
            size="small"
            type="date"
            label="עד תאריך"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 180 } }}
          />

          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="large"
            onClick={() => {
              setSelectedStatus('todo');
              setCreateDialogOpen(true);
            }}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            משימה חדשה
          </Button>
        </Box>
      </Box>

      {/* Kanban Board - 4 Equal Columns with Internal Scroll */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 3,
          p: 3,
          overflow: 'hidden',
          minHeight: 0,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          '& > *': {
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
          },
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
                maxWidth: '100%',
                bgcolor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
                        mb: 0.5,
                      }}
                    >
                      אין משימות
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                      }}
                    >
                      גרור משימות לכאן
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasksInColumn.map((task) => {
                      const priorityColors = {
                        urgent: '#ef4444',
                        high: '#f59e0b',
                        medium: '#3b82f6',
                        low: '#9ca3af',
                      };
                      const priorityBorderColor = priorityColors[task.priority] || '#9ca3af';
                      
                      return (
                        <Card
                          key={task._id}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            cursor: 'pointer',
                            borderRadius: '12px',
                            border: '1px solid #f3f4f6',
                            bgcolor: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease-in-out',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                              borderColor: '#d1d5db',
                            }
                          }}
                          onClick={() => openTaskModal(task._id)}
                        >
                          {/* Priority Border Strip */}
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              right: 0, 
                              top: 0, 
                              bottom: 0, 
                              width: 4, 
                              bgcolor: priorityBorderColor,
                              borderTopRightRadius: '12px',
                              borderBottomRightRadius: '12px',
                            }} 
                          />

                          {/* Top: Priority Badge + Actions */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Chip
                              label={task.priority === 'urgent' ? 'דחוף' : 
                                     task.priority === 'high' ? 'גבוה' : 
                                     task.priority === 'medium' ? 'בינוני' : 'נמוך'}
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
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditTask(task);
                                }}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  color: '#6366f1',
                                  bgcolor: '#eef2ff',
                                  '&:hover': {
                                    bgcolor: '#e0e7ff',
                                  }
                                }}
                              >
                                <EditIcon sx={{ fontSize: '0.875rem' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task._id);
                                }}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  color: '#ef4444',
                                  bgcolor: '#fee2e2',
                                  '&:hover': {
                                    bgcolor: '#fecaca',
                                  }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: '0.875rem' }} />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Middle: Title */}
                          <Typography 
                            variant="subtitle1" 
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.9375rem',
                              color: '#16191f',
                              mb: 1.5,
                              pr: 1,
                              lineHeight: 1.4,
                            }}
                          >
                            {task.title}
                          </Typography>

                          {/* Bottom: Tags + Date + Avatar */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {task.projectId && (
                                <Chip
                                  label={task.projectId.name}
                                  size="small"
                                  sx={{
                                    bgcolor: task.projectId.color || '#6366f1',
                                    color: '#ffffff',
                                    fontSize: '0.7rem',
                                    height: 20,
                                    fontWeight: 500,
                                  }}
                                />
                              )}
                              {task.dueDate && (
                                <Chip
                                  icon={<ScheduleIcon sx={{ fontSize: '0.75rem !important' }} />}
                                  label={format(new Date(task.dueDate), 'dd/MM', { locale: he })}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    bgcolor: '#f3f4f6',
                                    color: '#6b7280',
                                    border: 'none',
                                  }}
                                />
                              )}
                            </Box>
                            {task.relatedClient && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#6b7280',
                                    fontSize: '0.75rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 120,
                                  }}
                                >
                                  {task.relatedClient.personalInfo?.fullName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Add Task Button - Fixed at Bottom */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid #f3f4f6',
                  flexShrink: 0,
                  bgcolor: '#ffffff',
                }}
              >
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
          );
        })}
      </Box>

      {/* Create Task Dialog */}
      <Dialog
        open={effectiveCreateDialogOpen}
        onClose={closeCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            gap: 2
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            משימה חדשה
          </Typography>
          <Button
            type="submit"
            form={createFormId}
            variant="contained"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? 'שומר…' : 'צור משימה'}
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            formId={createFormId}
            showActions={false}
            initialData={{ status: effectiveSelectedStatus }}
            onSubmit={handleCreate}
            onCancel={closeCreateDialog}
            isLoading={createTask.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} disabled={createTask.isPending}>
            ביטול
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={Boolean(effectiveEditTask)}
        onClose={closeEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            gap: 2
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            עדכן משימה
          </Typography>
          <Button
            type="submit"
            form={editFormId}
            variant="contained"
            disabled={updateTask.isPending}
          >
            {updateTask.isPending ? 'שומר…' : 'עדכן משימה'}
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            initialData={effectiveEditTask}
            onSubmit={handleUpdate}
            onCancel={closeEditDialog}
            isLoading={updateTask.isPending}
            formId={editFormId}
            showActions={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={updateTask.isPending}>
            ביטול
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task View Modal (click anywhere) */}
      <TaskModal
        open={Boolean(taskModalId)}
        taskId={taskModalId}
        onClose={closeTaskModal}
      />
    </Box>
  );
};

export default TaskBoard;
