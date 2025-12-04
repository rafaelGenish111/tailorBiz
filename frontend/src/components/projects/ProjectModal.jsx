import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  MenuItem,
  Select,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../admin/hooks/useTasks';
import TaskForm from '../../admin/components/content/tasks/TaskForm';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'לביצוע', color: '#607d8b' },
  { value: 'in_progress', label: 'בטיפול', color: '#2196f3' },
  { value: 'waiting', label: 'ממתין', color: '#ff9800' },
  { value: 'completed', label: 'הושלם', color: '#4caf50' },
  { value: 'cancelled', label: 'בוטל', color: '#9e9e9e' }
];

const PRIORITY_COLORS = {
  urgent: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default'
};

const PRIORITY_LABELS = {
  urgent: 'דחוף',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך'
};

const ProjectModal = ({ open, onClose, project }) => {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { data: tasksResponse, isLoading: isLoadingTasks } = useTasks(
    project ? { projectId: project._id } : undefined
  );
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksResponse?.data || [];

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCreateTask = (data) => {
    createTask.mutate(
      { ...data, projectId: project._id },
      {
        onSuccess: () => {
          setTaskFormOpen(false);
        }
      }
    );
  };

  const handleUpdateTask = (data) => {
    updateTask.mutate(
      { id: editingTask._id, data },
      {
        onSuccess: () => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }
      }
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { status: newStatus }
    });
  };

  const getStatusChip = (status) => {
    const config = {
      active: { label: 'פעיל', color: 'success' },
      on_hold: { label: 'בהשהיה', color: 'warning' },
      completed: { label: 'הושלם', color: 'primary' },
      archived: { label: 'בארכיון', color: 'default' }
    }[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (!project) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 8,
                  height: 40,
                  bgcolor: project.color || '#1976d2',
                  borderRadius: 1,
                  flexShrink: 0
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                  {project.name}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(project.status)}
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* פרטי פרויקט */}
          {project.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
            </Box>
          )}

          {(project.startDate || project.endDate) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {project.startDate && `תאריך התחלה: ${new Date(project.startDate).toLocaleDateString('he-IL')}`}
                {project.startDate && project.endDate && ' | '}
                {project.endDate && `תאריך סיום: ${new Date(project.endDate).toLocaleDateString('he-IL')}`}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* כותרת רשימת משימות */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              משימות ({tasks.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateTask}
              size="small"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              הוסף משימה
            </Button>
          </Box>

          {/* רשימת משימות */}
          {isLoadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tasks.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              אין משימות בפרויקט זה. לחץ על "הוסף משימה" כדי להתחיל.
            </Alert>
          ) : (
            <Box
              sx={{
                maxHeight: '50vh',
                overflowY: 'auto',
                pr: 1
              }}
            >
              <Stack spacing={2}>
                {tasks.map((task) => (
                  <Card
                    key={task._id}
                    elevation={2}
                    sx={{
                      borderLeft: `4px solid ${
                        task.priority === 'urgent'
                          ? '#f44336'
                          : task.priority === 'high'
                          ? '#ff9800'
                          : task.priority === 'medium'
                          ? '#2196f3'
                          : '#9e9e9e'
                      }`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditTask(task)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTask(task._id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {task.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, wordBreak: 'break-word' }}
                        >
                          {task.description}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={PRIORITY_LABELS[task.priority] || task.priority}
                          color={PRIORITY_COLORS[task.priority] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          size="small"
                          sx={{ minWidth: { xs: '100%', sm: 120 } }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {task.dueDate && (
                          <Chip
                            icon={<AssignmentIcon />}
                            label={format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm', {
                              locale: he
                            })}
                            size="small"
                            variant="outlined"
                            sx={{ maxWidth: { xs: '100%', sm: 'auto' } }}
                          />
                        )}
                      </Stack>

                      {task.relatedClient && (
                        <Typography variant="caption" color="text.secondary">
                          לקוח: {task.relatedClient.personalInfo?.fullName || 'לא זמין'}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* דיאלוג יצירה/עריכה משימה */}
      <Dialog
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'עריכת משימה' : 'משימה חדשה'}
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm
            initialData={
              editingTask
                ? editingTask
                : {
                    status: 'todo',
                    projectId: project._id
                  }
            }
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setTaskFormOpen(false);
              setEditingTask(null);
            }}
            isLoading={
              editingTask ? updateTask.isPending : createTask.isPending
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectModal;

