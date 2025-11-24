import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Rating,
  Typography,
  Avatar,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateTestimonial, useUpdateTestimonial } from '../../../hooks/useTestimonials';

// Validation schema
const schema = yup.object().shape({
  clientName: yup
    .string()
    .required('שם הלקוח הוא שדה חובה')
    .max(100, 'שם הלקוח לא יכול להיות יותר מ-100 תווים'),
  
  clientRole: yup
    .string()
    .required('תפקיד הלקוח הוא שדה חובה')
    .max(100, 'התפקיד לא יכול להיות יותר מ-100 תווים'),
  
  companyName: yup
    .string()
    .required('שם החברה הוא שדה חובה')
    .max(150, 'שם החברה לא יכול להיות יותר מ-150 תווים'),
  
  content: yup
    .string()
    .required('תוכן ההמלצה הוא שדה חובה')
    .min(10, 'ההמלצה חייבת להכיל לפחות 10 תווים')
    .max(1000, 'ההמלצה לא יכולה להכיל יותר מ-1000 תווים'),
  
  rating: yup
    .number()
    .required('דירוג הוא שדה חובה')
    .min(1, 'הדירוג המינימלי הוא 1')
    .max(5, 'הדירוג המקסימלי הוא 5'),
});

function TestimonialForm({ open, onClose, testimonial }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const isEdit = Boolean(testimonial);

  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientName: '',
      clientRole: '',
      companyName: '',
      content: '',
      rating: 5,
      isVisible: false,
    },
  });

  // Load testimonial data when editing
  useEffect(() => {
    if (testimonial) {
      reset({
        clientName: testimonial.clientName,
        clientRole: testimonial.clientRole,
        companyName: testimonial.companyName,
        content: testimonial.content,
        rating: testimonial.rating,
        isVisible: testimonial.isVisible,
      });
      if (testimonial.image) {
        setImagePreview(`http://localhost:5000${testimonial.image}`);
      }
    } else {
      reset({
        clientName: '',
        clientRole: '',
        companyName: '',
        content: '',
        rating: 5,
        isVisible: false,
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [testimonial, reset]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('גודל הקובץ לא יכול לעלות על 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEdit) {
        await updateMutation.mutateAsync({
          id: testimonial._id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEdit ? 'עריכת המלצה' : 'הוספת המלצה חדשה'}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Image Upload */}
            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar src={imagePreview} sx={{ width: 120, height: 120, cursor: 'pointer' }} />
                  <Button component="span" variant="outlined" startIcon={<UploadIcon />}>
                    העלה תמונת לקוח
                  </Button>
                </Box>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                JPG, PNG או WebP. מקסימום 5MB
              </Typography>
            </Box>

            {/* Client Name */}
            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="שם הלקוח *"
                  fullWidth
                  error={!!errors.clientName}
                  helperText={errors.clientName?.message}
                />
              )}
            />

            {/* Client Role */}
            <Controller
              name="clientRole"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="תפקיד *"
                  fullWidth
                  error={!!errors.clientRole}
                  helperText={errors.clientRole?.message}
                  placeholder="מנכ״ל, מנהל פיתוח עסקי, וכו׳"
                />
              )}
            />

            {/* Company Name */}
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="שם החברה *"
                  fullWidth
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              )}
            />

            {/* Content */}
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="תוכן ההמלצה *"
                  fullWidth
                  multiline
                  rows={6}
                  error={!!errors.content}
                  helperText={errors.content?.message || `${field.value.length}/1000 תווים`}
                />
              )}
            />

            {/* Rating */}
            <Box>
              <Typography component="legend" sx={{ mb: 1 }}>
                דירוג *
              </Typography>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Rating
                    {...field}
                    value={Number(field.value)}
                    onChange={(_, value) => field.onChange(value)}
                    size="large"
                  />
                )}
              />
              {errors.rating && (
                <Typography color="error" variant="caption">
                  {errors.rating.message}
                </Typography>
              )}
            </Box>

            {/* Visibility Toggle */}
            <Controller
              name="isVisible"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="הצג באתר הציבורי"
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'עדכן' : 'צור המלצה'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default TestimonialForm;

