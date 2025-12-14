import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { Timeline as TimelineIcon, Today as TodayIcon } from '@mui/icons-material';
import { useProjects } from '../admin/hooks/useTasks';
import { tasksAPI } from '../admin/utils/api';
import ProjectGantt from '../components/tasks/ProjectGantt';

const GanttView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [range, setRange] = useState({
    from: new Date().toISOString().slice(0, 10),
    to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const { data: projectsResponse } = useProjects();
  const projects = projectsResponse?.data || [];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksAPI.getGanttView({
        from: range.from,
        to: range.to,
        projectId: projectId || undefined
      });
      console.log('Gantt data received:', res.data);
      if (res.data?.success && res.data?.data) {
        const ganttData = res.data.data;
        console.log('Gantt data structure:', {
          hasProjects: !!ganttData.projects,
          projectsLength: ganttData.projects?.length || 0,
          projects: ganttData.projects,
          range: ganttData.range
        });
        setData(ganttData);
      } else {
        setError('לא התקבלו נתונים מהשרת');
        setData(null);
      }
    } catch (err) {
      console.error('Error loading Gantt data:', err);
      setError(err.response?.data?.message || 'שגיאה בטעינת הנתונים');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            לוח גאנט
          </Typography>
        </Box>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          type="date"
          label="מתאריך"
          value={range.from}
          onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ minWidth: { xs: '100%', md: 180 } }}
        />
        <TextField
          type="date"
          label="עד תאריך"
          value={range.to}
          onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ minWidth: { xs: '100%', md: 180 } }}
        />
        <TextField
          select
          label="פרויקט"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          fullWidth
          sx={{ minWidth: { xs: '100%', md: 220 } }}
        >
          <MenuItem value="">כל הפרויקטים</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          startIcon={<TodayIcon />}
          onClick={() =>
            setRange({
              from: new Date().toISOString().slice(0, 10),
              to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            })
          }
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          30 יום קדימה
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setRange({
              from: new Date().toISOString().slice(0, 10),
              to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            })
          }
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          שנה קדימה
        </Button>
        <Button
          variant="contained"
          onClick={loadData}
          disabled={loading}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          {loading ? <CircularProgress size={22} /> : 'רענן'}
        </Button>
      </Stack>

      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      {loading && !data ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            לחץ על "רענן" כדי לטעון את הנתונים
          </Typography>
        </Paper>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(data?.projects || []).length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                אין משימות לתצוגה בטווח התאריכים הנבחר.
              </Typography>
            </Paper>
          ) : (
            data.projects.map(({ project, tasks }) => (
              <Paper key={project._id} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tasks.length} משימות
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {tasks.slice(0, 4).map((task) => (
                    <Box
                      key={task._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {task.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: task.color || project.color || 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  ))}
                  {tasks.length > 4 && (
                    <Typography variant="caption" color="text.secondary">
                      ועוד {tasks.length - 4} משימות...
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))
          )}
        </Box>
      ) : (
        <>
          {data && (!data.projects || data.projects.length === 0) ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                אין משימות לתצוגה בטווח התאריכים הנבחר.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                נסה לשנות את טווח התאריכים או לבחור פרויקט אחר.
              </Typography>
            </Paper>
          ) : (
            <ProjectGantt projects={data?.projects || []} range={data?.range} />
          )}
        </>
      )}
    </Box>
  );
};

export default GanttView;


