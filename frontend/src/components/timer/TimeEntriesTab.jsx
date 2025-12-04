// frontend/src/components/timer/TimeEntriesTab.jsx
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Grid
} from '@mui/material';
import {
  Delete as DeleteIcon, Add as AddIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useClientTimeEntries, formatDuration, formatDurationReadable } from '../../admin/hooks/useTimer';

const taskTypeLabels = {
  general: { label: 'כללי', color: 'default' },
  meeting: { label: 'פגישה', color: 'primary' },
  development: { label: 'פיתוח', color: 'success' },
  support: { label: 'תמיכה', color: 'warning' },
  planning: { label: 'תכנון', color: 'info' },
  other: { label: 'אחר', color: 'default' }
};

const TimeEntriesTab = ({ clientId }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    startTime: null,
    endTime: null,
    taskType: 'general',
    description: ''
  });

  const { entries, stats, statsByTask, isLoading, addManualEntry, deleteEntry, isAdding, isDeleting } = useClientTimeEntries(clientId);

  const handleAddManual = async () => {
    try {
      // המרת Date objects ל-ISO strings
      const entryData = {
        ...manualEntry,
        startTime: manualEntry.startTime?.toISOString(),
        endTime: manualEntry.endTime?.toISOString()
      };
      await addManualEntry(entryData);
      setAddDialogOpen(false);
      setManualEntry({
        startTime: null,
        endTime: null,
        taskType: 'general',
        description: ''
      });
    } catch (error) {
      console.error('Error adding manual entry:', error);
    }
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('האם למחוק את רשומת הזמן?')) {
      await deleteEntry(entryId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">רשומות זמן</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
          הוסף זמן ידנית
        </Button>
      </Box>

      {/* סטטיסטיקות */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">סה"כ זמן</Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatDurationReadable(stats?.totalTime || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">מספר סשנים</Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats?.totalSessions || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">ממוצע לסשן</Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatDurationReadable(Math.round(stats?.avgSessionTime || 0))}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* פילוח לפי סוג משימה */}
      {statsByTask && statsByTask.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>פילוח לפי סוג משימה</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {statsByTask.map((stat) => (
              <Chip
                key={stat._id}
                label={`${taskTypeLabels[stat._id]?.label || stat._id}: ${formatDurationReadable(stat.totalTime)}`}
                color={taskTypeLabels[stat._id]?.color || 'default'}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* טבלת רשומות */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : entries.length === 0 ? (
        <Alert severity="info">אין רשומות זמן עדיין</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>תאריך</TableCell>
                <TableCell>זמן התחלה</TableCell>
                <TableCell>זמן סיום</TableCell>
                <TableCell>משך</TableCell>
                <TableCell>סוג משימה</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry._id} hover>
                  <TableCell>
                    {new Date(entry.startTime).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.startTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {entry.endTime
                      ? new Date(entry.endTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {formatDuration(entry.duration || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={taskTypeLabels[entry.taskType]?.label || entry.taskType}
                      color={taskTypeLabels[entry.taskType]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.description || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(entry._id)}
                      disabled={isDeleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog להוספה ידנית */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוסף זמן ידנית</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DateTimePicker
                label="זמן התחלה"
                value={manualEntry.startTime}
                onChange={(newValue) => setManualEntry(prev => ({ ...prev, startTime: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
              <DateTimePicker
                label="זמן סיום"
                value={manualEntry.endTime}
                onChange={(newValue) => setManualEntry(prev => ({ ...prev, endTime: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            <FormControl fullWidth>
              <InputLabel>סוג משימה</InputLabel>
              <Select
                value={manualEntry.taskType}
                label="סוג משימה"
                onChange={(e) => setManualEntry(prev => ({ ...prev, taskType: e.target.value }))}
              >
                {Object.entries(taskTypeLabels).map(([value, config]) => (
                  <MenuItem key={value} value={value}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="תיאור"
              value={manualEntry.description}
              onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleAddManual}
            disabled={isAdding || !manualEntry.startTime || !manualEntry.endTime}
          >
            {isAdding ? <CircularProgress size={20} /> : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeEntriesTab;

