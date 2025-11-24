// frontend/src/pages/CalendarView.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Grid,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useCalendarView } from '../admin/hooks/useTasks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { he } from 'date-fns/locale';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarResponse, isLoading } = useCalendarView(year, month);
  const calendarData = calendarResponse?.data || {};
  const tasksByDate = calendarData.tasks || {};

  // מעבר לחודש הבא/קודם
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // קבלת כל הימים בחודש
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // הוסף ימים מהחודש הקודם להתחלה
  const firstDayOfWeek = monthStart.getDay();
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const prevMonthDays = [];
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - i);
    prevMonthDays.push(day);
  }

  // הוסף ימים מהחודש הבא לסיום
  const lastDayOfWeek = monthEnd.getDay();
  const daysFromNextMonth = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  
  const nextMonthDays = [];
  for (let i = 1; i <= daysFromNextMonth; i++) {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + i);
    nextMonthDays.push(day);
  }

  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  // לחיצה על יום
  const handleDayClick = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const tasks = tasksByDate[dateKey] || [];
    setSelectedDate(day);
    setSelectedTasks(tasks);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#9e9e9e'
    };
    return colors[priority] || '#9e9e9e';
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📅 יומן משימות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            תצוגה חודשית
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronRightIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy', { locale: he })}
          </Typography>
          
          <IconButton onClick={handleNextMonth}>
            <ChevronLeftIcon />
          </IconButton>

          <Button
            startIcon={<TodayIcon />}
            variant="outlined"
            onClick={handleToday}
          >
            היום
          </Button>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Card>
        <Box sx={{ p: 2 }}>
          {/* Days of Week Header */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day) => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={1}>
            {allDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const tasksForDay = tasksByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayDate = isToday(day);

              return (
                <Grid item xs={12 / 7} key={index}>
                  <Box
                    sx={{
                      minHeight: 120,
                      border: '1px solid',
                      borderColor: isTodayDate ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      p: 1,
                      cursor: 'pointer',
                      bgcolor: isCurrentMonth ? 'background.paper' : 'action.hover',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Day Number */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={isTodayDate ? 'bold' : 'normal'}
                        color={isTodayDate ? 'primary' : 'text.primary'}
                      >
                        {format(day, 'd')}
                      </Typography>
                      {tasksForDay.length > 0 && (
                        <Badge badgeContent={tasksForDay.length} color="primary" />
                      )}
                    </Box>

                    {/* Tasks */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {tasksForDay.slice(0, 3).map((task) => (
                        <Box
                          key={task._id}
                          sx={{
                            bgcolor: task.color || getPriorityColor(task.priority),
                            color: 'white',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Box>
                      ))}
                      {tasksForDay.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{tasksForDay.length - 3} נוספות
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Card>

      {/* Task Details Dialog */}
      <Dialog
        open={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: he })}
        </DialogTitle>
        <DialogContent>
          {selectedTasks.length > 0 ? (
            <List>
              {selectedTasks.map((task) => (
                <ListItem
                  key={task._id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{task.title}</Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(task.priority),
                            color: 'white'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {task.description && (
                          <Typography variant="body2" gutterBottom>
                            {task.description}
                          </Typography>
                        )}
                        {task.relatedClient && (
                          <Typography variant="caption" color="text.secondary">
                            {task.relatedClient.personalInfo.fullName}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              אין משימות ליום זה
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDate(null)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView;

