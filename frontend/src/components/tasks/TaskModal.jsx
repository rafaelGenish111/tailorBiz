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
import { useTask, useUpdateTask, useDeleteTask } from '../../admin/hooks/useTasks';
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

const TaskModal = ({ open, taskId, onClose }) => {
  const { data: taskResponse, isLoading, isError } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isEditing, setIsEditing] = React.useState(false);

  const task = taskResponse?.data;

  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];

  const handleToggleSubtask = async (index) => {
    if (!task?._id) return;
    const next = subtasks.map((s, i) => (i === index ? { ...s, done: !Boolean(s?.done) } : s));
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
    if (!task?._id) return;
    // TaskForm כבר מנרמל תתי-משימות; כאן פשוט שולחים עדכון מלא
    updateTask.mutate(
      { id: task._id, data },
      {
        onSuccess: () => setIsEditing(false)
      }
    );
  };

  const handleDelete = async () => {
    if (!task?._id) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('האם למחוק את המשימה לצמיתות?')) return;
    await deleteTask.mutateAsync(task._id);
    setIsEditing(false);
    onClose?.();
  };

  const completedCount = subtasks.filter((s) => Boolean(s?.done)).length;
  const totalCount = subtasks.length;

  return (
    <Dialog
      open={Boolean(open && taskId)}
      onClose={() => {
        setIsEditing(false);
        onClose?.();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
            {task?.title || 'משימה'}
          </Typography>
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
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">שגיאה בטעינת המשימה</Alert>
        ) : !task ? (
          <Alert severity="warning">משימה לא נמצאה</Alert>
        ) : isEditing ? (
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
                            textDecoration: Boolean(s?.done) ? 'line-through' : 'none',
                            color: Boolean(s?.done) ? 'text.secondary' : 'text.primary'
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
        <Button
          onClick={() => {
            setIsEditing(false);
            onClose?.();
          }}
        >
          סגור
        </Button>
        {!isEditing && (
          <Button
            color="error"
            variant="outlined"
            onClick={handleDelete}
            disabled={!task?._id || updateTask.isPending || deleteTask.isPending}
          >
            מחק
          </Button>
        )}
        {!isEditing && (
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
          disabled={!task?._id || task?.status === 'completed' || updateTask.isPending || isEditing}
        >
          סמן כהושלמה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;

