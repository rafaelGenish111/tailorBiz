import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Autocomplete,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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

const TaskForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  // ברירות מחדל: התחלה עכשיו, יעד שעה קדימה, סיום ריק – לפי זמן מקומי
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
      // ברירת מחדל: ללא זמן סיום
      endDate: null,
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
      initialData.endDate ||
      initialData.title
    );

    if (hasRealData) {
      reset({
        ...initialData,
        dueDate: parseDate(initialData.dueDate),
        startDate: parseDate(initialData.startDate),
        endDate: parseDate(initialData.endDate),
        relatedClient: initialData.relatedClient || null,
        subtasks: initialData.subtasks || []
      });
    }
  }, [initialData, reset]);

  const { data: clientsResponse, isLoading: isLoadingClients } = useClients();
  const { data: projectsResponse } = useProjects();
  const clients = clientsResponse?.data || [];
  const projects = projectsResponse?.data || [];

  // ברגע שהמשתמש משנה תאריך התחלה – יעד (dueDate) יהיה שעה קדימה
  const watchStartDate = watch('startDate');

  useEffect(() => {
    if (watchStartDate && watchStartDate instanceof Date) {
      const due = new Date(watchStartDate.getTime() + 60 * 60 * 1000);
      setValue('dueDate', due);
    }
  }, [watchStartDate, setValue]);

  const handleFormSubmit = (data) => {
      // Transform relatedClient to ID if it's an object
      const formattedData = {
          ...data,
          relatedClient: data.relatedClient?._id || data.relatedClient,
          projectId: data.projectId?._id || data.projectId
      };
      onSubmit(formattedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="כותרת המשימה"
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
            name="dueDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="תאריך יעד"
                value={parseDate(value)}
                onChange={onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: false
                  }
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="startDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="תאריך התחלה"
                value={parseDate(value)}
                onChange={onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: false
                  }
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="endDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="תאריך סיום"
                value={parseDate(value)}
                onChange={onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: false
                  }
                }}
              />
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
            rows={4}
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
              onClick={() => appendSubtask({ title: '', done: false })}
            >
              הוסף תת־משימה
            </Button>
          </Box>

          {subtaskFields.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              אין תתי־משימות עדיין.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {subtaskFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label={`תת־משימה ${index + 1}`}
                    {...register(`subtasks.${index}.title`)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TextField
                      select
                      size="small"
                      label="סטטוס"
                      sx={{ minWidth: 110 }}
                      defaultValue={field.done ? 'done' : 'open'}
                      {...register(`subtasks.${index}.done`)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="open">פתוחה</option>
                      <option value="done">בוצעה</option>
                    </TextField>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeSubtask(index)}
                    >
                      מחק
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button onClick={onCancel} disabled={isLoading}>
            ביטול
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : (initialData ? 'עדכן משימה' : 'צור משימה')}
          </Button>
        </Grid>
      </Grid>
    </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;

