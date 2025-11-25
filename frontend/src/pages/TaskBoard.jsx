// frontend/src/pages/TaskBoard.jsx
import React, { useState } from 'react';
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
  Avatar,
  Badge,
  Paper
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
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../admin/hooks/useTasks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import TaskForm from '../admin/components/content/tasks/TaskForm';

const TaskBoard = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todo');

  const { data: tasksResponse } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksResponse?.data || [];

  // קיבוץ משימות לפי סטטוס
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    waiting: tasks.filter(t => t.status === 'waiting'),
    completed: tasks.filter(t => t.status === 'completed')
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
      onSuccess: () => setCreateDialogOpen(false)
    });
  };

  const handleUpdate = (data) => {
    updateTask.mutate({ id: editTask._id, data }, {
      onSuccess: () => setEditTask(null)
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            📊 לוח משימות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול משימות ומעקב ביצוע
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="large"
          onClick={() => {
            setSelectedStatus('todo');
            setCreateDialogOpen(true);
          }}
        >
          משימה חדשה
        </Button>
      </Box>

      {/* Kanban Board */}
      <Grid container spacing={3}>
        {columns.map((column) => (
          <Grid item xs={12} md={6} lg={3} key={column.id}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%', 
                minHeight: '75vh', 
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

                            {task.dueDate && (
                              <Chip 
                                icon={<ScheduleIcon sx={{ fontSize: '1rem !important' }} />}
                                label={format(new Date(task.dueDate), 'dd/MM HH:mm')}
                                size="small"
                                sx={{ fontSize: '0.75rem', height: 24 }}
                              />
                            )}
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
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>משימה חדשה</DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            initialData={{ status: selectedStatus }}
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            isLoading={createTask.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={Boolean(editTask)}
        onClose={() => setEditTask(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>עריכת משימה</DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            initialData={editTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditTask(null)}
            isLoading={updateTask.isPending}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskBoard;
