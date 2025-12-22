import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Autocomplete,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useClients } from '../../../hooks/useClients';
import { useProjects } from '../../../hooks/useTasks';

// פונקציית עזר להמרת ערך ל-Date object
const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const mergeDateAndTime = (datePart, timePart) => {
  if (!datePart && !timePart) return null;
  const base = datePart ? new Date(datePart) : new Date(timePart);
  const time = timePart ? new Date(timePart) : new Date(datePart);
  base.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return base;
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'נמוכה' },
  { value: 'medium', label: 'בינונית' },
  { value: 'high', label: 'גבוהה' },
  { value: 'urgent', label: 'דחופה' }
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'לביצוע' },
  { value: 'in_progress', label: 'בטיפול' },
  { value: 'waiting', label: 'ממתין' },
  { value: 'completed', label: 'הושלם' }
];

const COLOR_OPTIONS = [
  { value: '#1976d2', label: 'כחול' },
  { value: '#d32f2f', label: 'אדום' },
  { value: '#388e3c', label: 'ירוק' },
  { value: '#f57c00', label: 'כתום' },
  { value: '#7b1fa2', label: 'סגול' },
  { value: '#0288d1', label: 'תכלת' },
  { value: '#c2185b', label: 'ורוד' },
  { value: '#5d4037', label: 'חום' },
  { value: '#455a64', label: 'אפור כהה' },
  { value: '#0097a7', label: 'ציאן' }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 דקות' },
  { value: 30, label: '30 דקות' },
  { value: 45, label: '45 דקות' },
  { value: 60, label: '1 שעה' },
  { value: 90, label: '1.5 שעות' },
  { value: 120, label: '2 שעות' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'לא חוזר' },
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'monthly', label: 'חודשי' },
];

const TaskForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  formId = 'task-form',
  showActions = true,
  onModeChange
}) => {
  // ברירות מחדל: התחלה עכשיו, יעד שעה קדימה – לפי זמן מקומי
  const defaultStart = new Date();
  const defaultDue = new Date(defaultStart.getTime() + 60 * 60 * 1000); // שעה קדימה

  // Mode state: 'task' or 'meeting'
  const [mode, setMode] = useState(initialData?.type || 'task');

  const { register, handleSubmit, control, reset, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      color: '#1976d2',
      startDate: defaultStart,
      dueDate: defaultDue,
      projectId: null,
      relatedClient: null,
      subtasks: initialData?.subtasks || [],
      // Meeting-specific fields
      duration: 60, // Default 1 hour
      recurrence: 'none',
      location: '',
      type: 'task',
      ...initialData
    }
  });

  const watchStartDate = watch('startDate');
  const watchDuration = watch('duration');
  const watchMode = mode;

  const { data: clientsResponse, isLoading: isLoadingClients } = useClients();
  const { data: projectsResponse } = useProjects();
  const clients = clientsResponse?.data || [];
  const projects = projectsResponse?.data || [];

  const lastAutoDueRef = useRef(defaultDue);

  // Auto dueDate for tasks: רק כאשר dueDate ריק או עדיין במצב "אוטומטי"
  useEffect(() => {
    if (watchMode === 'task' && watchStartDate && watchStartDate instanceof Date) {
      const due = new Date(watchStartDate.getTime() + 60 * 60 * 1000);
      const currentDue = watch('dueDate');
      const canAutoSet = !currentDue || isCloseTo(currentDue, lastAutoDueRef.current);

      if (canAutoSet && !isCloseTo(currentDue, due)) {
        setValue('dueDate', due, { shouldDirty: false });
        lastAutoDueRef.current = due;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchStartDate, watchMode]);

  // Auto calculate end time for meetings based on duration
  useEffect(() => {
    if (watchMode === 'meeting' && watchStartDate && watchStartDate instanceof Date && watchDuration) {
      const start = new Date(watchStartDate);
      const end = new Date(start.getTime() + watchDuration * 60 * 1000);
      setValue('dueDate', end, { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchStartDate, watchDuration, watchMode]);

  const isCloseTo = (a, b, toleranceMs = 60 * 1000) => {
    if (!a || !b) return false;
    const da = parseDate(a);
    const db = parseDate(b);
    if (!da || !db) return false;
    return Math.abs(da.getTime() - db.getTime()) <= toleranceMs;
  };

  useEffect(() => {
    const hasRealData = initialData && (
      initialData._id ||
      initialData.dueDate ||
      initialData.startDate ||
      initialData.title
    );

    if (hasRealData) {
      const itemType = initialData.type || 'task';
      setMode(itemType);
      // Notify parent component of mode
      if (onModeChange) {
        onModeChange(itemType);
      }
      reset({
        ...initialData,
        type: itemType,
        dueDate: parseDate(initialData.dueDate),
        startDate: parseDate(initialData.startDate),
        relatedClient: initialData.relatedClient || null,
        subtasks: initialData.subtasks || [],
        duration: initialData.duration || 60,
        recurrence: initialData.recurrence || 'none',
        location: initialData.location || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?._id, initialData?.title, initialData?.dueDate, initialData?.startDate, initialData?.type]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      type: mode, // Add type field
      relatedClient: data.relatedClient?._id || data.relatedClient,
      projectId: data.projectId?._id || data.projectId,
      subtasks: (data.subtasks || []).map((s) => ({
        ...s,
        done:
          s?.done === true ||
          s?.done === 'true' ||
          s?.done === 1 ||
          s?.done === '1' ||
          s?.done === 'done'
      }))
    };

    // For meetings, ensure status is 'scheduled' and remove priority
    if (mode === 'meeting') {
      formattedData.status = 'scheduled';
      delete formattedData.priority;
    }

    onSubmit(formattedData);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setValue('type', newMode);
      // Notify parent component of mode change
      if (onModeChange) {
        onModeChange(newMode);
      }
      // Reset meeting-specific fields when switching to task
      if (newMode === 'task') {
        setValue('duration', 60);
        setValue('recurrence', 'none');
        setValue('location', '');
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box
        id={formId}
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ width: '100%' }}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Mode Switcher - Top of Modal */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                flex: 1,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: '1px solid #e5e7eb',
                '&.Mui-selected': {
                  backgroundColor: '#ec7211',
                  color: '#ffffff',
                  borderColor: '#ec7211',
                  '&:hover': {
                    backgroundColor: '#c75e0c',
                  }
                },
                '&:not(.Mui-selected)': {
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: '#e5e7eb',
                  }
                }
              }
            }}
          >
            <ToggleButton value="task">
              ✅ משימה
            </ToggleButton>
            <ToggleButton value="meeting">
              📅 פגישה
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Title Field - Different label based on mode */}
          <TextField
            label={mode === 'meeting' ? 'כותרת הפגישה' : 'כותרת המשימה'}
            {...register('title', { required: 'שדה חובה' })}
            fullWidth
            required
          />

          {/* Priority and Status - Only for Tasks */}
          {mode === 'task' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="עדיפות"
                      fullWidth
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="סטטוס"
                      fullWidth
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Date/Time Fields - Different layout for Task vs Meeting */}
          {mode === 'task' ? (
            // Task Mode: Start Date and Due Date
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          value={parseDate(value)}
                          onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              label: 'תאריך התחלה',
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ width: 128 }}>
                        <TimePicker
                          value={parseDate(value)}
                          onChange={(newTime) => onChange(mergeDateAndTime(parseDate(value), newTime))}
                          ampm={false}
                          views={['hours', 'minutes']}
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              label: 'שעה',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          value={parseDate(value)}
                          onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              label: 'תאריך יעד',
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ width: 128 }}>
                        <TimePicker
                          value={parseDate(value)}
                          onChange={(newTime) => onChange(mergeDateAndTime(parseDate(value), newTime))}
                          ampm={false}
                          views={['hours', 'minutes']}
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              label: 'שעה',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          ) : (
            // Meeting Mode: Date + Start Time, then Duration
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={parseDate(value)}
                        onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            label: 'תאריך',
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TimePicker
                        value={parseDate(value)}
                        onChange={(newTime) => onChange(mergeDateAndTime(parseDate(value), newTime))}
                        ampm={false}
                        views={['hours', 'minutes']}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            label: 'שעת התחלה',
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="משך זמן"
                    fullWidth
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="recurrence"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="חזרתיות"
                    fullWidth
                  >
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                label="מיקום / קישור זום"
                {...register('location')}
                fullWidth
                placeholder="הזן מיקום או קישור לפגישה..."
              />
            </>
          )}

          {/* Project and Client */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="projectId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={projects}
                    getOptionLabel={(option) => option.name || ''}
                    value={value && typeof value === 'string' ? projects.find(p => p._id === value) : value}
                    onChange={(_, newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="פרויקט"
                        placeholder="בחר פרויקט..."
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="relatedClient"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => option.personalInfo?.fullName || ''}
                    value={value && typeof value === 'string' ? clients.find(c => c._id === value) : value}
                    onChange={(_, newValue) => onChange(newValue)}
                    loading={isLoadingClients}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="לקוח מקושר"
                        placeholder="בחר לקוח..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Description */}
          <TextField
            label={mode === 'meeting' ? 'תיאור הפגישה' : 'תיאור'}
            {...register('description')}
            fullWidth
            multiline
            rows={4}
            sx={{ minHeight: '100px' }}
          />

          {/* Color Picker */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {mode === 'meeting' ? 'צבע הפגישה' : 'צבע המשימה'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Controller
                name="color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    {COLOR_OPTIONS.map((color) => (
                      <Box
                        key={color.value}
                        onClick={() => onChange(color.value)}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: color.value,
                          border: value === color.value ? '3px solid #ec7211' : '2px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            borderColor: '#ec7211',
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {value === color.value && (
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }}
                          >
                            ✓
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              />
            </Box>
          </Box>

          {/* Footer Actions - Only if showActions is true */}
          {showActions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, pt: 2, borderTop: '1px solid #f3f4f6' }}>
              <Button onClick={onCancel} disabled={isLoading}>
                ביטול
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  backgroundColor: '#ec7211',
                  '&:hover': {
                    backgroundColor: '#c75e0c'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : (initialData ? (mode === 'meeting' ? 'עדכן פגישה' : 'עדכן משימה') : (mode === 'meeting' ? 'צור פגישה' : 'צור משימה'))}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;
