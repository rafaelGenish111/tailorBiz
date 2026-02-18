import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useTask, useUpdateTask, useDeleteTask, useCreateTask } from '../../admin/hooks/useTasks';
import TaskForm from '../../admin/components/content/tasks/TaskForm';

const PRIORITY_LABELS = {
  urgent: 'דחוף',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך'
};

const STATUS_LABELS = {
  todo: 'לביצוע',
  in_progress: 'בטיפול',
  waiting: 'ממתין',
  completed: 'הושלם',
  cancelled: 'בוטל'
};

const TaskModal = ({ open, taskId, onClose, initialData }) => {
  const { data: taskResponse, isLoading, isError } = useTask(taskId);
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [isEditing, setIsEditing] = React.useState(false);

  // מצב יצירה: taskId הוא null/undefined ויש initialData
  const isCreateMode = !taskId && initialData;
  const task = isCreateMode ? null : taskResponse?.data;

  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : (isCreateMode ? (initialData?.subtasks || []) : []);

  const handleToggleSubtask = async (index) => {
    if (!task?._id) return;
    const next = subtasks.map((s, i) => (i === index ? { ...s, done: !s?.done } : s));
    await updateTask.mutateAsync({ id: task._id, data: { subtasks: next } });
  };

  const handleSetAllSubtasks = async (done) => {
    if (!task?._id) return;
    if (!subtasks.length) return;
    const next = subtasks.map((s) => ({ ...s, done: Boolean(done) }));
    await updateTask.mutateAsync({ id: task._id, data: { subtasks: next } });
  };

  const handleMarkCompleted = async () => {
    if (!task?._id) return;
    await updateTask.mutateAsync({ id: task._id, data: { status: 'completed' } });
  };

  const handleSaveEdits = (data) => {
    if (isCreateMode) {
      // מצב יצירה
      createTask.mutate(data, {
        onSuccess: () => {
          onClose?.();
        }
      });
    } else if (task?._id) {
      // מצב עריכה
      updateTask.mutate(
        { id: task._id, data },
        {
          onSuccess: () => setIsEditing(false)
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!task?._id) return;
    if (!window.confirm('האם למחוק את המשימה לצמיתות?')) return;
    await deleteTask.mutateAsync(task._id);
    setIsEditing(false);
    onClose?.();
  };

  const completedCount = subtasks.filter((s) => Boolean(s?.done)).length;
  const totalCount = subtasks.length;

  // במצב יצירה, תמיד במצב עריכה
  const effectiveIsEditing = isCreateMode ? true : isEditing;
  const effectiveColor = isCreateMode ? (initialData?.color || '#1976d2') : task?.color;
  const effectiveTitle = isCreateMode ? 'משימה חדשה' : (task?.title || 'משימה');

  return (
    <Dialog
      open={Boolean(open && (taskId || isCreateMode))}
      onClose={() => {
        setIsEditing(false);
        onClose?.();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 2,
        borderRight: effectiveColor ? `4px solid ${effectiveColor}` : 'none',
        pr: effectiveColor ? 1 : 0
      }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
            {effectiveTitle}
          </Typography>
          {!isCreateMode && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
              {task?.priority && (
                <Chip size="small" variant="outlined" label={`עדיפות: ${PRIORITY_LABELS[task.priority] || task.priority}`} />
              )}
              {task?.status && (
                <Chip size="small" label={STATUS_LABELS[task.status] || task.status} color={task.status === 'completed' ? 'success' : 'default'} />
              )}
              {typeof totalCount === 'number' && totalCount > 0 && (
                <Chip size="small" variant="outlined" label={`תתי־משימות: ${completedCount}/${totalCount}`} />
              )}
              {task?.color && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: task.color,
                    border: '2px solid',
                    borderColor: 'divider'
                  }}
                  title="צבע המשימה"
                />
              )}
            </Stack>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isCreateMode ? (
          <TaskForm
            initialData={initialData}
            onSubmit={handleSaveEdits}
            onCancel={() => onClose?.()}
            isLoading={createTask.isPending}
            formId="task-form"
          />
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">שגיאה בטעינת המשימה</Alert>
        ) : !task ? (
          <Alert severity="warning">משימה לא נמצאה</Alert>
        ) : effectiveIsEditing ? (
          <TaskForm
            initialData={task}
            onSubmit={handleSaveEdits}
            onCancel={() => setIsEditing(false)}
            isLoading={updateTask.isPending}
          />
        ) : (
          <>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              תתי־משימות
            </Typography>

            {subtasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                אין תתי־משימות עדיין.
              </Typography>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSetAllSubtasks(true)}
                    disabled={updateTask.isPending}
                  >
                    סמן הכל
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSetAllSubtasks(false)}
                    disabled={updateTask.isPending}
                  >
                    נקה הכל
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {subtasks.map((s, idx) => (
                    <FormControlLabel
                      key={`${idx}_${s?.title || 'subtask'}`}
                      control={
                        <Checkbox
                          checked={Boolean(s?.done)}
                          onChange={() => handleToggleSubtask(idx)}
                          disabled={updateTask.isPending}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: s?.done ? 'line-through' : 'none',
                            color: s?.done ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {s?.title || `תת־משימה ${idx + 1}`}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ gap: 1 }}>
        {isCreateMode ? (
          <>
            <Button
              onClick={() => onClose?.()}
              disabled={createTask.isPending}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              form="task-form"
              variant="contained"
              disabled={createTask.isPending}
              sx={{
                backgroundColor: '#ec7211',
                '&:hover': {
                  backgroundColor: '#c75e0c'
                }
              }}
            >
              {createTask.isPending ? 'יוצר...' : (initialData?.type === 'meeting' ? 'צור פגישה' : 'צור משימה')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                setIsEditing(false);
                onClose?.();
              }}
            >
              סגור
            </Button>
            {!effectiveIsEditing && (
              <Button
                color="error"
                variant="outlined"
                onClick={handleDelete}
                disabled={!task?._id || updateTask.isPending || deleteTask.isPending}
              >
                מחק
              </Button>
            )}
            {!effectiveIsEditing && (
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                disabled={!task?._id || updateTask.isPending}
              >
                ערוך
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkCompleted}
              disabled={!task?._id || task?.status === 'completed' || updateTask.isPending || effectiveIsEditing}
            >
              סמן כהושלמה
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;

