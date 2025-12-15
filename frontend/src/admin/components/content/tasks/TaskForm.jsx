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
  Divider
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
      // ברירת מחדל: התחלה עכשיו
      startDate: defaultStart,
      // ברירת מחדל: יעד שעה קדימה
      dueDate: defaultDue,
      projectId: null,
      relatedClient: null,
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
      reset({
        ...initialData,
        dueDate: parseDate(initialData.dueDate),
        startDate: parseDate(initialData.startDate),
        relatedClient: initialData.relatedClient || null,
        subtasks: initialData.subtasks || []
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
  const lastAutoDueRef = useRef(defaultDue);

  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

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

  const handleFormSubmit = (data) => {
    // Transform relatedClient to ID if it's an object
    const formattedData = {
      ...data,
      relatedClient: data.relatedClient?._id || data.relatedClient,
      projectId: data.projectId?._id || data.projectId,
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
    onSubmit(formattedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box id={formId} component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="כותרת המשימה"
              multiline
              minRows={2}
              maxRows={2}
              {...register('title', { required: 'שדה חובה' })}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="עדיפות"
              defaultValue="medium"
              {...register('priority')}
            >
              <MenuItem value="low">נמוכה</MenuItem>
              <MenuItem value="medium">בינונית</MenuItem>
              <MenuItem value="high">גבוהה</MenuItem>
              <MenuItem value="urgent">דחופה</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="סטטוס"
              defaultValue="todo"
              {...register('status')}
            >
              <MenuItem value="todo">לביצוע</MenuItem>
              <MenuItem value="in_progress">בטיפול</MenuItem>
              <MenuItem value="waiting">ממתין</MenuItem>
              <MenuItem value="completed">הושלם</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="startDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <DatePicker
                      label="תאריך התחלה"
                      value={parseDate(value)}
                      onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={5}>
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
                  </Grid>
                </Grid>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <DatePicker
                      label="תאריך יעד"
                      value={parseDate(value)}
                      onChange={(newDate) => onChange(mergeDateAndTime(newDate, parseDate(value)))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={5}>
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
                  </Grid>
                </Grid>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="תיאור"
              {...register('description')}
            />
          </Grid>

          {/* תתי־משימות (צ'קליסט) */}
          <Grid item xs={12}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                תתי־משימות
              </Typography>
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
            </Box>

            {subtaskFields.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                אין תתי־משימות עדיין.
              </Typography>
            ) : null}

            <Collapse in={subtasksExpanded && subtaskFields.length > 0}>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              </Box>
            </Collapse>
          </Grid>

          {showActions ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={onCancel} disabled={isLoading}>
                ביטול
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : (initialData ? 'עדכן משימה' : 'צור משימה')}
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;

