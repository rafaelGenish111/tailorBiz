// frontend/src/pages/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Paper,
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
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
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

      {/* Kanban Board */}
      <Grid container spacing={3}>
        {columns.map((column) => (
          <Grid item xs={12} md={6} lg={3} key={column.id}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 'auto', md: '75vh' },
                bgcolor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Column Header */}
              <Box
                sx={{
                  p: 2,
                  borderTop: `4px solid ${column.color}`,
                  bgcolor: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: column.color, display: 'flex' }}>
                    {column.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {column.title}
                  </Typography>
                </Box>
                <Chip
                  label={tasksByStatus[column.id].length}
                  size="small"
                  sx={{ bgcolor: column.color, color: 'white', fontWeight: 'bold' }}
                />
              </Box>

              {/* Tasks */}
              <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                {tasksByStatus[column.id].length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasksByStatus[column.id].map((task) => (
                      <Card
                        key={task._id}
                        elevation={2}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          position: 'relative'
                        }}
                        onClick={() => openTaskModal(task._id)}
                      >
                        {/* Priority Stripe */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: task.priority === 'urgent' ? 'error.main' :
                              task.priority === 'high' ? 'warning.main' :
                                task.priority === 'medium' ? 'info.main' : 'grey.300'
                          }}
                        />

                        {/* Task Header */}
                        <Box sx={{ pl: 1, display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip
                            label={task.priority === 'urgent' ? 'דחוף' :
                              task.priority === 'high' ? 'גבוה' :
                                task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                            size="small"
                            color={getPriorityColor(task.priority)}
                            variant="outlined"
                          />
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTask(task);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task._id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Task Content */}
                        <Box sx={{ pl: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {task.title}
                          </Typography>

                          {task.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}

                          {/* Footer Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            {task.relatedClient ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}
                                >
                                  {task.relatedClient.personalInfo.fullName?.charAt(0)}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {task.relatedClient.personalInfo.fullName}
                                </Typography>
                              </Box>
                            ) : <Box />}

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              {task.projectId && (
                                <Chip
                                  label={task.projectId.name}
                                  size="small"
                                  sx={{
                                    bgcolor: task.projectId.color || 'grey.300',
                                    color: 'white',
                                    maxWidth: 120,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                />
                              )}
                              {task.dueDate && (
                                <Chip
                                  icon={<ScheduleIcon sx={{ fontSize: '1rem !important' }} />}
                                  label={format(new Date(task.dueDate), 'dd/MM HH:mm', { locale: he })}
                                  size="small"
                                  sx={{ fontSize: '0.75rem', height: 24 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {task.status === 'todo' && (
                            <Button size="small" onClick={() => handleStatusChange(task._id, 'in_progress')}>
                              התחל טיפול
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button size="small" color="success" onClick={() => handleStatusChange(task._id, 'completed')}>
                              סיים משימה
                            </Button>
                          )}
                          {task.status === 'completed' && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CheckCircleIcon fontSize="small" /> הושלם
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      opacity: 0.5
                    }}
                  >
                    <Typography variant="body2">אין משימות</Typography>
                  </Box>
                )}

                {/* Add Task Button (Bottom of column) */}
                <Button
                  fullWidth
                  variant="dashed"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2, border: '1px dashed', borderColor: 'divider' }}
                  onClick={() => {
                    setSelectedStatus(column.id);
                    setCreateDialogOpen(true);
                  }}
                >
                  הוסף משימה
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
