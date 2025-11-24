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
      renderCell: (params) => (
        <Avatar
          src={params.value ? `http://localhost:5000${params.value}` : undefined}
          alt={params.row.clientName}
          sx={{ width: 50, height: 50 }}
        >
          {params.row.clientName?.charAt(0)}
        </Avatar>
      ),
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          ניהול המלצות
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          הוסף המלצה
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="חיפוש"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            placeholder="חפש לפי שם, חברה או תוכן..."
          />
          <TextField
            select
            label="סטטוס"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">הכל</MenuItem>
            <MenuItem value="pending">ממתין לאישור</MenuItem>
            <MenuItem value="approved">מאושר</MenuItem>
            <MenuItem value="rejected">נדחה</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ height: 600 }}>
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
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      </Paper>

      {/* Form Dialog */}
      <TestimonialForm open={formOpen} onClose={handleFormClose} testimonial={selectedTestimonial} />

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

