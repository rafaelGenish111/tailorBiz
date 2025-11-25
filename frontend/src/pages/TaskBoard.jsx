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
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../admin/hooks/useTasks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const TaskBoard = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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
    { id: 'todo', title: 'לעשות', color: '#9e9e9e', icon: '📋' },
    { id: 'in_progress', title: 'בביצוע', color: '#2196f3', icon: '🔄' },
    { id: 'waiting', title: 'ממתין', color: '#ff9800', icon: '⏸️' },
    { id: 'completed', title: 'הושלם', color: '#4caf50', icon: '✅' }
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 לוח משימות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            תצוגת Kanban
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setSelectedStatus('todo');
            setCreateDialogOpen(true);
          }}
        >
          משימה חדשה
        </Button>
      </Box>

      {/* Kanban Board */}
      <Grid container spacing={2}>
        {columns.map((column) => (
          <Grid item xs={12} md={3} key={column.id}>
            <Card sx={{ height: '100%', minHeight: '70vh' }}>
              {/* Column Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: column.color,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    {column.icon} {column.title}
                  </Typography>
                </Box>
                <Badge badgeContent={tasksByStatus[column.id].length} color="error" />
              </Box>

              {/* Tasks */}
              <Box sx={{ p: 2 }}>
                {tasksByStatus[column.id].length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasksByStatus[column.id].map((task) => (
                      <Card
                        key={task._id}
                        sx={{
                          p: 2,
                          cursor: 'grab',
                          '&:hover': {
                            boxShadow: 3
                          },
                          borderLeft: `4px solid ${task.color || column.color}`
                        }}
                      >
                        {/* Task Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                          <Box>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Task Title */}
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {task.title}
                        </Typography>

                        {/* Task Description */}
                        {task.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                            sx={{
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

                        {/* Related Client */}
                        {task.relatedClient && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                              {task.relatedClient.personalInfo.fullName?.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {task.relatedClient.personalInfo.fullName}
                            </Typography>
                          </Box>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            📅 {format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                        )}

                        {/* Status Change Buttons */}
                        {task.status !== 'completed' && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            {task.status === 'todo' && (
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={() => handleStatusChange(task._id, 'in_progress')}
                              >
                                התחל
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleStatusChange(task._id, 'waiting')}
                                >
                                  המתן
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleStatusChange(task._id, 'completed')}
                                >
                                  סיים
                                </Button>
                              </>
                            )}
                            {task.status === 'waiting' && (
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={() => handleStatusChange(task._id, 'in_progress')}
                              >
                                המשך
                              </Button>
                            )}
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body2">אין משימות</Typography>
                  </Box>
                )}

                {/* Add Task Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSelectedStatus(column.id);
                    setCreateDialogOpen(true);
                  }}
                >
                  הוסף משימה
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Task Dialog - נוסיף בהמשך */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>משימה חדשה</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            טופס יצירת משימה יתווסף בהמשך...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>ביטול</Button>
          <Button variant="contained">צור משימה</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskBoard;


