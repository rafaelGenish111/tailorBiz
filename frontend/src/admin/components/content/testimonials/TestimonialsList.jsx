import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Rating,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useTestimonials, useDeleteTestimonial, useUpdateTestimonialStatus } from '../../../hooks/useTestimonials';
import TestimonialForm from './TestimonialForm';
import ConfirmDialog from '../../common/ConfirmDialog';
import { getImageUrl } from '../../../../utils/imageUtils';

const STATUS_LABELS = {
  pending: { label: 'ממתין לאישור', color: 'warning' },
  approved: { label: 'מאושר', color: 'success' },
  rejected: { label: 'נדחה', color: 'error' },
};

function TestimonialsList() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Queries
  const { data, isLoading } = useTestimonials({
    page: page + 1,
    limit: pageSize,
    search,
    status: statusFilter,
  });

  // Mutations
  const deleteMutation = useDeleteTestimonial();
  const updateStatusMutation = useUpdateTestimonialStatus();

  // Handlers
  const handleAdd = () => {
    setSelectedTestimonial(null);
    setFormOpen(true);
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormOpen(true);
  };

  const handleDeleteClick = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testimonialToDelete?._id) return;
    await deleteMutation.mutateAsync(testimonialToDelete._id);
    setDeleteDialogOpen(false);
    setTestimonialToDelete(null);
  };

  const handleStatusChange = async (id, status) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTestimonial(null);
  };

  // Columns
  const columns = [
    {
      field: 'image',
      headerName: 'תמונה',
      width: 80,
      renderCell: (params) => {
        const imageSrc = getImageUrl(params.value, null);

        return (
          <Avatar
            src={imageSrc || undefined}
            alt={params.row.clientName}
            sx={{ width: 50, height: 50 }}
          >
            {params.row.clientName?.charAt(0)}
          </Avatar>
        );
      },
    },
    {
      field: 'clientName',
      headerName: 'שם הלקוח',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'clientRole',
      headerName: 'תפקיד',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'companyName',
      headerName: 'חברה',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'rating',
      headerName: 'דירוג',
      width: 150,
      renderCell: (params) => <Rating value={params.value} readOnly size="small" />,
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 150,
      renderCell: (params) => {
        const status = STATUS_LABELS[params.value];
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      field: 'isVisible',
      headerName: 'מוצג באתר',
      width: 120,
      renderCell: (params) => (params.value ? <VisibilityIcon color="success" /> : null),
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('he-IL'),
    },
    {
      field: 'actions',
      headerName: 'פעולות',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.row.status === 'pending' && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={() => handleStatusChange(params.row._id, 'approved')}
                title="אשר"
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleStatusChange(params.row._id, 'rejected')}
                title="דחה"
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="ערוך"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="מחק"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1">
          ניהול המלצות
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          הוסף המלצה
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <TextField
            label="חיפוש"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: { xs: '1 1 100%', md: 1 } }}
            placeholder="חפש לפי שם, חברה או תוכן..."
          />
          <TextField
            select
            label="סטטוס"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            <MenuItem value="">הכל</MenuItem>
            <MenuItem value="pending">ממתין לאישור</MenuItem>
            <MenuItem value="approved">מאושר</MenuItem>
            <MenuItem value="rejected">נדחה</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Table */}
      {isMobile ? (
        <Stack spacing={1.5}>
          {(data?.data || []).map((t) => {
            const status = STATUS_LABELS[t.status] || { label: t.status, color: 'default' };
            const imageSrc = getImageUrl(t.image, null);

            return (
              <Paper key={t._id} variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                  <Avatar src={imageSrc} alt={t.clientName} sx={{ width: 54, height: 54, flexShrink: 0 }}>
                    {t.clientName?.charAt(0)}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} noWrap>
                          {t.clientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {t.companyName || '—'} {t.clientRole ? `• ${t.clientRole}` : ''}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip label={status.label} color={status.color} size="small" />
                        {t.isVisible ? <VisibilityIcon color="success" fontSize="small" /> : null}
                      </Box>
                    </Box>

                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Rating value={Number(t.rating) || 0} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('he-IL') : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
                  {t.status === 'pending' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleStatusChange(t._id, 'approved')}
                        sx={{ flex: '1 1 140px' }}
                      >
                        אשר
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleStatusChange(t._id, 'rejected')}
                        sx={{ flex: '1 1 140px' }}
                      >
                        דחה
                      </Button>
                    </>
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(t)}
                    sx={{ flex: '1 1 140px' }}
                  >
                    ערוך
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteClick(t)}
                    sx={{ flex: '1 1 140px' }}
                  >
                    מחק
                  </Button>
                </Stack>
              </Paper>
            );
          })}

          {!isLoading && (data?.data || []).length === 0 ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">אין המלצות להצגה.</Typography>
            </Paper>
          ) : null}
        </Stack>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.data || []}
            columns={columns}
            getRowId={(row) => row._id}
            loading={isLoading}
            pagination
            paginationMode="server"
            page={page}
            pageSize={pageSize}
            rowCount={data?.pagination?.total || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            sx={{
              width: '100%',
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Paper>
      )}

      {/* Form Dialog */}
      <TestimonialForm
        key={selectedTestimonial?._id || 'new-testimonial'}
        open={formOpen}
        onClose={handleFormClose}
        testimonial={selectedTestimonial}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת המלצה"
        content={`האם אתה בטוח שברצונך למחוק את ההמלצה של ${testimonialToDelete?.clientName}?`}
        confirmText="מחק"
        confirmColor="error"
      />
    </Box>
  );
}

export default TestimonialsList;

