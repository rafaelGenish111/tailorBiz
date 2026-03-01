import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Alert, TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../utils/api';

const STAGE_LABELS = {
  lead: 'ליד',
  won: 'נסגר',
  lost: 'הפסד',
  active: 'פעיל',
  completed: 'הושלם',
  archived: 'בארכיון',
};

const STAGE_COLORS = {
  lead: 'info',
  won: 'success',
  lost: 'error',
  active: 'primary',
  completed: 'success',
  archived: 'default',
};

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['allProjects'],
    queryFn: () => projectsAPI.getAll({ limit: 200 }).then((r) => r.data),
  });

  const allProjects = res?.data || [];

  const filtered = allProjects.filter((p) => {
    if (stageFilter !== 'all' && p.stage !== stageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = (p.name || '').toLowerCase();
      const clientName = (p.clientId?.personalInfo?.fullName || '').toLowerCase();
      const businessName = (p.clientId?.businessInfo?.businessName || '').toLowerCase();
      if (!name.includes(s) && !clientName.includes(s) && !businessName.includes(s)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>שגיאה בטעינת פרויקטים</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3 }}>פרויקטים</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="חיפוש..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>שלב</InputLabel>
          <Select value={stageFilter} label="שלב" onChange={(e) => setStageFilter(e.target.value)}>
            <MenuItem value="all">הכל</MenuItem>
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {filtered.length} פרויקטים
        </Typography>
      </Box>

      {filtered.length === 0 ? (
        <Alert severity="info">אין פרויקטים מתאימים</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>שם הפרויקט</TableCell>
                <TableCell>לקוח</TableCell>
                <TableCell align="center">שלב</TableCell>
                <TableCell>סוג מוצר</TableCell>
                <TableCell align="right">שווי</TableCell>
                <TableCell align="right">יתרה</TableCell>
                <TableCell>תאריך</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/projects/${p._id}`)}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{p.name || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    {p.clientId?.personalInfo?.fullName || p.clientId?.businessInfo?.businessName || '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={STAGE_LABELS[p.stage] || p.stage}
                      size="small"
                      color={STAGE_COLORS[p.stage] || 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{p.productType || '-'}</TableCell>
                  <TableCell align="right">
                    ₪{(p.financials?.totalValue ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₪{(p.financials?.balance ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('he-IL') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProjectsListPage;
