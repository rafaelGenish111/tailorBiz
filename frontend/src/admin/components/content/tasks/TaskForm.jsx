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

  // Helper component for Priority Badge
  const PriorityBadge = ({ value, onChange }) => {
    const priorities = [
      { value: 'low', label: 'נמוכה', color: 'bg-green-100 text-green-700 border-green-300' },
      { value: 'medium', label: 'בינונית', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      { value: 'high', label: 'גבוהה', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      { value: 'urgent', label: 'דחופה', color: 'bg-red-100 text-red-700 border-red-300' }
    ];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">עדיפות</label>
        <div className="flex flex-wrap gap-2">
          {priorities.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => onChange(priority.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                value === priority.value
                  ? `${priority.color} ring-2 ring-offset-2 ring-offset-white`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Helper component for Status Badge
  const StatusBadge = ({ value, onChange }) => {
    const statuses = [
      { value: 'todo', label: 'לביצוע', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      { value: 'in_progress', label: 'בטיפול', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      { value: 'waiting', label: 'ממתין', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      { value: 'completed', label: 'הושלם', color: 'bg-green-100 text-green-700 border-green-300' }
    ];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">סטטוס</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => onChange(status.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                value === status.value
                  ? `${status.color} ring-2 ring-offset-2 ring-offset-white`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Helper component for Form Section
  const FormSection = ({ title, children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {title}
        </h3>
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
        className="bg-white rounded-xl shadow-sm border border-gray-200"
        sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: { xs: 'calc(100vh - 100px)', md: '80vh' }
        }}
      >
            <div className="p-6 space-y-8 overflow-y-auto flex-1 min-h-0">
              {/* Task Details Section */}
              <FormSection title="פרטי המשימה">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Title - Full Width */}
                  <div className="col-span-12">
                    <TextField
                      fullWidth
                      label="כותרת המשימה"
                      multiline
                      minRows={2}
                      maxRows={2}
                      {...register('title', { required: 'שדה חובה' })}
                      required
                      className="w-full"
                      slotProps={{
                        root: {
                          className: 'rounded-lg border-gray-200 focus-within:ring-2 focus-within:ring-[#ec7211]'
                        }
                      }}
                    />
                  </div>

                  {/* Priority and Status - Side by Side */}
                  <div className="col-span-12 md:col-span-6">
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <PriorityBadge value={value || 'medium'} onChange={onChange} />
                      )}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <StatusBadge value={value || 'todo'} onChange={onChange} />
                      )}
                    />
                  </div>

                  {/* Color Picker */}
                  <div className="col-span-12 md:col-span-6">
                    <Controller
                      name="color"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">צבע המשימה</label>
                          <div className="flex flex-wrap gap-2">
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
                                className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                                  value === color.value
                                    ? 'ring-2 ring-[#ec7211] ring-offset-2 ring-offset-white border-2 border-[#ec7211]'
                                    : 'border-2 border-gray-200 hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                              >
                                {value === color.value && (
                                  <span className="text-white text-lg font-bold drop-shadow-md">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Schedule Section */}
              <FormSection title="לוח זמנים">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Start Date - Side by Side with Due Date */}
                  <div className="col-span-12 md:col-span-6">
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-7">
                            <DatePicker
                              label="תאריך התחלה"
                              value={parseDate(value)}
                              onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </div>
                          <div className="col-span-5">
                            <TimePicker
                              label="שעה"
                              value={parseDate(value)}
                              onChange={(newTime) => onChange(mergeDateAndTime(parseDate(value), newTime))}
                              ampm={false}
                              views={['hours', 'minutes']}
                              viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock
                              }}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Due Date - Side by Side with Start Date */}
                  <div className="col-span-12 md:col-span-6">
                    <Controller
                      name="dueDate"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-7">
                            <DatePicker
                              label="תאריך יעד"
                              value={parseDate(value)}
                              onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </div>
                          <div className="col-span-5">
                            <TimePicker
                              label="שעה"
                              value={parseDate(value)}
                              onChange={(newTime) => onChange(mergeDateAndTime(parseDate(value), newTime))}
                              ampm={false}
                              views={['hours', 'minutes']}
                              viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock
                              }}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Recurrence */}
                  <div className="col-span-12">
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
                  </div>
                </div>
              </FormSection>

              {/* Assignment Section */}
              <FormSection title="הקצאה">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-6">
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
                            />
                          )}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
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
                  </div>
                </div>
              </FormSection>

              {/* Description Section */}
              <FormSection title="תיאור">
                <div className="col-span-12">
                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    label="תיאור"
                    {...register('description')}
                  />
                </div>
              </FormSection>

              {/* Subtasks Section */}
              <FormSection title="תתי־משימות">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        appendSubtask({ title: '', done: false });
                        setSubtasksExpanded(true);
                      }}
                    >
                      הוסף תת־משימה
                    </Button>
                  </div>

                  {subtaskFields.length === 0 ? (
                    <Typography variant="body2" className="text-gray-600">
                      אין תתי־משימות עדיין.
                    </Typography>
                  ) : null}

                  <Collapse in={subtasksExpanded && subtaskFields.length > 0}>
                    <Divider sx={{ my: 1.5 }} />
                    <div className="flex flex-col gap-4">
                      {subtaskFields.map((field, index) => (
                        <Grid container spacing={1} key={field.id} alignItems="flex-start">
                          <Grid item xs={12} md={8}>
                            <TextField
                              fullWidth
                              label={`תת־משימה ${index + 1}`}
                              multiline
                              minRows={2}
                              {...register(`subtasks.${index}.title`)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={1} alignItems="stretch">
                              <TextField
                                select
                                label="סטטוס"
                                fullWidth
                                defaultValue={field.done ? 'true' : 'false'}
                                {...register(`subtasks.${index}.done`, {
                                  setValueAs: (v) =>
                                    v === true ||
                                    v === 'true' ||
                                    v === 1 ||
                                    v === '1' ||
                                    v === 'done'
                                })}
                                SelectProps={{
                                  native: true,
                                }}
                              >
                                <option value="false">פתוחה</option>
                                <option value="true">בוצעה</option>
                              </TextField>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeSubtask(index)}
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                מחק
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      ))}
                    </div>
                  </Collapse>
                </div>
              </FormSection>
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
      </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;

