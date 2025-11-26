import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography, 
  Paper, 
  Chip,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const ACTION_LABELS = {
  'send_whatsapp': 'שליחת WhatsApp',
  'create_task': 'יצירת משימה',
  'send_email': 'שליחת אימייל',
  'update_lead_score': 'עדכון ניקוד',
  'update_client_status': 'עדכון סטטוס',
  'schedule_followup': 'תזמון מעקב',
  'add_tag': 'הוספת תגית',
  'create_notification': 'יצירת התראה',
  'change_status': 'שינוי סטטוס'
};

const SmartSequenceProgress = ({ instance }) => {
  if (!instance || !instance.nurturingTemplate) return null;

  const { nurturingTemplate, currentStep, status, nextActionAt } = instance;
  const steps = nurturingTemplate.sequence || [];
  
  // Calculate progress
  // If completed, activeStep is steps.length (all done)
  // If stopped, we show the step where it stopped
  const activeStep = status === 'completed' ? steps.length : currentStep;

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
            <Typography variant="subtitle1" component="div" fontWeight="bold">
            {nurturingTemplate.name}
            </Typography>
            {nurturingTemplate.description && (
                <Typography variant="caption" color="text.secondary">
                {nurturingTemplate.description}
                </Typography>
            )}
        </Box>
        <Chip 
          label={status === 'active' ? 'פעיל' : status === 'completed' ? 'הושלם' : 'מושהה/נעצר'} 
          color={status === 'active' ? 'success' : status === 'completed' ? 'primary' : 'default'}
          size="small"
        />
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel size="small">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep && status === 'active';
          
          let label = ACTION_LABELS[step.actionType] || step.actionType;
          let description = '';
          
          if (step.actionType === 'send_whatsapp') description = 'הודעה ללקוח';
          if (step.actionType === 'create_task') description = step.content?.taskTitle;
          if (step.actionType === 'update_lead_score') description = `ניקוד ${step.content?.scoreDelta > 0 ? '+' : ''}${step.content?.scoreDelta}`;
          if (step.actionType === 'schedule_followup') description = `מעקב: ${step.content?.followupSubject}`;

          return (
            <Step key={index}>
              <StepLabel error={status === 'stopped' && index === currentStep}>
                <Tooltip title={description || label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" display="block" sx={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>
                      {label}
                    </Typography>
                    {isCurrent && nextActionAt && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                        {format(new Date(nextActionAt), 'dd/MM HH:mm')}
                      </Typography>
                    )}
                    {status === 'stopped' && index === currentStep && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                        נעצר
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Paper>
  );
};

export default SmartSequenceProgress;

