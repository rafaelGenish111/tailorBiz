import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  CircularProgress
} from '@mui/material';
import { Timeline as TimelineIcon, Today as TodayIcon } from '@mui/icons-material';
import { useProjects } from '../admin/hooks/useTasks';
import { tasksAPI } from '../admin/utils/api';
import ProjectGantt from '../components/tasks/ProjectGantt';

const GanttView = () => {
  const [range, setRange] = useState({
    from: new Date().toISOString().slice(0, 10),
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const { data: projectsResponse } = useProjects();
  const projects = projectsResponse?.data || [];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.getGanttView({
        from: range.from,
        to: range.to,
        projectId: projectId || undefined
      });
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            לוח גאנט
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          type="date"
          label="מתאריך"
          value={range.from}
          onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="עד תאריך"
          value={range.to}
          onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="פרויקט"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          sx={{ minWidth: 220 }}
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
        >
          30 יום קדימה
        </Button>
        <Button variant="contained" onClick={loadData} disabled={loading}>
          {loading ? <CircularProgress size={22} /> : 'רענן'}
        </Button>
      </Stack>

      {loading && !data ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProjectGantt projects={data?.projects || []} range={data?.range} />
      )}
    </Box>
  );
};

export default GanttView;


