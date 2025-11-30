import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useCampaign } from '../../../hooks/marketing/useCampaigns';
import * as campaignService from '../../../services/marketing/campaignService';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';

// Validation schema
const campaignSchema = yup.object().shape({
  name: yup.string().required('שם הקמפיין הוא שדה חובה').min(3, 'לפחות 3 תווים'),
  type: yup.string().required('סוג הקמפיין הוא שדה חובה'),
  targetDate: yup.date().required('תאריך יעד הוא שדה חובה'),
  preparationDays: yup.number().min(1, 'לפחות יום אחד').max(365, 'עד 365 ימים').required('שדה חובה'),
  budget: yup.object().shape({
    total: yup.number().min(0, 'לא יכול להיות שלילי').required('תקציב הוא שדה חובה')
  }),
  content: yup.object().shape({
    headline: yup.string(),
    body: yup.string(),
    cta: yup.string()
  })
});

const campaignTypes = [
  { value: 'holiday', label: 'חג' },
  { value: 'seasonal', label: 'עונתי' },
  { value: 'product_launch', label: 'השקת מוצר' },
  { value: 'retention', label: 'שימור לקוחות' },
  { value: 'acquisition', label: 'רכישת לקוחות' },
  { value: 'event', label: 'אירוע' },
  { value: 'content', label: 'תוכן' },
  { value: 'networking', label: 'נטוורקינג' }
];

const channelTypes = [
  { value: 'email', label: 'אימייל' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'אתר' }
];

const steps = ['פרטים בסיסיים', 'ערוצים', 'תוכן', 'אוטומציה'];

const CampaignForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const { campaign, loading: campaignLoading } = useCampaign(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(campaignSchema),
    defaultValues: {
      name: '',
      type: '',
      targetDate: '',
      preparationDays: 30,
      budget: {
        total: 0,
        spent: 0,
        currency: 'ILS'
      },
      content: {
        headline: '',
        body: '',
        cta: '',
        landingPage: ''
      },
      automation: {
        enabled: true
      }
    }
  });

  // Load campaign data in edit mode
  useEffect(() => {
    if (campaign && isEditMode) {
      reset({
        name: campaign.name,
        type: campaign.type,
        targetDate: campaign.targetDate ? new Date(campaign.targetDate).toISOString().split('T')[0] : '',
        preparationDays: campaign.preparationDays || 30,
        budget: campaign.budget || { total: 0, spent: 0, currency: 'ILS' },
        content: campaign.content || {},
        automation: campaign.automation || { enabled: true }
      });
      setSelectedChannels(campaign.channels?.map(ch => ch.type) || []);
    }
  }, [campaign, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const campaignData = {
        ...data,
        channels: selectedChannels.map(type => ({
          type,
          status: 'draft',
          budget: 0,
          metrics: {
            sent: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            cost: 0
          }
        }))
      };

      if (isEditMode) {
        await campaignService.updateCampaign(id, campaignData);
      } else {
        await campaignService.createCampaign(campaignData);
      }

      navigate('/admin/marketing/campaigns');
    } catch (err) {
      setError(err.message || 'שגיאה בשמירת הקמפיין');
      console.error('Error saving campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setGeneratingAI(true);
      
      // TODO: Call AI service to generate content
      // const content = await aiService.generateCampaignContent(...);
      
      // Mock AI response
      setTimeout(() => {
        setValue('content.headline', 'כותרת מרשימה שנוצרה על ידי AI');
        setValue('content.body', 'תוכן מעולה ומשכנע שנוצר באמצעות בינה מלאכותית');
        setValue('content.cta', 'לחץ כאן עכשיו!');
        setGeneratingAI(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error generating AI content:', err);
      setGeneratingAI(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (campaignLoading && isEditMode) {
    return <LoadingSpinner message="טוען קמפיין..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/marketing/campaigns')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {isEditMode ? 'עריכת קמפיין' : 'קמפיין חדש'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode ? 'עדכן את פרטי הקמפיין' : 'צור קמפיין שיווקי חדש'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 4 }}>
          {/* Step 0: Basic Details */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  פרטים בסיסיים
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={8}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="שם הקמפיין"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="לדוגמה: מבצע פסח 2024"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>סוג קמפיין</InputLabel>
                      <Select {...field} label="סוג קמפיין">
                        {campaignTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.type && (
                        <FormHelperText>{errors.type.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="targetDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="תאריך יעד"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.targetDate}
                      helperText={errors.targetDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="preparationDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ימי הכנה לפני היעד"
                      type="number"
                      fullWidth
                      error={!!errors.preparationDays}
                      helperText={errors.preparationDays?.message || 'כמה ימים לפני צריך להתחיל הכנות'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="budget.total"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="תקציב כולל (₪)"
                      type="number"
                      fullWidth
                      error={!!errors.budget?.total}
                      helperText={errors.budget?.total?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1: Channels */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                בחר ערוצי שיווק
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth>
                <InputLabel>ערוצים</InputLabel>
                <Select
                  multiple
                  value={selectedChannels}
                  onChange={(e) => setSelectedChannels(e.target.value)}
                  input={<OutlinedInput label="ערוצים" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const channel = channelTypes.find(ch => ch.value === value);
                        return <Chip key={value} label={channel?.label || value} />;
                      })}
                    </Box>
                  )}
                >
                  {channelTypes.map((channel) => (
                    <MenuItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  בחר את הערוצים בהם תרצה להפיץ את הקמפיין
                </FormHelperText>
              </FormControl>

              {selectedChannels.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  בחר לפחות ערוץ אחד להפצת הקמפיין
                </Alert>
              )}
            </Box>
          )}

          {/* Step 2: Content */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      תוכן הקמפיין
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      כתוב את התוכן או השתמש ב-AI ליצירה אוטומטית
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={generatingAI ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                    onClick={handleGenerateContent}
                    disabled={generatingAI}
                  >
                    {generatingAI ? 'יוצר...' : 'צור עם AI'}
                  </Button>
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="content.headline"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="כותרת"
                      fullWidth
                      placeholder="כותרת משכנעת לקמפיין"
                      helperText="עד 60 תווים"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="content.body"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="תוכן"
                      fullWidth
                      multiline
                      rows={6}
                      placeholder="התוכן המלא של הקמפיין..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="content.cta"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="קריאה לפעולה (CTA)"
                      fullWidth
                      placeholder="לחץ כאן, הירשם עכשיו..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="content.landingPage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="דף נחיתה (אופציונלי)"
                      fullWidth
                      placeholder="https://..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Automation */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                אוטומציה
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info">
                המערכת תיצור אוטומטית משימות ותזכורות ביומן בהתאם לתאריכים שהגדרת:
                <Box component="ul" sx={{ mt: 1 }}>
                  <li>משימת תכנון - {watch('preparationDays') || 30} ימים לפני התאריך</li>
                  <li>יצירת תוכן - {Math.floor((watch('preparationDays') || 30) * 0.7)} ימים לפני</li>
                  <li>אישור תוכן - {Math.floor((watch('preparationDays') || 30) * 0.5)} ימים לפני</li>
                  <li>הפעלת קמפיין - יום לפני התאריך</li>
                  <li>מעקב וניתוח - 3 ימים אחרי התאריך</li>
                </Box>
              </Alert>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              חזור
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/marketing/campaigns')}
              >
                ביטול
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'שומר...' : isEditMode ? 'עדכן קמפיין' : 'צור קמפיין'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  הבא
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </form>
    </Container>
  );
};

export default CampaignForm;



