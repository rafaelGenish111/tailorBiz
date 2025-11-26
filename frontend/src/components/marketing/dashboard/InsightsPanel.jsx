import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const InsightsPanel = ({ insights = [] }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="error" />;
      case 'opportunity':
        return <LightbulbIcon color="warning" />;
      case 'recommendation':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        תובנות והמלצות
      </Typography>

      {insights.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין תובנות להצגה כרגע
        </Alert>
      ) : (
        <List>
          {insights.slice(0, 5).map((insight, index) => (
            <ListItem
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getInsightIcon(insight.type)}
                </ListItemIcon>
                <ListItemText
                  primary={insight.title}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Chip
                  label={insight.priority}
                  color={getPriorityColor(insight.priority)}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
                {insight.description}
              </Typography>
              {insight.actionItems && insight.actionItems.length > 0 && (
                <Box sx={{ ml: 5 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    פעולות מומלצות:
                  </Typography>
                  <List dense>
                    {insight.actionItems.slice(0, 2).map((action, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          • {action}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default InsightsPanel;

