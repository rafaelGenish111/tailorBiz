import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../admin/hooks/useTasks';
import ProjectModal from '../../components/projects/ProjectModal';

const STATUS_OPTIONS = [
  { value: 'active', label: 'פעיל' },
  { value: 'on_hold', label: 'בהשהיה' },
  { value: 'completed', label: 'הושלם' },
  { value: 'archived', label: 'בארכיון' }
];

const Projects = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const { data: projectsResponse } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const projectsRaw = projectsResponse?.data || [];
  
  // Add mock goal data for "5 לקוחות משלמים" project
  const projects = projectsRaw.map((project) => {
    // Mock goal data for projects with "5 לקוחות" or "לקוחות משלמים" in the name
    if (project.name && (project.name.includes('5 לקוחות') || project.name.includes('לקוחות משלמים'))) {
      return {
        ...project,
        goal: {
          current: 2,
          target: 5,
          unit: 'לקוחות'
        }
      };
    }
    // Return project as-is if it already has goal data, or null if no goal
    return project;
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    color: '#1976d2'
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      status: 'active',
      color: '#1976d2'
    });
    setDialogOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      color: project.color || '#1976d2'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = { ...form };
    if (editing) {
      await updateProject.mutateAsync({ id: editing._id, data: payload });
    } else {
      await createProject.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (project) => {
    if (!window.confirm('האם למחוק את הפרויקט וכל המשימות הקשורות אליו?')) return;
    await deleteProject.mutateAsync(project._id);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setProjectModalOpen(false);
    setSelectedProject(null);
  };

  // Helper function to get goal progress percentage
  const getGoalProgress = (goal) => {
    if (!goal || goal.target === 0) return 0;
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  // Goal Progress Bar Component
  const GoalProgressBar = ({ goal }) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const progress = getGoalProgress(goal);
    
    useEffect(() => {
      // Animate progress bar on mount
      const timer = setTimeout(() => {
        setAnimatedWidth(progress);
      }, 100);
      return () => clearTimeout(timer);
    }, [progress]);

    if (!goal) return null;

    return (
      <Box
        sx={{
          px: 3,
          pb: 2,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
            }}
          >
            {`${goal.current}/${goal.target} ${goal.unit || ''} (${Math.round(progress)}%)`}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: '8px',
            bgcolor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${animatedWidth}%`,
              background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
              borderRadius: '9999px',
              transition: 'width 0.8s ease-out',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          />
        </Box>
      </Box>
    );
  };

  const getStatusChip = (status) => {
    const config = {
      active: { 
        label: 'פעיל', 
        bgcolor: '#d1fae5', 
        color: '#065f46',
        borderColor: '#a7f3d0',
      },
      on_hold: { 
        label: 'בהשהיה', 
        bgcolor: '#fef3c7', 
        color: '#92400e',
        borderColor: '#fde68a',
      },
      completed: { 
        label: 'הושלם', 
        bgcolor: '#dbeafe', 
        color: '#1e40af',
        borderColor: '#bfdbfe',
      },
      archived: { 
        label: 'בארכיון', 
        bgcolor: '#f3f4f6', 
        color: '#374151',
        borderColor: '#e5e7eb',
      }
    }[status] || { 
      label: status, 
      bgcolor: '#f3f4f6', 
      color: '#374151',
      borderColor: '#e5e7eb',
    };
    
    return (
      <Chip 
        label={config.label} 
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          color: config.color,
          border: `1px solid ${config.borderColor}`,
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 600,
          '& .MuiChip-label': {
            px: 1.5,
          },
        }}
      />
    );
  };

  return (
    <Box 
      sx={{ 
        pb: 4, 
        width: '100%',
        maxWidth: '100%',
        bgcolor: '#f8f9fa',
      }}
    >
      {/* Header Area */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            gutterBottom 
            sx={{ 
              color: '#16191f',
              fontSize: { xs: '1.5rem', md: '2rem' },
              letterSpacing: '-0.02em',
            }}
          >
            פרויקטים
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b7280',
              fontSize: '0.95rem',
              fontWeight: 400,
            }}
          >
            ניהול פרויקטים ומשימות חוצות יומן ולוח משימות
          </Typography>
        </Box>
        <Box
          sx={{
            mt: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            display: 'flex',
            justifyContent: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ 
              width: { xs: '100%', md: 'auto' },
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            פרויקט חדש
          </Button>
        </Box>
      </Box>

      {/* Projects Grid - Full Width CSS Grid */}
      {projects.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 12,
            bgcolor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#6b7280',
              fontWeight: 500,
            }}
          >
            אין פרויקטים. לחץ על "פרויקט חדש" כדי להתחיל.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            width: '100%',
          }}
        >
          {projects.map((project) => (
            <Card
              key={project._id}
              onClick={(e) => {
                e.preventDefault();
                handleProjectClick(project);
              }}
              elevation={0}
              sx={{
                borderTop: `4px solid ${project.color || '#6366f1'}`,
                width: '100%',
                minHeight: '280px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease-in-out',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  borderColor: '#d1d5db',
                }
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  p: 3,
                  pb: 2,
                  flexShrink: 0,
                }}
              >
                <Stack 
                  direction="row" 
                  spacing={1.5} 
                  alignItems="flex-start" 
                  sx={{ 
                    minWidth: 0,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: '#16191f',
                      letterSpacing: '-0.01em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                    }}
                  >
                    {project.name}
                  </Typography>
                  <Box sx={{ flexShrink: 0 }}>
                    {getStatusChip(project.status)}
                  </Box>
                </Stack>
                {project.startDate && project.endDate && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      display: 'block',
                      mt: 1,
                    }}
                  >
                    {`${new Date(project.startDate).toLocaleDateString('he-IL')} - ${new Date(
                      project.endDate
                    ).toLocaleDateString('he-IL')}`}
                  </Typography>
                )}
              </Box>

              {/* Description Section - Middle with flex grow */}
              <Box
                sx={{
                  px: 3,
                  pb: 2,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                {project.description ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1,
                    }}
                  >
                    {project.description}
                  </Typography>
                ) : (
                  <Box sx={{ flexGrow: 1 }} />
                )}
              </Box>

              {/* Goal Progress Bar - Between Description and Footer */}
              {project.goal && <GoalProgressBar goal={project.goal} />}

              {/* Footer Section - Pinned to bottom */}
              <Box
                sx={{
                  px: 3,
                  pb: 3,
                  pt: 2,
                  borderTop: '1px solid #f3f4f6',
                  flexShrink: 0,
                  mt: 'auto',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ flexShrink: 0 }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(project);
                    }}
                    sx={{
                      color: '#6366f1',
                      bgcolor: '#eef2ff',
                      '&:hover': {
                        bgcolor: '#e0e7ff',
                        color: '#4f46e5',
                      },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project);
                    }}
                    sx={{
                      color: '#ef4444',
                      bgcolor: '#fee2e2',
                      '&:hover': {
                        bgcolor: '#fecaca',
                        color: '#dc2626',
                      },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'עריכת פרויקט' : 'פרויקט חדש'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם פרויקט"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="תיאור"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              select
              label="סטטוס"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              fullWidth
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="צבע (HEX)"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSubmit}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* מודאל פרויקט */}
      <ProjectModal
        open={projectModalOpen}
        onClose={handleCloseProjectModal}
        project={selectedProject}
      />
    </Box>
  );
};

export default Projects;


