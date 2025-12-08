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

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: 800 }}>
        {/* Header scale */}
        <Box sx={{ display: 'flex', mb: 1, pl: 24 }}>
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

        {/* Rows */}
        {projects.map(({ project, tasks }) => (
          <Box
            key={project._id}
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              mb: 1
            }}
          >
            {/* Project label */}
            <Box sx={{ width: 220, pr: 2 }}>
              <Typography variant="subtitle2" noWrap>
                {project.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tasks.length} משימות
              </Typography>
            </Box>

            {/* Timeline */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                position: 'relative',
                height: 40,
                bgcolor: 'background.paper'
              }}
            >
              {tasks.map((task) => {
                const { left, width } = getOffsetAndWidth(task);
                return (
                  <Tooltip
                    key={task._id}
                    title={`${task.title} (${new Date(task.startDate || task.endDate).toLocaleDateString(
                      'he-IL'
                    )})`}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: 4,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: task.color || project.color || 'primary.main',
                        opacity: 0.9
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProjectGantt;





