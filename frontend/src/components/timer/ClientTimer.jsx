// frontend/src/components/timer/ClientTimer.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  MoreVert as MoreIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useActiveTimer, useClientTimeEntries, formatDuration, formatDurationReadable } from '../../admin/hooks/useTimer';

const taskTypes = [
  { value: 'general', label: 'כללי', color: '#9e9e9e' },
  { value: 'meeting', label: 'פגישה', color: '#2196f3' },
  { value: 'development', label: 'פיתוח', color: '#4caf50' },
  { value: 'support', label: 'תמיכה', color: '#ff9800' },
  { value: 'planning', label: 'תכנון', color: '#9c27b0' },
  { value: 'other', label: 'אחר', color: '#607d8b' }
];

const ClientTimer = ({ clientId, clientName }) => {
  const {
    activeTimer,
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    isStarting,
    isStopping
  } = useActiveTimer();

  const { stats } = useClientTimeEntries(clientId);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState('general');
  const [description, setDescription] = useState('');

  const timerClientId = activeTimer?.clientId?._id || activeTimer?.clientId;
  const isTimerForThisClient = timerClientId === clientId || timerClientId?.toString() === clientId?.toString();

  const handleStart = async () => {
    if (activeTimer && !isTimerForThisClient) {
      alert(`יש טיימר פעיל ללקוח אחר. עצור אותו קודם.`);
      return;
    }
    setStartDialogOpen(true);
  };

  const confirmStart = async () => {
    try {
      await startTimer(clientId, taskType, description);
      setStartDialogOpen(false);
      setDescription('');
      setTaskType('general');
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopTimer();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  return (
    <>
      <Paper
        elevation={isTimerForThisClient && isRunning ? 4 : 1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isTimerForThisClient && isRunning ? 'success.light' : 'background.paper',
          border: isTimerForThisClient && isRunning ? '2px solid' : 'none',
          borderColor: 'success.main',
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TimerIcon 
            color={isTimerForThisClient && isRunning ? 'success' : 'action'} 
            sx={{ 
              fontSize: 32,
              animation: isTimerForThisClient && isRunning ? 'pulse 1s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }}
          />
          
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isTimerForThisClient && isRunning 
                ? formatDuration(elapsedTime)
                : 'טיימר'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              סה"כ: {formatDurationReadable(stats?.totalTime || 0)}
              {stats?.totalSessions > 0 && ` (${stats.totalSessions} sessions)`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isTimerForThisClient && isRunning ? (
            <>
              <Chip 
                label={taskTypes.find(t => t.value === activeTimer?.taskType)?.label || 'כללי'}
                size="small"
                sx={{ 
                  bgcolor: taskTypes.find(t => t.value === activeTimer?.taskType)?.color,
                  color: 'white'
                }}
              />
              <Button
                variant="contained"
                color="error"
                startIcon={isStopping ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
                onClick={handleStop}
                disabled={isStopping}
              >
                עצור
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={isStarting ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
              onClick={handleStart}
              disabled={isStarting || (activeTimer && !isTimerForThisClient)}
            >
              {activeTimer && !isTimerForThisClient ? 'טיימר פעיל במקום אחר' : 'התחל'}
            </Button>
          )}

          <Tooltip title="אפשרויות">
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <AddIcon sx={{ mr: 1 }} /> הוסף זמן ידנית
        </MenuItem>
      </Menu>

      {/* Start Dialog */}
      <Dialog open={startDialogOpen} onClose={() => setStartDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>התחל טיימר - {clientName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>סוג משימה</InputLabel>
              <Select
                value={taskType}
                label="סוג משימה"
                onChange={(e) => setTaskType(e.target.value)}
              >
                {taskTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: type.color 
                      }} />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="תיאור (אופציונלי)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialogOpen(false)}>ביטול</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={confirmStart}
            disabled={isStarting}
          >
            {isStarting ? <CircularProgress size={20} /> : 'התחל'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientTimer;




