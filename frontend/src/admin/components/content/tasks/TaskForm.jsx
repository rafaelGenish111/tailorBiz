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
  Collapse,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText
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

const isCloseTo = (a, b, toleranceMs = 60 * 1000) => {
  if (!a || !b) return false;
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return false;
  return Math.abs(da.getTime() - db.getTime()) <= toleranceMs;
};

const TaskForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  formId = 'task-form',
  showActions = true
}) => {
  // ברירות מחדל: התחלה עכשיו, יעד שעה קדימה – לפי זמן מקומי
  const defaultStart = new Date();
  const defaultDue = new Date(defaultStart.getTime() + 60 * 60 * 1000); // שעה קדימה

  const { register, handleSubmit, control, reset, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      color: '#1976d2', // ברירת מחדל כחול
      // ברירת מחדל: התחלה עכשיו
      startDate: defaultStart,
      // ברירת מחדל: יעד שעה קדימה
      dueDate: defaultDue,
      projectId: null,
      relatedClient: null,
      // חזרתיות (UI)
      recurrenceMode: 'none', // none | daily | weekly | monthly | yearly | custom
      recurrenceCustomFrequency: 'weekly', // daily | weekly | monthly | yearly
      recurrenceEveryDays: 1,
      recurrenceEveryWeeks: 1,
      recurrenceEveryMonths: 1,
      recurrenceEveryYears: 1,
      recurrenceDaysOfWeek: [],
      subtasks: initialData?.subtasks || [],
      ...initialData
    }
  });

  const {
    fields: subtaskFields,
    append: appendSubtask,
    remove: removeSubtask
  } = useFieldArray({
    control,
    name: 'subtasks'
  });

  useEffect(() => {
    // ב-create אנחנו מקבלים רק { status }, לא רוצים למחוק ברירות מחדל של זמנים
    const hasRealData = initialData && (
      initialData._id ||
      initialData.dueDate ||
      initialData.startDate ||
      initialData.title
    );

    if (hasRealData) {
      const startForRecurrence = parseDate(initialData.startDate) || parseDate(initialData.dueDate) || defaultStart;
      const recurrence = initialData.recurrence || {};
      const isRecurring = Boolean(initialData.isRecurring);
      const freq = recurrence.frequency;
      const interval = typeof recurrence.interval === 'number' && recurrence.interval > 0 ? recurrence.interval : 1;
      const daysOfWeek = Array.isArray(recurrence.daysOfWeek) ? recurrence.daysOfWeek : [];

      let recurrenceMode = 'none';
      let recurrenceCustomFrequency = 'weekly';
      let recurrenceEveryDays = 1;
      let recurrenceEveryWeeks = 1;
      let recurrenceEveryMonths = 1;
      let recurrenceEveryYears = 1;
      let recurrenceDaysOfWeek = [];

      if (isRecurring && freq === 'daily') {
        recurrenceMode = interval > 1 ? 'custom' : 'daily';
        recurrenceCustomFrequency = 'daily';
        recurrenceEveryDays = interval;
      } else if (isRecurring && freq === 'weekly') {
        const startDow = startForRecurrence instanceof Date ? startForRecurrence.getDay() : 0;
        const normalizedDays = daysOfWeek.length ? daysOfWeek : [startDow];
        recurrenceEveryWeeks = interval;
        recurrenceDaysOfWeek = normalizedDays;
        recurrenceCustomFrequency = 'weekly';
        recurrenceMode = (interval > 1 || normalizedDays.length !== 1) ? 'custom' : 'weekly';
      } else if (isRecurring && freq === 'monthly') {
        recurrenceCustomFrequency = 'monthly';
        recurrenceEveryMonths = interval;
        recurrenceMode = interval > 1 ? 'custom' : 'monthly';
      } else if (isRecurring && freq === 'yearly') {
        recurrenceCustomFrequency = 'yearly';
        recurrenceEveryYears = interval;
        recurrenceMode = interval > 1 ? 'custom' : 'yearly';
      }

      reset({
        ...initialData,
        dueDate: parseDate(initialData.dueDate),
        startDate: parseDate(initialData.startDate),
        relatedClient: initialData.relatedClient || null,
        subtasks: initialData.subtasks || [],
        recurrenceMode,
        recurrenceCustomFrequency,
        recurrenceEveryDays,
        recurrenceEveryWeeks,
        recurrenceEveryMonths,
        recurrenceEveryYears,
        recurrenceDaysOfWeek
      });
    }
  }, [initialData, reset]);

  const { data: clientsResponse, isLoading: isLoadingClients } = useClients();
  const { data: projectsResponse } = useProjects();
  const clients = clientsResponse?.data || [];
  const projects = projectsResponse?.data || [];

  // Auto dueDate: רק כאשר dueDate ריק או עדיין במצב "אוטומטי"
  const watchStartDate = watch('startDate');
  const watchDueDate = watch('dueDate');
  const watchRecurrenceMode = watch('recurrenceMode');
  const watchRecurrenceDays = watch('recurrenceDaysOfWeek');
  const watchRecurrenceCustomFrequency = watch('recurrenceCustomFrequency');
  const watchRecurrenceEveryDays = watch('recurrenceEveryDays');
  const watchRecurrenceEveryWeeks = watch('recurrenceEveryWeeks');
  const watchRecurrenceEveryMonths = watch('recurrenceEveryMonths');
  const watchRecurrenceEveryYears = watch('recurrenceEveryYears');
  const lastAutoDueRef = useRef(defaultDue);

  const [subtasksExpanded, setSubtasksExpanded] = useState(false);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);

  useEffect(() => {
    if (subtaskFields.length > 0) {
      setSubtasksExpanded(true);
    }
  }, [subtaskFields.length]);

  useEffect(() => {
    if (watchStartDate && watchStartDate instanceof Date) {
      const due = new Date(watchStartDate.getTime() + 60 * 60 * 1000);
      const canAutoSet =
        !watchDueDate ||
        isCloseTo(watchDueDate, lastAutoDueRef.current);

      if (canAutoSet) {
        setValue('dueDate', due);
        lastAutoDueRef.current = due;
      }
    }
  }, [watchStartDate, watchDueDate, setValue]);

  // אם בחרו חזרתיות שבועית/מותאמת ואין ימים מסומנים – נבחר את היום של startDate כברירת מחדל
  useEffect(() => {
    const shouldDefaultWeeklyDays =
      watchRecurrenceMode === 'weekly' ||
      (watchRecurrenceMode === 'custom' && watchRecurrenceCustomFrequency === 'weekly');
    if (!shouldDefaultWeeklyDays) return;
    const hasDays = Array.isArray(watchRecurrenceDays) && watchRecurrenceDays.length > 0;
    if (hasDays) return;
    const start = parseDate(watchStartDate) || parseDate(watchDueDate) || new Date();
    setValue('recurrenceDaysOfWeek', [start.getDay()]);
  }, [watchRecurrenceMode, watchRecurrenceCustomFrequency, watchRecurrenceDays, watchStartDate, watchDueDate, setValue]);

  const handleFormSubmit = (data) => {
    const start = parseDate(data.startDate) || parseDate(data.dueDate) || new Date();
    const startDow = start instanceof Date ? start.getDay() : 0;

    const recurrenceMode = data.recurrenceMode || 'none';
    const customFreq = (data.recurrenceCustomFrequency || 'weekly').toString();
    let isRecurring = false;
    let recurrence = undefined;

    const normalizeWeeklyDays = () => {
      const days = Array.isArray(data.recurrenceDaysOfWeek) && data.recurrenceDaysOfWeek.length
        ? data.recurrenceDaysOfWeek.map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n))
        : [startDow];
      return Array.from(new Set(days)).sort((a, b) => a - b);
    };

    const build = (freq) => {
      if (freq === 'daily') {
        const interval = Math.max(1, parseInt(data.recurrenceEveryDays, 10) || 1);
        return { frequency: 'daily', interval, daysOfWeek: [] };
      }
      if (freq === 'weekly') {
        const interval = Math.max(1, parseInt(data.recurrenceEveryWeeks, 10) || 1);
        return { frequency: 'weekly', interval, daysOfWeek: normalizeWeeklyDays() };
      }
      if (freq === 'monthly') {
        const interval = Math.max(1, parseInt(data.recurrenceEveryMonths, 10) || 1);
        return { frequency: 'monthly', interval };
      }
      if (freq === 'yearly') {
        const interval = Math.max(1, parseInt(data.recurrenceEveryYears, 10) || 1);
        return { frequency: 'yearly', interval };
      }
      return undefined;
    };

    if (recurrenceMode === 'none') {
      isRecurring = false;
      recurrence = undefined;
    } else if (recurrenceMode === 'custom') {
      isRecurring = true;
      recurrence = build(customFreq);
      if (!recurrence) isRecurring = false;
    } else {
      isRecurring = true;
      recurrence = build(recurrenceMode);
      if (!recurrence) isRecurring = false;
    }

    // Transform relatedClient to ID if it's an object
    const formattedData = {
      ...data,
      relatedClient: data.relatedClient?._id || data.relatedClient,
      projectId: data.projectId?._id || data.projectId,
      // חזרתיות - נשמרת בשרת
      isRecurring,
      recurrence,
      // נרמול done של תתי-משימות ל-boolean (מגיע מה-select כמחרוזת)
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

    // ניקוי שדות UI שלא קיימים במודל
    delete formattedData.recurrenceMode;
    delete formattedData.recurrenceCustomFrequency;
    delete formattedData.recurrenceEveryDays;
    delete formattedData.recurrenceEveryWeeks;
    delete formattedData.recurrenceEveryMonths;
    delete formattedData.recurrenceEveryYears;
    delete formattedData.recurrenceDaysOfWeek;

    onSubmit(formattedData);
  };

  // Helper component for Priority Chips (Selection Pills)
  const PriorityChips = ({ value, onChange }) => {
    const priorities = [
      { value: 'low', label: 'נמוכה', selectedColor: 'bg-green-500 text-white border-green-500' },
      { value: 'medium', label: 'בינונית', selectedColor: 'bg-yellow-500 text-white border-yellow-500' },
      { value: 'high', label: 'גבוהה', selectedColor: 'bg-orange-500 text-white border-orange-500' },
      { value: 'urgent', label: 'דחופה', selectedColor: 'bg-red-500 text-white border-red-500' }
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
              value === priority.value
                ? `${priority.selectedColor} shadow-sm`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {priority.label}
          </button>
        ))}
      </div>
    );
  };

  // Helper component for Status Chips (Selection Pills)
  const StatusChips = ({ value, onChange }) => {
    const statuses = [
      { value: 'todo', label: 'לביצוע', selectedColor: 'bg-gray-500 text-white border-gray-500' },
      { value: 'in_progress', label: 'בטיפול', selectedColor: 'bg-blue-500 text-white border-blue-500' },
      { value: 'waiting', label: 'ממתין', selectedColor: 'bg-yellow-500 text-white border-yellow-500' },
      { value: 'completed', label: 'הושלם', selectedColor: 'bg-green-500 text-white border-green-500' }
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
              value === status.value
                ? `${status.selectedColor} shadow-sm`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    );
  };

  // Helper component for Form Section
  const FormSection = ({ title, children, className = '', showDivider = false }) => (
    <div className={`space-y-6 ${className}`}>
      {showDivider && <hr className="my-8 border-gray-100" />}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {title}
        </h3>
      )}
      {children}
    </div>
  );

  // Helper component for Form Field with label above
  const FormField = ({ label, children, className = '' }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      {children}
    </div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box
        id={formId}
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full"
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
            <div className="p-8 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-10">
              {/* Task Title */}
              <FormField label="כותרת המשימה *">
                <TextField
                  fullWidth
                  {...register('title', { required: 'שדה חובה' })}
                  required
                  placeholder="הזן כותרת למשימה..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '56px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      fontSize: '1.125rem',
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ec7211',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </FormField>

              {/* Priority */}
              <FormField label="עדיפות">
                <Controller
                  name="priority"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <PriorityChips value={value || 'medium'} onChange={onChange} />
                  )}
                />
              </FormField>

              {/* Status */}
              <FormField label="סטטוס">
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <StatusChips value={value || 'todo'} onChange={onChange} />
                  )}
                />
              </FormField>

              {/* Color Picker */}
              <FormField label="צבע המשימה">
                <Controller
                  name="color"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-wrap gap-3">
                      {[
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
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => onChange(color.value)}
                          className={`w-12 h-12 rounded-full transition-all hover:scale-110 ${
                            value === color.value
                              ? 'ring-4 ring-[#ec7211] ring-offset-2 ring-offset-white border-2 border-white shadow-md'
                              : 'border-2 border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        >
                          {value === color.value && (
                            <span className="text-white text-sm font-bold drop-shadow-md flex items-center justify-center h-full">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </FormField>

              {/* Start Date */}
              <FormField label="תאריך התחלה">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <DatePicker
                          value={parseDate(value)}
                          onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true,
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: '#ffffff',
                                  '& fieldset': {
                                    borderColor: '#e5e7eb',
                                    borderWidth: '1px',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#d1d5db',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec7211',
                                    borderWidth: '2px',
                                  },
                                },
                              }
                            } 
                          }}
                        />
                      </div>
                      <div className="w-32">
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
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: '#ffffff',
                                  '& fieldset': {
                                    borderColor: '#e5e7eb',
                                    borderWidth: '1px',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#d1d5db',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec7211',
                                    borderWidth: '2px',
                                  },
                                },
                              }
                            } 
                          }}
                        />
                      </div>
                    </div>
                  )}
                />
              </FormField>

              {/* Due Date */}
              <FormField label="תאריך יעד">
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <DatePicker
                          value={parseDate(value)}
                          onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true,
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: '#ffffff',
                                  '& fieldset': {
                                    borderColor: '#e5e7eb',
                                    borderWidth: '1px',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#d1d5db',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec7211',
                                    borderWidth: '2px',
                                  },
                                },
                              }
                            } 
                          }}
                        />
                      </div>
                      <div className="w-32">
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
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: '#ffffff',
                                  '& fieldset': {
                                    borderColor: '#e5e7eb',
                                    borderWidth: '1px',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#d1d5db',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec7211',
                                    borderWidth: '2px',
                                  },
                                },
                              }
                            } 
                          }}
                        />
                      </div>
                    </div>
                  )}
                />
              </FormField>

              {/* Project */}
              <FormField label="פרויקט">
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
                          placeholder="בחר פרויקט..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: '#ffffff',
                              '& fieldset': {
                                borderColor: '#e5e7eb',
                                borderWidth: '1px',
                              },
                              '&:hover fieldset': {
                                borderColor: '#d1d5db',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#ec7211',
                                borderWidth: '2px',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  )}
                />
              </FormField>

              {/* Client */}
              <FormField label="לקוח מקושר">
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: '#ffffff',
                              '& fieldset': {
                                borderColor: '#e5e7eb',
                                borderWidth: '1px',
                              },
                              '&:hover fieldset': {
                                borderColor: '#d1d5db',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#ec7211',
                                borderWidth: '2px',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  )}
                />
              </FormField>

              {/* Description */}
              <FormField label="תיאור">
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="הוסף תיאור למשימה..."
                  {...register('description')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      minHeight: '120px',
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ec7211',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </FormField>

              {/* Recurrence */}
              <FormField label="חזרתיות">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {(() => {
                    const start = parseDate(watchStartDate) || parseDate(watchDueDate) || new Date();
                    const dowLabels = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
                    const mode = watchRecurrenceMode || 'none';
                    const customFreq = watchRecurrenceCustomFrequency || 'weekly';

                        const daysForSummary = () => {
                          const raw = Array.isArray(watchRecurrenceDays) && watchRecurrenceDays.length ? watchRecurrenceDays : [start.getDay()];
                          return raw.map((d) => dowLabels[parseInt(d, 10)]).filter(Boolean);
                        };

                        const summary = () => {
                          if (mode === 'none') return 'לא חוזר';
                          if (mode === 'daily') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryDays, 10) || 1);
                            return every === 1 ? 'כל יום' : `כל ${every} ימים`;
                          }
                          if (mode === 'weekly') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryWeeks, 10) || 1);
                            const days = daysForSummary();
                            const daysStr = days.length ? ` • ${days.join(', ')}` : '';
                            return every === 1 ? `כל שבוע${daysStr}` : `כל ${every} שבועות${daysStr}`;
                          }
                          if (mode === 'monthly') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryMonths, 10) || 1);
                            return every === 1 ? 'כל חודש' : `כל ${every} חודשים`;
                          }
                          if (mode === 'yearly') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryYears, 10) || 1);
                            return every === 1 ? 'כל שנה' : `כל ${every} שנים`;
                          }
                          // custom
                          if (customFreq === 'daily') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryDays, 10) || 1);
                            return `מותאם: כל ${every} ימים`;
                          }
                          if (customFreq === 'weekly') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryWeeks, 10) || 1);
                            const days = daysForSummary();
                            return `מותאם: כל ${every} שבועות${days.length ? ` • ${days.join(', ')}` : ''}`;
                          }
                          if (customFreq === 'monthly') {
                            const every = Math.max(1, parseInt(watchRecurrenceEveryMonths, 10) || 1);
                            return `מותאם: כל ${every} חודשים`;
                          }
                          const every = Math.max(1, parseInt(watchRecurrenceEveryYears, 10) || 1);
                          return `מותאם: כל ${every} שנים`;
                        };

                        const choosePreset = (nextMode) => {
                          setValue('recurrenceMode', nextMode);
                          if (nextMode === 'none') return;
                          if (nextMode === 'daily') setValue('recurrenceEveryDays', 1);
                          if (nextMode === 'weekly') {
                            setValue('recurrenceEveryWeeks', 1);
                            setValue('recurrenceDaysOfWeek', [start.getDay()]);
                          }
                          if (nextMode === 'monthly') setValue('recurrenceEveryMonths', 1);
                          if (nextMode === 'yearly') setValue('recurrenceEveryYears', 1);
                        };

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <div>
                                <Typography variant="subtitle1" fontWeight="bold" className="text-gray-900">
                                  חזרתיות
                                </Typography>
                                <Typography variant="body2" className="text-gray-600">
                                  {summary()}
                                </Typography>
                              </div>
                              <Button variant="outlined" onClick={() => setRecurrenceDialogOpen(true)}>
                                שנה
                              </Button>
                            </div>

                            <Dialog open={recurrenceDialogOpen} onClose={() => setRecurrenceDialogOpen(false)} maxWidth="xs" fullWidth>
                              <DialogTitle sx={{ fontWeight: 800 }}>חזרתיות</DialogTitle>
                              <DialogContent dividers>
                                <List dense disablePadding>
                                  {[
                                    { key: 'none', label: 'לא חוזר' },
                                    { key: 'daily', label: 'כל יום' },
                                    { key: 'weekly', label: 'כל שבוע' },
                                    { key: 'monthly', label: 'כל חודש' },
                                    { key: 'yearly', label: 'כל שנה' }
                                  ].map((it) => (
                                    <ListItemButton
                                      key={it.key}
                                      selected={mode === it.key}
                                      onClick={() => {
                                        choosePreset(it.key);
                                        setRecurrenceDialogOpen(false);
                                      }}
                                    >
                                      <ListItemText primary={it.label} />
                                    </ListItemButton>
                                  ))}
                                  <Divider sx={{ my: 1 }} />
                                  <ListItemButton
                                    selected={mode === 'custom'}
                                    onClick={() => {
                                      setValue('recurrenceMode', 'custom');
                                      setRecurrenceDialogOpen(true);
                                    }}
                                  >
                                    <ListItemText primary="מותאם אישית…" secondary="ימים מסוימים / כל כמה שבועות / חודשי / שנתי" />
                                  </ListItemButton>
                                </List>

                                {mode === 'custom' ? (
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                      מותאם אישית
                                    </Typography>
                                    <Controller
                                      name="recurrenceCustomFrequency"
                                      control={control}
                                      render={({ field: { value, onChange } }) => (
                                        <ToggleButtonGroup
                                          value={value || 'weekly'}
                                          exclusive
                                          onChange={(_, v) => { if (v) onChange(v); }}
                                          size="small"
                                          sx={{ mb: 2 }}
                                        >
                                          <ToggleButton value="daily">יומי</ToggleButton>
                                          <ToggleButton value="weekly">שבועי</ToggleButton>
                                          <ToggleButton value="monthly">חודשי</ToggleButton>
                                          <ToggleButton value="yearly">שנתי</ToggleButton>
                                        </ToggleButtonGroup>
                                      )}
                                    />

                                    {customFreq === 'daily' ? (
                                      <TextField
                                        type="number"
                                        fullWidth
                                        label="כל כמה ימים"
                                        inputProps={{ min: 1 }}
                                        {...register('recurrenceEveryDays', { valueAsNumber: true })}
                                      />
                                    ) : null}

                                    {customFreq === 'weekly' ? (
                                      <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                          <TextField
                                            type="number"
                                            fullWidth
                                            label="כל כמה שבועות"
                                            inputProps={{ min: 1 }}
                                            {...register('recurrenceEveryWeeks', { valueAsNumber: true })}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            ימים בשבוע
                                          </Typography>
                                          <Controller
                                            name="recurrenceDaysOfWeek"
                                            control={control}
                                            render={({ field: { value, onChange } }) => (
                                              <ToggleButtonGroup
                                                value={Array.isArray(value) ? value : []}
                                                onChange={(_, next) => onChange(next)}
                                                size="small"
                                              >
                                                <ToggleButton value={0}>א׳</ToggleButton>
                                                <ToggleButton value={1}>ב׳</ToggleButton>
                                                <ToggleButton value={2}>ג׳</ToggleButton>
                                                <ToggleButton value={3}>ד׳</ToggleButton>
                                                <ToggleButton value={4}>ה׳</ToggleButton>
                                                <ToggleButton value={5}>ו׳</ToggleButton>
                                                <ToggleButton value={6}>ש׳</ToggleButton>
                                              </ToggleButtonGroup>
                                            )}
                                          />
                                        </Grid>
                                      </Grid>
                                    ) : null}

                                    {customFreq === 'monthly' ? (
                                      <TextField
                                        type="number"
                                        fullWidth
                                        label="כל כמה חודשים"
                                        inputProps={{ min: 1 }}
                                        {...register('recurrenceEveryMonths', { valueAsNumber: true })}
                                      />
                                    ) : null}

                                    {customFreq === 'yearly' ? (
                                      <TextField
                                        type="number"
                                        fullWidth
                                        label="כל כמה שנים"
                                        inputProps={{ min: 1 }}
                                        {...register('recurrenceEveryYears', { valueAsNumber: true })}
                                      />
                                    ) : null}
                                  </Box>
                                ) : null}
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setRecurrenceDialogOpen(false)}>סגור</Button>
                              </DialogActions>
                            </Dialog>
                          </>
                        );
                      })()}
                    </div>
                  </FormField>

              {/* Color Picker - Row of colored circles */}
              <FormField label="צבע המשימה">
                <Controller
                  name="color"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-wrap gap-3">
                      {[
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
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => onChange(color.value)}
                          className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                            value === color.value
                              ? 'ring-4 ring-[#ec7211] ring-offset-2 ring-offset-white border-2 border-white shadow-md'
                              : 'border-2 border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        >
                          {value === color.value && (
                            <span className="text-white text-sm font-bold drop-shadow-md flex items-center justify-center h-full">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </FormField>

              {/* Recurrence */}
              <FormField label="חזרתיות">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {(() => {
                    const start = parseDate(watchStartDate) || parseDate(watchDueDate) || new Date();
                    const dowLabels = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
                    const mode = watchRecurrenceMode || 'none';
                    const customFreq = watchRecurrenceCustomFrequency || 'weekly';

                    const daysForSummary = () => {
                      const raw = Array.isArray(watchRecurrenceDays) && watchRecurrenceDays.length ? watchRecurrenceDays : [start.getDay()];
                      return raw.map((d) => dowLabels[parseInt(d, 10)]).filter(Boolean);
                    };

                    const summary = () => {
                      if (mode === 'none') return 'לא חוזר';
                      if (mode === 'daily') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryDays, 10) || 1);
                        return every === 1 ? 'כל יום' : `כל ${every} ימים`;
                      }
                      if (mode === 'weekly') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryWeeks, 10) || 1);
                        const days = daysForSummary();
                        const daysStr = days.length ? ` • ${days.join(', ')}` : '';
                        return every === 1 ? `כל שבוע${daysStr}` : `כל ${every} שבועות${daysStr}`;
                      }
                      if (mode === 'monthly') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryMonths, 10) || 1);
                        return every === 1 ? 'כל חודש' : `כל ${every} חודשים`;
                      }
                      if (mode === 'yearly') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryYears, 10) || 1);
                        return every === 1 ? 'כל שנה' : `כל ${every} שנים`;
                      }
                      // custom
                      if (customFreq === 'daily') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryDays, 10) || 1);
                        return `מותאם: כל ${every} ימים`;
                      }
                      if (customFreq === 'weekly') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryWeeks, 10) || 1);
                        const days = daysForSummary();
                        return `מותאם: כל ${every} שבועות${days.length ? ` • ${days.join(', ')}` : ''}`;
                      }
                      if (customFreq === 'monthly') {
                        const every = Math.max(1, parseInt(watchRecurrenceEveryMonths, 10) || 1);
                        return `מותאם: כל ${every} חודשים`;
                      }
                      const every = Math.max(1, parseInt(watchRecurrenceEveryYears, 10) || 1);
                      return `מותאם: כל ${every} שנים`;
                    };

                    const choosePreset = (nextMode) => {
                      setValue('recurrenceMode', nextMode);
                      if (nextMode === 'none') return;
                      if (nextMode === 'daily') setValue('recurrenceEveryDays', 1);
                      if (nextMode === 'weekly') {
                        setValue('recurrenceEveryWeeks', 1);
                        setValue('recurrenceDaysOfWeek', [start.getDay()]);
                      }
                      if (nextMode === 'monthly') setValue('recurrenceEveryMonths', 1);
                      if (nextMode === 'yearly') setValue('recurrenceEveryYears', 1);
                    };

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <Typography variant="subtitle1" fontWeight="bold" className="text-gray-900">
                              חזרתיות
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {summary()}
                            </Typography>
                          </div>
                          <Button variant="outlined" onClick={() => setRecurrenceDialogOpen(true)}>
                            שנה
                          </Button>
                        </div>

                        <Dialog open={recurrenceDialogOpen} onClose={() => setRecurrenceDialogOpen(false)} maxWidth="xs" fullWidth>
                          <DialogTitle sx={{ fontWeight: 800 }}>חזרתיות</DialogTitle>
                          <DialogContent dividers>
                            <List dense disablePadding>
                              {[
                                { key: 'none', label: 'לא חוזר' },
                                { key: 'daily', label: 'כל יום' },
                                { key: 'weekly', label: 'כל שבוע' },
                                { key: 'monthly', label: 'כל חודש' },
                                { key: 'yearly', label: 'כל שנה' }
                              ].map((it) => (
                                <ListItemButton
                                  key={it.key}
                                  selected={mode === it.key}
                                  onClick={() => {
                                    choosePreset(it.key);
                                    setRecurrenceDialogOpen(false);
                                  }}
                                >
                                  <ListItemText primary={it.label} />
                                </ListItemButton>
                              ))}
                              <Divider sx={{ my: 1 }} />
                              <ListItemButton
                                selected={mode === 'custom'}
                                onClick={() => {
                                  setValue('recurrenceMode', 'custom');
                                  setRecurrenceDialogOpen(true);
                                }}
                              >
                                <ListItemText primary="מותאם אישית…" secondary="ימים מסוימים / כל כמה שבועות / חודשי / שנתי" />
                              </ListItemButton>
                            </List>

                            {mode === 'custom' ? (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                  מותאם אישית
                                </Typography>
                                <Controller
                                  name="recurrenceCustomFrequency"
                                  control={control}
                                  render={({ field: { value, onChange } }) => (
                                    <ToggleButtonGroup
                                      value={value || 'weekly'}
                                      exclusive
                                      onChange={(_, v) => { if (v) onChange(v); }}
                                      size="small"
                                      sx={{ mb: 2 }}
                                    >
                                      <ToggleButton value="daily">יומי</ToggleButton>
                                      <ToggleButton value="weekly">שבועי</ToggleButton>
                                      <ToggleButton value="monthly">חודשי</ToggleButton>
                                      <ToggleButton value="yearly">שנתי</ToggleButton>
                                    </ToggleButtonGroup>
                                  )}
                                />

                                {customFreq === 'daily' ? (
                                  <TextField
                                    type="number"
                                    fullWidth
                                    label="כל כמה ימים"
                                    inputProps={{ min: 1 }}
                                    {...register('recurrenceEveryDays', { valueAsNumber: true })}
                                  />
                                ) : null}

                                {customFreq === 'weekly' ? (
                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      <TextField
                                        type="number"
                                        fullWidth
                                        label="כל כמה שבועות"
                                        inputProps={{ min: 1 }}
                                        {...register('recurrenceEveryWeeks', { valueAsNumber: true })}
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        ימים בשבוע
                                      </Typography>
                                      <Controller
                                        name="recurrenceDaysOfWeek"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                          <ToggleButtonGroup
                                            value={Array.isArray(value) ? value : []}
                                            onChange={(_, next) => onChange(next)}
                                            size="small"
                                          >
                                            <ToggleButton value={0}>א׳</ToggleButton>
                                            <ToggleButton value={1}>ב׳</ToggleButton>
                                            <ToggleButton value={2}>ג׳</ToggleButton>
                                            <ToggleButton value={3}>ד׳</ToggleButton>
                                            <ToggleButton value={4}>ה׳</ToggleButton>
                                            <ToggleButton value={5}>ו׳</ToggleButton>
                                            <ToggleButton value={6}>ש׳</ToggleButton>
                                          </ToggleButtonGroup>
                                        )}
                                      />
                                    </Grid>
                                  </Grid>
                                ) : null}

                                {customFreq === 'monthly' ? (
                                  <TextField
                                    type="number"
                                    fullWidth
                                    label="כל כמה חודשים"
                                    inputProps={{ min: 1 }}
                                    {...register('recurrenceEveryMonths', { valueAsNumber: true })}
                                  />
                                ) : null}

                                {customFreq === 'yearly' ? (
                                  <TextField
                                    type="number"
                                    fullWidth
                                    label="כל כמה שנים"
                                    inputProps={{ min: 1 }}
                                    {...register('recurrenceEveryYears', { valueAsNumber: true })}
                                  />
                                ) : null}
                              </Box>
                            ) : null}
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setRecurrenceDialogOpen(false)}>סגור</Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    );
                  })()}
                </div>
              </FormField>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            {showActions && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex-shrink-0">
                <div className="flex justify-end gap-3">
                  <Button onClick={onCancel} disabled={isLoading} className="text-gray-700">
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    className="bg-[#ec7211] hover:bg-[#c75e0c] text-white"
                    sx={{
                      backgroundColor: '#ec7211',
                      '&:hover': {
                        backgroundColor: '#c75e0c'
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : (initialData ? 'עדכן משימה' : 'צור משימה')}
                  </Button>
                </div>
              </div>
            )}
            </div>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;

