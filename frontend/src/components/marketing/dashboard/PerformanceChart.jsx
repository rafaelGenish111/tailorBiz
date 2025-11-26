import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const PerformanceChart = ({ data }) => {
  // Placeholder for chart - you can integrate Chart.js, Recharts, etc.
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          ביצועים
        </Typography>
      </Box>

      {data ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            גרף ביצועים - ניתן לשלב Chart.js או Recharts
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="h6" color="primary">
              ROI: {data.performance?.avgROI?.toFixed(1) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              לידים: {data.performance?.totalLeads || 0} | המרות: {data.performance?.totalConversions || 0}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          אין נתונים להצגה
        </Typography>
      )}
    </Paper>
  );
};

export default PerformanceChart;

