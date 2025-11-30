import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateClient, useUpdateClient } from '../../../hooks/useClients';

// Validation schema
const schema = yup.object().shape({
  personalInfo: yup.object().shape({
    fullName: yup
      .string()
      .required('שם מלא הוא שדה חובה')
      .max(100, 'שם מלא לא יכול להיות יותר מ-100 תווים'),
    phone: yup
      .string()
      .required('מספר טלפון הוא שדה חובה')
      .matches(/^[0-9-+\s()]+$/, 'מספר טלפון לא תקין'),
    email: yup
      .string()
      .email('כתובת אימייל לא תקינה')
      .nullable(),
    whatsappPhone: yup
      .string()
      .nullable(),
    preferredContactMethod: yup
      .string()
      .oneOf(['phone', 'whatsapp', 'email'], 'שיטת קשר לא תקינה')
      .default('whatsapp'),
  }),
  businessInfo: yup.object().shape({
    businessName: yup
      .string()
      .required('שם העסק הוא שדה חובה')
      .max(150, 'שם העסק לא יכול להיות יותר מ-150 תווים'),
    businessType: yup.string().nullable(),
    numberOfEmployees: yup.number().min(0).nullable(),
    industry: yup.string().nullable(),
    website: yup.string().url('כתובת אתר לא תקינה').nullable(),
    address: yup.string().nullable(),
  }),
  leadSource: yup
    .string()
    .required('מקור ליד הוא שדה חובה')
    .oneOf(['whatsapp', 'website_form', 'referral', 'cold_call', 'social_media', 'linkedin', 'facebook', 'google_ads', 'other']),
  status: yup
    .string()
    .oneOf(['lead', 'contacted', 'assessment_scheduled', 'assessment_completed', 'proposal_sent', 'negotiation', 'won', 'lost', 'on_hold', 'active_client', 'in_development', 'completed', 'churned'])
    .default('lead'),
});

const LEAD_SOURCE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website_form', label: 'טופס באתר' },
  { value: 'referral', label: 'המלצה' },
  { value: 'cold_call', label: 'פנייה יזומה' },
  { value: 'social_media', label: 'רשתות חברתיות' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'other', label: 'אחר' },
];

const STATUS_OPTIONS = [
  { value: 'lead', label: 'ליד חדש' },
  { value: 'contacted', label: 'יצרנו קשר' },
  { value: 'assessment_scheduled', label: 'פגישת אפיון נקבעה' },
  { value: 'assessment_completed', label: 'אפיון הושלם' },
  { value: 'proposal_sent', label: 'הצעת מחיר נשלחה' },
  { value: 'negotiation', label: 'משא ומתן' },
  { value: 'won', label: 'נסגר' },
  { value: 'lost', label: 'הפסדנו' },
  { value: 'on_hold', label: 'בהמתנה' },
  { value: 'active_client', label: 'לקוח פעיל' },
  { value: 'in_development', label: 'בפיתוח' },
  { value: 'completed', label: 'הושלם' },
  { value: 'churned', label: 'עזב' },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'phone', label: 'טלפון' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'אימייל' },
];

function ClientForm({ open, onClose, client }) {
  const isEdit = Boolean(client);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      personalInfo: {
        fullName: '',
        phone: '',
        email: '',
        whatsappPhone: '',
        preferredContactMethod: 'whatsapp',
      },
      businessInfo: {
        businessName: '',
        businessType: '',
        numberOfEmployees: '',
        industry: '',
        website: '',
        address: '',
      },
      leadSource: 'whatsapp',
      status: 'lead',
    },
  });

  // Load client data when editing
  useEffect(() => {
    if (client) {
      reset({
        personalInfo: {
          fullName: client.personalInfo?.fullName || '',
          phone: client.personalInfo?.phone || '',
          email: client.personalInfo?.email || '',
          whatsappPhone: client.personalInfo?.whatsappPhone || '',
          preferredContactMethod: client.personalInfo?.preferredContactMethod || 'whatsapp',
        },
        businessInfo: {
          businessName: client.businessInfo?.businessName || '',
          businessType: client.businessInfo?.businessType || '',
          numberOfEmployees: client.businessInfo?.numberOfEmployees || '',
          industry: client.businessInfo?.industry || '',
          website: client.businessInfo?.website || '',
          address: client.businessInfo?.address || '',
        },
        leadSource: client.leadSource || 'whatsapp',
        status: client.status || 'lead',
      });
    } else {
      reset({
        personalInfo: {
          fullName: '',
          phone: '',
          email: '',
          whatsappPhone: '',
          preferredContactMethod: 'whatsapp',
        },
        businessInfo: {
          businessName: '',
          businessType: '',
          numberOfEmployees: '',
          industry: '',
          website: '',
          address: '',
        },
        leadSource: 'whatsapp',
        status: 'lead',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert empty strings to null for optional fields
      const cleanedData = {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          email: data.personalInfo.email || null,
          whatsappPhone: data.personalInfo.whatsappPhone || null,
        },
        businessInfo: {
          ...data.businessInfo,
          businessType: data.businessInfo.businessType || null,
          numberOfEmployees: data.businessInfo.numberOfEmployees ? parseInt(data.businessInfo.numberOfEmployees) : null,
          industry: data.businessInfo.industry || null,
          website: data.businessInfo.website || null,
          address: data.businessInfo.address || null,
        },
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: client._id, data: cleanedData });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEdit ? 'ערוך לקוח' : 'הוסף לקוח חדש'}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* פרטים אישיים */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              פרטים אישיים
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="personalInfo.fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="שם מלא *"
                      fullWidth
                      error={!!errors.personalInfo?.fullName}
                      helperText={errors.personalInfo?.fullName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="personalInfo.phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="מספר טלפון *"
                      fullWidth
                      error={!!errors.personalInfo?.phone}
                      helperText={errors.personalInfo?.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="personalInfo.email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="אימייל"
                      type="email"
                      fullWidth
                      error={!!errors.personalInfo?.email}
                      helperText={errors.personalInfo?.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="personalInfo.whatsappPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="WhatsApp"
                      fullWidth
                      error={!!errors.personalInfo?.whatsappPhone}
                      helperText={errors.personalInfo?.whatsappPhone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="personalInfo.preferredContactMethod"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="שיטת קשר מועדפת"
                      fullWidth
                    >
                      {CONTACT_METHOD_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* פרטי עסק */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              פרטי עסק
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.businessName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="שם העסק *"
                      fullWidth
                      error={!!errors.businessInfo?.businessName}
                      helperText={errors.businessInfo?.businessName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.businessType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="סוג עסק"
                      fullWidth
                      error={!!errors.businessInfo?.businessType}
                      helperText={errors.businessInfo?.businessType?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.numberOfEmployees"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="מספר עובדים"
                      type="number"
                      fullWidth
                      error={!!errors.businessInfo?.numberOfEmployees}
                      helperText={errors.businessInfo?.numberOfEmployees?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.industry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="תחום"
                      fullWidth
                      error={!!errors.businessInfo?.industry}
                      helperText={errors.businessInfo?.industry?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="אתר אינטרנט"
                      fullWidth
                      error={!!errors.businessInfo?.website}
                      helperText={errors.businessInfo?.website?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="businessInfo.address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="כתובת"
                      fullWidth
                      error={!!errors.businessInfo?.address}
                      helperText={errors.businessInfo?.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* מידע נוסף */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              מידע נוסף
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="leadSource"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="מקור ליד *"
                      fullWidth
                      error={!!errors.leadSource}
                      helperText={errors.leadSource?.message}
                    >
                      {LEAD_SOURCE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="סטטוס"
                      fullWidth
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>ביטול</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'עדכן' : 'צור לקוח'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ClientForm;




