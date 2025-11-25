import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { useClients } from '../../../hooks/useClients';

const TaskForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      relatedClient: null,
      ...initialData
    }
  });

  const { data: clientsResponse, isLoading: isLoadingClients } = useClients();
  const clients = clientsResponse?.data || [];

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
        relatedClient: initialData.relatedClient || null
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
      // Transform relatedClient to ID if it's an object
      const formattedData = {
          ...data,
          relatedClient: data.relatedClient?._id || data.relatedClient
      };
      onSubmit(formattedData);
  };

  return (
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
          <TextField
            fullWidth
            type="datetime-local"
            label="תאריך יעד"
            InputLabelProps={{ shrink: true }}
            {...register('dueDate')}
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
  );
};

export default TaskForm;

