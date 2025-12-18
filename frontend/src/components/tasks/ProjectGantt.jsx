import React from 'react';
import { Box, Typography, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { addDays, differenceInDays, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

const ROW_HEIGHT = 44;
const DAY_MS = 24 * 60 * 60 * 1000;

const isDateOnlyString = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

const parseRangeValue = (v, fallback) => {
  if (!v) return fallback;
  if (v instanceof Date) return new Date(v);
  if (typeof v === 'string') {
    // תאריך בלבד (YYYY-MM-DD) צריך להיקרא "מקומי" ולא UTC כדי למנוע סטייה של יום
    const d = new Date(isDateOnlyString(v) ? `${v}T00:00:00` : v);
    return Number.isNaN(d.getTime()) ? fallback : d;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

const normalizeToStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatShort = (date) =>
  new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });

const formatLong = (date) =>
  new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusLabel = (status) => {
  const map = {
    todo: 'לביצוע',
    in_progress: 'בטיפול',
    waiting: 'ממתין',
    completed: 'הושלם',
    cancelled: 'בוטל'
  };
  return map[status] || status || '';
};

// תצוגת גאנט "נורמלית" (כותרות דביקות + סקאלה עם תאריכים אמיתיים) ללא תלות חיצונית
const ProjectGantt = ({ projects = [], range }) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const labelColWidth = isNarrow ? 240 : 320;
  const minTableWidth = isNarrow ? 900 : 1100;

  if (!projects.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          אין משימות לתצוגה בטווח התאריכים הנבחר.
        </Typography>
      </Box>
    );
  }

  const now = normalizeToStartOfDay(new Date());
  const fallbackStart = normalizeToStartOfDay(new Date());
  const fallbackEnd = normalizeToStartOfDay(addDays(fallbackStart, 365));

  const rawStart = parseRangeValue(range?.from, fallbackStart);
  const rawEnd = parseRangeValue(range?.to, fallbackEnd);

  const start = normalizeToStartOfDay(rawStart <= rawEnd ? rawStart : rawEnd);
  const end = normalizeToStartOfDay(rawStart <= rawEnd ? rawEnd : rawStart);

  let days = [];
  try {
    days = eachDayOfInterval({ start, end });
  } catch {
    days = [start];
  }

  const totalDays = Math.max(days.length, 1);
  const scale = totalDays > 120 ? 'week' : 'day';
  const unitDates =
    scale === 'day'
      ? days
      : (() => {
        const arr = [];
        let d = start;
        while (d <= end) {
          arr.push(d);
          d = addDays(d, 7);
        }
        return arr.length ? arr : [start];
      })();
  const totalUnits = Math.max(unitDates.length, 1);
  const unitWidthPct = 100 / totalUnits;
  const totalMs = Math.max(end.getTime() - start.getTime() + DAY_MS, DAY_MS);

  const getOffsetAndWidth = (task) => {
    const taskStartRaw = task.startDate || task.dueDate || task.endDate || start;
    const taskEndRaw = task.endDate || task.dueDate || task.startDate || taskStartRaw;

    const taskStart = normalizeToStartOfDay(parseRangeValue(taskStartRaw, start));
    const taskEnd = normalizeToStartOfDay(parseRangeValue(taskEndRaw, taskStart));

    const clampedStart = taskStart < start ? start : taskStart;
    const clampedEnd = taskEnd > end ? end : taskEnd;

    const leftMs = Math.max(clampedStart.getTime() - start.getTime(), 0);
    const widthMs = Math.max(clampedEnd.getTime() - clampedStart.getTime() + DAY_MS, DAY_MS);

    return {
      leftPct: Math.min((leftMs / totalMs) * 100, 100),
      widthPct: Math.min((widthMs / totalMs) * 100, 100)
    };
  };

  const todayInRange = now >= start && now <= end;
  const todayLeftPct = todayInRange ? Math.min(((now.getTime() - start.getTime()) / totalMs) * 100, 100) : null;

  // חודשיות לכותרת עליונה (תאים "מאוחדים")
  const monthSegments = [];
  let segStartIdx = 0;
  for (let i = 0; i < unitDates.length; i += 1) {
    const isLast = i === unitDates.length - 1;
    const nextBreak = !isLast && !isSameMonth(unitDates[i], unitDates[i + 1]);
    if (nextBreak || isLast) {
      const endIdx = i;
      const count = endIdx - segStartIdx + 1;
      monthSegments.push({
        key: `${unitDates[segStartIdx].getFullYear()}-${unitDates[segStartIdx].getMonth()}`,
        label: unitDates[segStartIdx].toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
        widthPct: (count / totalUnits) * 100
      });
      segStartIdx = i + 1;
    }
  }

  const gridBg = {
    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px)',
    backgroundSize: `${unitWidthPct}% 100%`,
    backgroundPosition: 'left top'
  };

  const tooltipContent = (task, project) => {
    const taskStart = task.startDate || task.dueDate || task.endDate;
    const taskEnd = task.endDate || task.dueDate || task.startDate;

    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
          {task.title}
        </Typography>
        {project?.name && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            פרויקט: {project.name}
          </Typography>
        )}
        {taskStart && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            התחלה: {formatLong(taskStart)}
          </Typography>
        )}
        {taskEnd && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            סיום: {formatLong(taskEnd)}
          </Typography>
        )}
        {task.status && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            סטטוס: {statusLabel(task.status)}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ minWidth: minTableWidth }}>
        {/* Sticky header */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          {/* Months row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: `${labelColWidth}px 1fr` }}>
            <Box
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 6,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                משימה
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 1, direction: 'ltr', display: 'flex', alignItems: 'center', gap: 0 }}>
              {monthSegments.map((seg) => (
                <Box
                  key={seg.key}
                  sx={{
                    width: `${seg.widthPct}%`,
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    pl: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {seg.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Days row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: `${labelColWidth}px 1fr` }}>
            <Box
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 6,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {formatLong(start)} – {formatLong(end)}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'relative',
                direction: 'ltr',
                px: 1,
                py: 0.75,
                ...gridBg
              }}
            >
              {todayInRange && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${todayLeftPct}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: 'error.main',
                    opacity: 0.7
                  }}
                />
              )}

              <Box sx={{ display: 'flex' }}>
                {unitDates.map((d, idx) => {
                  // כדי לא להעמיס: בסקאלה יומית מציגים כל 2 ימים, ובסקאלה שבועית מציגים כל שבוע
                  const showLabel =
                    scale === 'week'
                      ? true
                      : idx === 0 || idx === unitDates.length - 1 || idx % 2 === 0 || isSameDay(d, now);
                  return (
                    <Box
                      key={d.toISOString()}
                      sx={{
                        width: `${unitWidthPct}%`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSameDay(d, now) ? 'error.main' : 'text.secondary',
                          fontWeight: isSameDay(d, now) ? 800 : 500,
                          fontSize: '0.72rem',
                          lineHeight: 1.2
                        }}
                      >
                        {showLabel ? formatShort(d) : ''}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Body */}
        <Box>
          {projects.map(({ project, tasks }) => {
            const sortedTasks = (tasks || []).slice().sort((a, b) => {
              const aTs = new Date(a.startDate || a.dueDate || a.endDate || 0).getTime();
              const bTs = new Date(b.startDate || b.dueDate || b.endDate || 0).getTime();
              return aTs - bTs;
            });

            return (
              <Box key={project?._id || project?.name}>
                {/* Project row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `${labelColWidth}px 1fr`,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.50'
                  }}
                >
                  <Box
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      bgcolor: 'grey.50',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: project?.color || 'primary.main',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {project?.name || 'ללא פרויקט'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sortedTasks.length} משימות
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ position: 'relative', direction: 'ltr', height: ROW_HEIGHT, ...gridBg }}>
                    {todayInRange && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${todayLeftPct}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          bgcolor: 'error.main',
                          opacity: 0.25
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Task rows */}
                {sortedTasks.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      אין משימות לפרויקט זה
                    </Typography>
                  </Box>
                ) : (
                  sortedTasks.map((task, rowIdx) => {
                    const { leftPct, widthPct } = getOffsetAndWidth(task);
                    const taskStart = task.startDate || task.dueDate || task.endDate;
                    const taskEnd = task.endDate || task.dueDate || task.startDate;
                    const isCompleted = task.status === 'completed';

                    return (
                      <Box
                        key={task._id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: `${labelColWidth}px 1fr`,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: rowIdx % 2 === 0 ? 'background.paper' : 'grey.25'
                        }}
                      >
                        {/* Sticky label cell */}
                        <Box
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            bgcolor: rowIdx % 2 === 0 ? 'background.paper' : 'grey.25',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            px: 2,
                            height: ROW_HEIGHT,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Box sx={{ minWidth: 0, width: '100%' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {(taskStart ? formatShort(taskStart) : 'ללא תאריך')}{taskEnd ? ` → ${formatShort(taskEnd)}` : ''}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Timeline cell */}
                        <Box
                          sx={{
                            position: 'relative',
                            direction: 'ltr',
                            height: ROW_HEIGHT,
                            ...gridBg
                          }}
                        >
                          {todayInRange && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: `${todayLeftPct}%`,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                bgcolor: 'error.main',
                                opacity: 0.18
                              }}
                            />
                          )}

                          <Tooltip title={tooltipContent(task, project)} arrow placement="top">
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 10,
                                left: `${leftPct}%`,
                                width: `${Math.max(widthPct, 0.35)}%`,
                                minWidth: 6,
                                height: 22,
                                borderRadius: 999,
                                bgcolor: task.color || project?.color || 'primary.main',
                                opacity: isCompleted ? 0.55 : 0.95,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                boxShadow: isCompleted ? 0 : 1,
                                transition: 'transform 0.12s ease, opacity 0.12s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  opacity: isCompleted ? 0.65 : 1
                                }
                              }}
                            >
                              {widthPct >= 12 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'common.white',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {task.title}
                                </Typography>
                              )}
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectGantt;





