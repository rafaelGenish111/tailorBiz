// frontend/src/pages/CalendarView.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useCalendarView, useCreateTask, useUpdateTask } from '../admin/hooks/useTasks';
import TaskForm from '../admin/components/content/tasks/TaskForm';
import TaskModal from '../components/tasks/TaskModal';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  startOfWeek,
  addDays,
  setHours,
  setMinutes,
  isSameDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  addHours,
  addMinutes
} from 'date-fns';
import { he } from 'date-fns/locale';

// --- Constants ---
const START_HOUR = 6; // 06:00
const END_HOUR = 22;   // 22:00
const HOUR_HEIGHT = 60; // Pixels per hour
const SLOT_MINUTES = 30; // גריד של חצי שעה כמו Google Calendar

const getTaskDisplayTitle = (task) => {
  const title = (task?.title || '').trim();
  const projectName =
    typeof task?.projectId === 'object'
      ? (task.projectId?.name || '').trim()
      : '';

  if (!title) return projectName || '';
  return projectName ? `${title} - ${projectName}` : title;
};

const snapToSlot = (date) => {
  const d = new Date(date);
  const minutes = d.getHours() * 60 + d.getMinutes();
  const snapped = Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
  d.setHours(Math.floor(snapped / 60), snapped % 60, 0, 0);
  return d;
};

const clampIntoView = (start, durationMs, dayStart, dayEndExclusive) => {
  const minStart = dayStart.getTime();
  const maxStart = dayEndExclusive.getTime() - durationMs;
  const s = Math.min(Math.max(start.getTime(), minStart), maxStart);
  return new Date(s);
};

// מחשב פריסת אירנטים על ציר הזמן כך שאירועים חופפים יוצגו זה לצד זה
const layoutDayEvents = (events) => {
  if (!events || events.length === 0) return { laidOut: [], maxCols: 0 };

  // נמיין לפי זמן התחלה
  const sorted = [...events].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const active = [];
  let maxCols = 0;

  for (const ev of sorted) {
    const start = new Date(ev.startTime).getTime();

    // להסיר מה-active אירועים שכבר הסתיימו
    for (let i = active.length - 1; i >= 0; i -= 1) {
      const actEnd = new Date(active[i].endTime).getTime();
      if (actEnd <= start) {
        active.splice(i, 1);
      }
    }

    // מציאת אינדקס עמודה פנוי
    const used = new Set(active.map((e) => e.__colIndex ?? 0));
    let col = 0;
    while (used.has(col)) col += 1;
    ev.__colIndex = col;

    active.push(ev);
    if (active.length > maxCols) maxCols = active.length;
  }

  return { laidOut: sorted, maxCols };
};

const TimeGridEvent = ({
  event,
  style,
  onClick,
  onTaskPointerDown,
  onTaskResizePointerDown,
  onTaskResizeStartPointerDown,
  disableClick
}) => {
  const theme = useTheme();
  
  const isTask = event.__kind === 'task';
  const bgColor = isTask 
    ? (event.color || (event.priority === 'high' ? theme.palette.warning.main : event.priority === 'urgent' ? theme.palette.error.main : theme.palette.primary.main))
    : theme.palette.success.main;
  const title = isTask ? (event.displayTitle || event.title) : (event.subject || 'Follow-up');

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        if (!disableClick) onClick(event);
      }}
      onPointerDown={(e) => {
        if (!isTask) return;
        // כפתור ראשי בלבד
        if (e.button !== 0) return;
        e.stopPropagation();
        onTaskPointerDown?.(event, e);
      }}
      sx={{
        position: 'absolute',
        ...style,
        bgcolor: bgColor,
        color: '#fff',
        borderRadius: '4px',
        padding: '2px 4px',
        overflow: 'hidden',
        cursor: 'pointer',
        fontSize: '0.75rem',
        borderLeft: '3px solid rgba(0,0,0,0.2)',
        opacity: 0.9,
        transition: 'all 0.2s',
        zIndex: 10,
        '&:hover': {
          zIndex: 20,
          opacity: 1,
          boxShadow: 2
        }
      }}
    >
      {/* Resize handle (top) - change start time */}
      {isTask && (
        <Box
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            onTaskResizeStartPointerDown?.(event, e);
          }}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 8,
            cursor: 'ns-resize',
            bgcolor: 'rgba(0,0,0,0.18)',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        />
      )}

      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
        {format(new Date(event.startTime), 'HH:mm')}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </Typography>
      {!isTask && event.clientName && (
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.1, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.clientName}
        </Typography>
      )}

      {/* Resize handle (bottom) - Google Calendar style */}
      {isTask && (
        <Box
          onPointerDown={(e) => {
            // כפתור ראשי בלבד
            if (e.button !== 0) return;
            e.stopPropagation();
            onTaskResizePointerDown?.(event, e);
          }}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            cursor: 'ns-resize',
            bgcolor: 'rgba(0,0,0,0.18)',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px'
          }}
        />
      )}
    </Box>
  );
};

const CalendarView = () => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // For detailed view
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const createFormId = 'calendar-task-create-form';
  const [dragPreview, setDragPreview] = useState(null); // { taskId, startTime, endTime, displayTitle, title, __kind, color, priority }
  const dragStateRef = useRef(null);
  const gridBodyRef = useRef(null);
  const monthDragRef = useRef(null); // { taskId, startTime, endTime, displayTitle, title }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarResponse, isLoading } = useCalendarView(year, month);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const calendarData = calendarResponse?.data || {};
  const tasksByDate = calendarData.tasks || {};
  const interactionsByDate = calendarData.interactions || {};

  // --- Navigation Handlers ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateTask = (data) => {
    createTask.mutate(data, {
        onSuccess: () => {
            setCreateTaskDialogOpen(false);
        }
    });
  };

  // --- Data Preparation ---
  const getEventsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const tasksRaw = tasksByDate[dateKey] || [];
    const tasks = dragPreview?.taskId
      ? tasksRaw.filter((t) => String(t._id) !== String(dragPreview.taskId))
      : tasksRaw;
    const interactions = interactionsByDate[dateKey] || [];

    const allEvents = [
      ...tasks.map(t => { 
        // חישוב start/end כמו גוגל קלנדר:
        // - startDate אם קיים, אחרת dueDate
        // - endDate אם קיים
        // - אחרת, אם יש startDate + dueDate וה-dueDate אחרי ה-startDate, נשתמש ב-dueDate כ-end (היעד בפועל)
        // - אחרת, estimatedMinutes/actualMinutes אם קיים
        // - אחרת, ברירת מחדל שעה
        const baseStart = t.startDate ? new Date(t.startDate) : new Date(t.dueDate);
        const dueAsEnd =
          t.startDate &&
            t.dueDate &&
            new Date(t.dueDate).getTime() > new Date(t.startDate).getTime()
            ? new Date(t.dueDate)
            : null;

        const durationMinutes =
          (typeof t.actualMinutes === 'number' && t.actualMinutes > 0
            ? t.actualMinutes
            : (typeof t.estimatedMinutes === 'number' && t.estimatedMinutes > 0
              ? t.estimatedMinutes
              : 60));

        const rawEnd = t.endDate
          ? new Date(t.endDate)
          : (dueAsEnd || new Date(baseStart.getTime() + durationMinutes * 60 * 1000));

        // הגנה: end לפני start → נצמיד ל-start+30 דקות
        const baseEnd = rawEnd.getTime() > baseStart.getTime()
          ? rawEnd
          : new Date(baseStart.getTime() + SLOT_MINUTES * 60 * 1000);
        return {
          ...t, 
          __kind: 'task', 
          displayTitle: getTaskDisplayTitle(t),
          startTime: baseStart,
          endTime: baseEnd,
          color: t.color
        };
      }),
      ...interactions.map(i => ({ 
        ...i, 
        __kind: 'interaction',
        startTime: new Date(i.nextFollowUp),
        endTime: addHours(new Date(i.nextFollowUp), 1) // Default duration 1h
      }))
    ];

    // הוסף preview בזמן גרירה ליום היעד
    if (dragPreview?.taskId) {
      const previewKey = format(new Date(dragPreview.startTime), 'yyyy-MM-dd');
      if (previewKey === dateKey) {
        allEvents.push({
          ...dragPreview,
          _id: dragPreview.taskId,
          __kind: 'task',
          startTime: new Date(dragPreview.startTime),
          endTime: new Date(dragPreview.endTime)
        });
      }
    }

    // Filter out invalid dates
    return allEvents.filter(e => !isNaN(e.startTime.getTime()));
  };

  // --- Render Methods ---

  // 1. Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Calculate start and end date of the calendar grid (including days from prev/next month)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6); // End of last week
    
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <Box sx={{ mt: 2, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
            <Box 
              key={day} 
              sx={{ 
                textAlign: 'center', 
                py: 1,
                borderRight: index < 6 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          bgcolor: 'background.paper'
        }}>
          {calendarDays.map((day, index) => {
            const events = getEventsForDate(day);
            const isTodayDate = isToday(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isLastInRow = (index + 1) % 7 === 0;
            const isLastRow = index >= calendarDays.length - 7;

            return (
              <Box 
                key={day.toISOString()} 
                sx={{ 
                  minHeight: 120, 
                  borderRight: isLastInRow ? 0 : 1, 
                  borderBottom: isLastRow ? 0 : 1, 
                  borderColor: 'divider',
                  p: 0.5,
                  bgcolor: isTodayDate 
                    ? 'rgba(25, 118, 210, 0.04)' 
                    : isCurrentMonth 
                      ? 'white' 
                      : '#f9f9f9',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: isCurrentMonth ? '#f5f5f5' : '#f0f0f0' },
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onDragOver={(e) => {
                  // מאפשר drop של משימה ליום אחר
                  if (monthDragRef.current?.taskId) e.preventDefault();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const dragged = monthDragRef.current;
                  if (!dragged?.taskId) return;

                  const origStart = new Date(dragged.startTime);
                  const origEnd = new Date(dragged.endTime);
                  const durationMs = Math.max(origEnd.getTime() - origStart.getTime(), SLOT_MINUTES * 60 * 1000);

                  // שמירת שעות/דקות והחלפת תאריך ליום ה-drop
                  let nextStart = new Date(day);
                  nextStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
                  nextStart = snapToSlot(nextStart);

                  const dayStart = setMinutes(setHours(new Date(day), START_HOUR), 0);
                  const dayEnd = setMinutes(setHours(new Date(day), END_HOUR + 1), 0);
                  nextStart = clampIntoView(nextStart, durationMs, dayStart, dayEnd);

                  const nextEnd = new Date(nextStart.getTime() + durationMs);

                  await updateTask.mutateAsync({
                    id: dragged.taskId,
                    data: {
                      startDate: nextStart.toISOString(),
                      endDate: nextEnd.toISOString(),
                      dueDate: nextEnd.toISOString()
                    }
                  });

                  monthDragRef.current = null;
                }}
                onClick={() => {
                   setSelectedDate(day);
                   setSelectedEvent(null); 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isTodayDate ? 'bold' : 'normal',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: isTodayDate ? 'primary.light' : 'transparent',
                      color: isTodayDate ? 'white' : (isCurrentMonth ? 'text.primary' : 'text.disabled'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {events.slice(0, 3).map(event => {
                    const bgColor = event.__kind === 'task' 
                      ? (event.color || (event.priority === 'urgent' ? theme.palette.error.main : theme.palette.primary.main))
                      : theme.palette.success.main;
                    return (
                      <Box 
                        key={event._id}
                        sx={{ 
                          bgcolor: bgColor,
                          color: 'white',
                          borderRadius: 0.5,
                          px: 0.5,
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          opacity: isCurrentMonth ? 1 : 0.6,
                          lineHeight: 1.5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (event.__kind === 'task') setSelectedTaskId(event._id);
                          else setSelectedEvent(event);
                        }}
                        draggable={event.__kind === 'task'}
                      onDragStart={() => {
                        if (event.__kind !== 'task') return;
                        monthDragRef.current = {
                          taskId: event._id,
                          startTime: event.startTime,
                          endTime: event.endTime,
                          displayTitle: event.displayTitle || event.title,
                          title: event.title,
                          color: event.color
                        };
                      }}
                      >
                        {format(new Date(event.startTime), 'HH:mm')} {event.__kind === 'task' ? (event.displayTitle || event.title) : event.subject}
                      </Box>
                    );
                  })}
                  {events.length > 3 && (
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.7rem' }}>
                      +{events.length - 3} נוספים
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // 2. Time Grid View (Week / Day)
  const renderTimeGridView = () => {
    // Determine days to show
    let daysToShow = [];
    if (viewMode === 'day') {
      daysToShow = [currentDate];
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      daysToShow = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }

    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);
    const slotsPerHour = 60 / SLOT_MINUTES;
    const totalSlots = hours.length * slotsPerHour;

    const handleTaskPointerDown = (event, pointerEvent, dayIndex, daysToShow) => {
      const gridRect = gridBodyRef.current?.getBoundingClientRect?.();
      if (!gridRect) return;

      const originalStart = new Date(event.startTime);
      const originalEnd = new Date(event.endTime);
      const durationMs = Math.max(originalEnd.getTime() - originalStart.getTime(), SLOT_MINUTES * 60 * 1000);

      dragStateRef.current = {
        mode: 'move',
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        color: event.color,
        priority: event.priority,
        pointerStart: { x: pointerEvent.clientX, y: pointerEvent.clientY },
        originalStart,
        originalEnd,
        durationMs,
        startDayIndex: dayIndex,
        daysCount: daysToShow.length
      };

      // יצירת preview ראשוני
      setDragPreview({
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        __kind: 'task',
        color: event.color,
        priority: event.priority,
        startTime: originalStart,
        endTime: originalEnd
      });

      try {
        pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      } catch {
        // ignore
      }
    };

    const handleTaskResizePointerDown = (event, pointerEvent) => {
      const gridRect = gridBodyRef.current?.getBoundingClientRect?.();
      if (!gridRect) return;

      const originalStart = new Date(event.startTime);
      const originalEnd = new Date(event.endTime);
      const minDurationMs = (SLOT_MINUTES / 2) * 60 * 1000; // 15 דקות כברירת מחדל
      const durationMs = Math.max(originalEnd.getTime() - originalStart.getTime(), minDurationMs);

      dragStateRef.current = {
        mode: 'resize',
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        color: event.color,
        priority: event.priority,
        pointerStart: { x: pointerEvent.clientX, y: pointerEvent.clientY },
        originalStart,
        originalEnd,
        durationMs,
        minDurationMs,
        daysCount: viewMode === 'day' ? 1 : 7
      };

      setDragPreview({
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        __kind: 'task',
        color: event.color,
        priority: event.priority,
        startTime: originalStart,
        endTime: originalEnd
      });

      try {
        pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      } catch {
        // ignore
      }
    };

    const handleTaskResizeStartPointerDown = (event, pointerEvent) => {
      const gridRect = gridBodyRef.current?.getBoundingClientRect?.();
      if (!gridRect) return;

      const originalStart = new Date(event.startTime);
      const originalEnd = new Date(event.endTime);
      const minDurationMs = (SLOT_MINUTES / 2) * 60 * 1000; // 15 דקות
      const durationMs = Math.max(originalEnd.getTime() - originalStart.getTime(), minDurationMs);

      dragStateRef.current = {
        mode: 'resize_start',
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        color: event.color,
        priority: event.priority,
        pointerStart: { x: pointerEvent.clientX, y: pointerEvent.clientY },
        originalStart,
        originalEnd,
        durationMs,
        minDurationMs,
        daysCount: viewMode === 'day' ? 1 : 7
      };

      setDragPreview({
        taskId: event._id,
        displayTitle: event.displayTitle || event.title,
        title: event.title,
        __kind: 'task',
        color: event.color,
        priority: event.priority,
        startTime: originalStart,
        endTime: originalEnd
      });

      try {
        pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      } catch {
        // ignore
      }
    };

    const isDragging = Boolean(dragStateRef.current && dragPreview);

    return (
      <Paper sx={{ mt: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} elevation={0} variant="outlined">
        {/* Header Row (Dates) */}
        <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
          {/* Time Column Header (Empty) */}
          <Box sx={{ width: 60, flexShrink: 0, borderRight: 1, borderColor: 'divider' }} />
          
          {/* Days Headers */}
          {daysToShow.map((day) => {
             const isTodayDate = isToday(day);
             return (
              <Box 
                key={day.toISOString()} 
                sx={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  py: 1.5, 
                  borderRight: 1, 
                  borderColor: 'divider',
                  bgcolor: isTodayDate ? 'rgba(25, 118, 210, 0.04)' : 'transparent'
                }}
              >
                <Typography variant="subtitle2" color={isTodayDate ? 'primary' : 'text.secondary'}>
                  {format(day, 'EEEE', { locale: he })}
                </Typography>
                <Typography variant="h6" color={isTodayDate ? 'primary' : 'text.primary'}>
                  {format(day, 'd MMM', { locale: he })}
                </Typography>
              </Box>
             );
          })}
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ overflowY: 'auto', height: '600px', position: 'relative' }}>
           {/* Time Labels Column */}
           <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', zIndex: 5 }}>
              {hours.map(hour => (
                <Box key={hour} sx={{ height: HOUR_HEIGHT, borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ position: 'absolute', top: -10, right: 8, bgcolor: 'background.paper', px: 0.5 }}
                  >
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </Typography>
                </Box>
              ))}
           </Box>

           {/* Grid Body */}
          <Box ref={gridBodyRef} sx={{ ml: '60px', display: 'flex', minHeight: hours.length * HOUR_HEIGHT }}>
              {daysToShow.map((day) => {
                 const dayEvents = getEventsForDate(day);
                 const { laidOut, maxCols } = layoutDayEvents(dayEvents);
                 const cols = Math.max(maxCols, 1);
              const dayIndex = daysToShow.findIndex((d) => isSameDay(d, day));

                 return (
                   <Box 
                    key={day.toISOString()} 
                    sx={{ 
                      flex: 1, 
                      borderRight: 1, 
                      borderColor: 'divider', 
                      position: 'relative',
                      bgcolor: isToday(day) ? 'rgba(25, 118, 210, 0.02)' : 'transparent'
                    }}
                  >
                  {/* Slot lines (30 דקות) */}
                  {Array.from({ length: totalSlots }).map((_, slotIdx) => (
                    <Box
                      key={`slot-${slotIdx}`}
                      sx={{
                        height: HOUR_HEIGHT / slotsPerHour,
                        borderBottom: 1,
                        borderColor: slotIdx % slotsPerHour === 0 ? 'divider' : 'rgba(0,0,0,0.06)'
                      }}
                    />
                      ))}

                      {/* Events */}
                      {laidOut.map(event => {
                    // מציגים אירוע אם הוא חותך את חלון השעות (כולל קלמפינג כמו גוגל קלנדר)
                    const dayStart = setMinutes(setHours(new Date(day), START_HOUR), 0);
                    const dayEnd = setMinutes(setHours(new Date(day), END_HOUR + 1), 0); // end בלעדי

                    const rawStart = new Date(event.startTime);
                    const rawEnd = new Date(event.endTime);

                    if (isNaN(rawStart.getTime()) || isNaN(rawEnd.getTime())) return null;
                    if (rawEnd <= dayStart || rawStart >= dayEnd) return null;

                    const clampedStart = rawStart < dayStart ? dayStart : rawStart;
                    const clampedEnd = rawEnd > dayEnd ? dayEnd : rawEnd;

                    const minutesFromStart = differenceInMinutes(clampedStart, dayStart);
                    const duration = Math.max(differenceInMinutes(clampedEnd, clampedStart), SLOT_MINUTES / 2); // מינימום 15 דק׳ כדי שלא ייעלם

                    const top = minutesFromStart * (HOUR_HEIGHT / 60);
                    const height = duration * (HOUR_HEIGHT / 60);

                         // חישוב רוחב ומיקום אופקי כדי לאפשר אירועים חופפים זה לצד זה
                         const colIndex = event.__colIndex || 0;
                         const widthPercent = 100 / cols;
                         const leftPercent = colIndex * widthPercent;

                         return (
                           <TimeGridEvent 
                             key={event._id} 
                             event={event} 
                             style={{ 
                               top, 
                               height, 
                               left: `${leftPercent + 1}%`, 
                               width: `${widthPercent - 2}%` 
                             }}
                        onClick={(e) => {
                          if (e.__kind === 'task') setSelectedTaskId(e._id);
                          else setSelectedEvent(e);
                        }}
                        disableClick={isDragging}
                        onTaskPointerDown={(ev, pe) => handleTaskPointerDown(ev, pe, dayIndex, daysToShow)}
                        onTaskResizePointerDown={handleTaskResizePointerDown}
                        onTaskResizeStartPointerDown={handleTaskResizeStartPointerDown}
                           />
                         );
                      })}
                   </Box>
                 );
              })}
           </Box>
           
           {/* Current Time Indicator (if today is in view) */}
           {daysToShow.some(d => isToday(d)) && (
             <CurrentTimeIndicator viewMode={viewMode} daysToShow={daysToShow} />
           )}
        </Box>
      </Paper>
    );
  };

  // Drag handlers (week/day)
  useEffect(() => {
    if (!dragStateRef.current || !dragPreview) return;

    const onMove = (e) => {
      const state = dragStateRef.current;
      if (!state) return;

      const gridRect = gridBodyRef.current?.getBoundingClientRect?.();
      if (!gridRect) return;

      const pxPerMinute = HOUR_HEIGHT / 60;

      if (state.mode === 'resize') {
        const taskDay = new Date(state.originalStart);
        const dayStart = setMinutes(setHours(new Date(taskDay), START_HOUR), 0);
        const dayEnd = setMinutes(setHours(new Date(taskDay), END_HOUR + 1), 0); // end בלעדי

        // end לפי המיקום האנכי של העכבר (snapping ל-30 דק')
        const y = e.clientY - gridRect.top; // px from top of grid
        const minutesFromDayStart = Math.max(0, Math.round((y / pxPerMinute) / SLOT_MINUTES) * SLOT_MINUTES);
        let nextEnd = addMinutes(dayStart, minutesFromDayStart);
        nextEnd = snapToSlot(nextEnd);

        const minEnd = new Date(state.originalStart.getTime() + state.minDurationMs);
        if (nextEnd.getTime() < minEnd.getTime()) nextEnd = snapToSlot(minEnd);
        if (nextEnd.getTime() > dayEnd.getTime()) nextEnd = new Date(dayEnd.getTime());

        // שמירה על start המקורי
        setDragPreview((prev) => ({
          ...(prev || {}),
          taskId: state.taskId,
          displayTitle: state.displayTitle,
          title: state.title,
          __kind: 'task',
          color: state.color,
          priority: state.priority,
          startTime: state.originalStart,
          endTime: nextEnd
        }));
      } else if (state.mode === 'resize_start') {
        const taskDay = new Date(state.originalStart);
        const dayStart = setMinutes(setHours(new Date(taskDay), START_HOUR), 0);
        const dayEnd = setMinutes(setHours(new Date(taskDay), END_HOUR + 1), 0); // end בלעדי

        // start לפי המיקום האנכי של העכבר (snapping ל-30 דק')
        const y = e.clientY - gridRect.top; // px from top of grid
        const minutesFromDayStart = Math.max(0, Math.round((y / pxPerMinute) / SLOT_MINUTES) * SLOT_MINUTES);
        let nextStart = addMinutes(dayStart, minutesFromDayStart);
        nextStart = snapToSlot(nextStart);

        // אסור לעבור את end - minDuration
        const maxStart = new Date(state.originalEnd.getTime() - state.minDurationMs);
        if (nextStart.getTime() > maxStart.getTime()) nextStart = snapToSlot(maxStart);

        // קלמפינג לתחום התצוגה
        if (nextStart.getTime() < dayStart.getTime()) nextStart = new Date(dayStart.getTime());
        if (nextStart.getTime() > dayEnd.getTime()) nextStart = new Date(dayEnd.getTime());

        setDragPreview((prev) => ({
          ...(prev || {}),
          taskId: state.taskId,
          displayTitle: state.displayTitle,
          title: state.title,
          __kind: 'task',
          color: state.color,
          priority: state.priority,
          startTime: nextStart,
          endTime: state.originalEnd
        }));
      } else {
        // mode: move
        const dayWidth = gridRect.width / state.daysCount;
        const rawIndex = Math.floor((e.clientX - gridRect.left) / dayWidth);
        const visualIndex = isRtl && state.daysCount > 1
          ? (state.daysCount - 1 - rawIndex)
          : rawIndex;
        const currentDayIndex = Math.max(0, Math.min(state.daysCount - 1, visualIndex));

        const deltaY = e.clientY - state.pointerStart.y;
        const rawDeltaMinutes = deltaY / pxPerMinute;
        const snappedDeltaMinutes = Math.round(rawDeltaMinutes / SLOT_MINUTES) * SLOT_MINUTES;

        const baseShifted = addMinutes(state.originalStart, snappedDeltaMinutes);
        const targetDay = (() => {
          if (viewMode === 'day') return currentDate;
          const start = startOfWeek(currentDate, { weekStartsOn: 0 });
          return addDays(start, currentDayIndex);
        })();

        let nextStart = new Date(targetDay);
        nextStart.setHours(baseShifted.getHours(), baseShifted.getMinutes(), 0, 0);
        nextStart = snapToSlot(nextStart);

        const dayStart = setMinutes(setHours(new Date(targetDay), START_HOUR), 0);
        const dayEnd = setMinutes(setHours(new Date(targetDay), END_HOUR + 1), 0);
        nextStart = clampIntoView(nextStart, state.durationMs, dayStart, dayEnd);

        const nextEnd = new Date(nextStart.getTime() + state.durationMs);

        setDragPreview((prev) => ({
          ...(prev || {}),
          taskId: state.taskId,
          displayTitle: state.displayTitle,
          title: state.title,
          __kind: 'task',
          color: state.color,
          priority: state.priority,
          startTime: nextStart,
          endTime: nextEnd
        }));
      }
    };

    const onUp = async () => {
      const state = dragStateRef.current;
      const preview = dragPreview;
      dragStateRef.current = null;

      if (!state || !preview) {
        setDragPreview(null);
        return;
      }

      // אם לא זזנו באמת, אל תשלח עדכון
      const startChanged = new Date(preview.startTime).getTime() !== state.originalStart.getTime();
      const endChanged = new Date(preview.endTime).getTime() !== state.originalEnd.getTime();

      if (state.mode === 'resize') {
        if (endChanged) {
          await updateTask.mutateAsync({
            id: state.taskId,
            data: {
              endDate: new Date(preview.endTime).toISOString(),
              dueDate: new Date(preview.endTime).toISOString()
            }
          });
        }
      } else if (state.mode === 'resize_start') {
        if (startChanged) {
          await updateTask.mutateAsync({
            id: state.taskId,
            data: {
              startDate: new Date(preview.startTime).toISOString()
            }
          });
        }
      } else {
        if (startChanged || endChanged) {
          await updateTask.mutateAsync({
            id: state.taskId,
            data: {
              startDate: new Date(preview.startTime).toISOString(),
              endDate: new Date(preview.endTime).toISOString(),
              dueDate: new Date(preview.endTime).toISOString()
            }
          });
        }
      }

      setDragPreview(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragPreview, updateTask, viewMode, currentDate, isRtl]);
  
  // Helper for current time line
  const CurrentTimeIndicator = ({ daysToShow }) => {
     const [now, setNow] = useState(new Date());

     useEffect(() => {
       const interval = setInterval(() => setNow(new Date()), 60000);
       return () => clearInterval(interval);
     }, []);

     const h = getHours(now);
     const m = getMinutes(now);
     
     if (h < START_HOUR || h > END_HOUR) return null;

     const top = ((h - START_HOUR) * 60 + m) * (HOUR_HEIGHT / 60);
     
     // Find column index for today
     const todayIndex = daysToShow.findIndex(d => isToday(d));
     if (todayIndex === -1) return null;
     
     // width calculation: 100% / number of days
     const colWidth = 100 / daysToShow.length;
     const left = todayIndex * colWidth;

     return (
       <Box
         sx={{
           position: 'absolute',
           top,
           left: `calc(60px + ${left}%)`, // 60px offset for time column
           width: `${colWidth}%`,
           height: '2px',
           bgcolor: 'red',
           zIndex: 20,
           pointerEvents: 'none',
           '&::before': {
             content: '""',
             position: 'absolute',
             left: -4,
             top: -3,
             width: 8,
             height: 8,
             borderRadius: '50%',
             bgcolor: 'red'
           }
         }}
       />
     );
  };


  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>טוען יומן...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
           <Typography variant="h4" fontWeight="bold">
            {format(currentDate, 'MMMM yyyy', { locale: he })}
           </Typography>
           <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handlePrev} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                <ChevronRightIcon />
              </IconButton>
              <Button onClick={handleToday} variant="outlined" size="small" startIcon={<TodayIcon />}>
                היום
              </Button>
              <IconButton onClick={handleNext} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                <ChevronLeftIcon />
              </IconButton>
           </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
           <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setCreateTaskDialogOpen(true)}
           >
              משימה חדשה
           </Button>

           <ButtonGroup variant="contained" size="small" color="primary" sx={{ boxShadow: 0 }}>
            <Button 
                variant={viewMode === 'day' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('day')}
                sx={{ bgcolor: viewMode === 'day' ? 'primary.main' : 'white', color: viewMode === 'day' ? 'white' : 'primary.main' }}
            >
              יום
            </Button>
            <Button 
                variant={viewMode === 'week' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('week')}
                sx={{ bgcolor: viewMode === 'week' ? 'primary.main' : 'white', color: viewMode === 'week' ? 'white' : 'primary.main' }}
            >
              שבוע
            </Button>
            <Button 
                variant={viewMode === 'month' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('month')}
                sx={{ bgcolor: viewMode === 'month' ? 'primary.main' : 'white', color: viewMode === 'month' ? 'white' : 'primary.main' }}
            >
              חודש
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Main Calendar Content */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {viewMode === 'month' ? renderMonthView() : renderTimeGridView()}
      </Box>

      {/* Event Details Dialog (Reused from logic) */}
      <Dialog 
        open={Boolean(selectedEvent)} 
        onClose={() => setSelectedEvent(null)}
        maxWidth="xs"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               {selectedEvent.__kind === 'task' ? <AccessTimeIcon color="primary" /> : <EventIcon color="success" />}
               {selectedEvent.__kind === 'task' ? 'פרטי משימה' : 'פרטי אינטראקציה'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.__kind === 'task' ? selectedEvent.title : selectedEvent.subject}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  זמן: {format(selectedEvent.startTime, 'dd/MM/yyyy HH:mm')}
                </Typography>
                
                {selectedEvent.__kind === 'task' && (
                  <Chip 
                    label={selectedEvent.priority} 
                    size="small" 
                    color={selectedEvent.priority === 'urgent' ? 'error' : selectedEvent.priority === 'high' ? 'warning' : 'primary'}
                    sx={{ mr: 1 }}
                  />
                )}
                {selectedEvent.__kind === 'interaction' && (
                  <Chip 
                    label={selectedEvent.type} 
                    size="small" 
                    color="success"
                    sx={{ mr: 1 }}
                  />
                )}
              </Box>

              {selectedEvent.description && (
                <Typography variant="body1" sx={{ mt: 2, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                  {selectedEvent.description}
                </Typography>
              )}
              
              {selectedEvent.content && (
                <Typography variant="body1" sx={{ mt: 2, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                  {selectedEvent.content}
                </Typography>
              )}

              {selectedEvent.clientName && (
                <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                   <Typography variant="caption" color="text.secondary">לקוח מקושר:</Typography>
                   <Typography variant="subtitle2">{selectedEvent.clientName}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>סגור</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Task Modal */}
      <TaskModal
        open={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
      
      {/* Day Click List Dialog (Only for Month View selection) */}
      <Dialog 
         open={Boolean(selectedDate) && !selectedEvent && !createTaskDialogOpen} 
         onClose={() => setSelectedDate(null)}
         maxWidth="sm"
         fullWidth
      >
         <DialogTitle>
           אירועים ל-{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: he })}
         </DialogTitle>
         <DialogContent>
           {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
             <List>
               {getEventsForDate(selectedDate).map(event => (
                 <ListItem 
                   key={event._id} 
                   button 
                  onClick={() => {
                    if (event.__kind === 'task') setSelectedTaskId(event._id);
                    else setSelectedEvent(event);
                  }}
                   sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                 >
                   <ListItemText 
                    primary={event.__kind === 'task' ? (event.displayTitle || event.title) : event.subject || 'Follow-up'}
                     secondary={`${format(event.startTime, 'HH:mm')} - ${event.clientName || ''}`}
                   />
                   <Chip 
                     label={event.__kind === 'task' ? 'משימה' : 'אינטראקציה'} 
                     size="small" 
                     color={event.__kind === 'task' ? 'primary' : 'success'} 
                   />
                 </ListItem>
               ))}
             </List>
           ) : (
             <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
               אין אירועים ליום זה
             </Typography>
           )}
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setSelectedDate(null)}>סגור</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                  // Close this dialog and open Create Task
                  setCreateTaskDialogOpen(true);
                  // Keep selectedDate so it can be used as default
              }}
            >
                הוסף משימה
            </Button>
         </DialogActions>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            משימה חדשה
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TaskForm 
            formId={createFormId}
            showActions={false}
            initialData={{ 
                dueDate: selectedDate 
                    ? format(setHours(setMinutes(selectedDate, 0), 10), "yyyy-MM-dd'T'HH:mm") // Default to 10:00 on selected day
                    : format(new Date(), "yyyy-MM-dd'T'HH:mm") 
            }}
            onSubmit={handleCreateTask}
            onCancel={() => setCreateTaskDialogOpen(false)}
            isLoading={createTask.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskDialogOpen(false)} disabled={createTask.isPending}>
            ביטול
          </Button>
          <Button
            type="submit"
            form={createFormId}
            variant="contained"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? 'שומר…' : 'צור משימה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView;
