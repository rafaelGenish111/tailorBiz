import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { differenceInDays } from 'date-fns';

// Gantt פשוט ב־CSS ללא ספרייה חיצונית, כדי להשתלב בעיצוב הקיים
const ProjectGantt = ({ projects = [], range }) => {
  if (!projects.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          אין משימות לתצוגה בטווח התאריכים הנבחר.
        </Typography>
      </Box>
    );
  }

  const start = range?.from ? new Date(range.from) : new Date();
  const end = range?.to ? new Date(range.to) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  const totalDays = Math.max(differenceInDays(end, start) + 1, 1);

  const getOffsetAndWidth = (task) => {
    const taskStart = new Date(task.startDate || task.endDate || start);
    const taskEnd = new Date(task.endDate || task.startDate || taskStart);

    const clampedStart = taskStart < start ? start : taskStart;
    const clampedEnd = taskEnd > end ? end : taskEnd;

    const offsetDays = Math.max(differenceInDays(clampedStart, start), 0);
    const durationDays = Math.max(differenceInDays(clampedEnd, clampedStart) + 1, 1);

    const left = (offsetDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;
    return { left, width };
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: 800 }}>
        {/* Header scale */}
        <Box sx={{ display: 'flex', mb: 2, pl: 24 }}>
          {Array.from({ length: totalDays }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                borderLeft: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
                fontSize: '0.7rem',
                color: 'text.secondary'
              }}
            >
              {idx + 1}
            </Box>
          ))}
        </Box>

        {/* Projects and Tasks */}
        {projects.map(({ project, tasks }) => (
          <Box key={project._id} sx={{ mb: 3 }}>
            {/* Project header */}
            <Box sx={{ mb: 1.5, pl: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {project.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tasks.length} משימות
              </Typography>
            </Box>

            {/* Task rows */}
            {tasks.length === 0 ? (
              <Box sx={{ pl: 1, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  אין משימות לפרויקט זה
                </Typography>
              </Box>
            ) : (
              tasks.map((task) => {
                const { left, width } = getOffsetAndWidth(task);
                const taskStart = task.startDate || task.endDate;
                const taskEnd = task.endDate || task.startDate;
                const tooltipText = `${task.title}\n${taskStart ? `מתאריך: ${formatDate(taskStart)}` : ''}${taskEnd ? `\nעד תאריך: ${formatDate(taskEnd)}` : ''}${task.status ? `\nסטטוס: ${task.status}` : ''}`;

                return (
                  <Box
                    key={task._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      minHeight: 50
                    }}
                  >
                    {/* Task label */}
                    <Box sx={{ width: 220, pr: 2, flexShrink: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.title}
                      </Typography>
                      {taskStart && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(taskStart)}
                        </Typography>
                      )}
                    </Box>

                    {/* Timeline bar */}
                    <Paper
                      variant="outlined"
                      sx={{
                        flex: 1,
                        position: 'relative',
                        height: 40,
                        bgcolor: 'background.paper',
                        minHeight: 40
                      }}
                    >
                      <Tooltip title={tooltipText} arrow>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 6,
                            left: `${left}%`,
                            width: `${width}%`,
                            minWidth: 4,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: task.color || project.color || 'primary.main',
                            opacity: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              opacity: 0.85,
                              boxShadow: 2
                            }
                          }}
                        >
                          {width > 15 && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                px: 0.5
                              }}
                            >
                              {task.title}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    </Paper>
                  </Box>
                );
              })
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProjectGantt;





