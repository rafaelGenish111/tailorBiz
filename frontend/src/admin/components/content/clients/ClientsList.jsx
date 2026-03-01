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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useClients, useDeleteClient, useUpdateClient, useConvertLead } from '../../../hooks/useClients';
import ConfirmDialog from '../../common/ConfirmDialog';
import ConvertLeadDialog from '../../common/ConvertLeadDialog';
import ClientForm from './ClientForm';

const STATUS_LABELS = {
  new_lead: { label: 'ליד חדש', bg: '#1976d2', text: '#fff' },
  contacted: { label: 'יצרנו קשר', bg: '#7b1fa2', text: '#fff' },
  engaged: { label: 'מעורבות', bg: '#e65100', text: '#fff' },
  meeting_set: { label: 'פגישה נקבעה', bg: '#f57c00', text: '#fff' },
  proposal_sent: { label: 'הצעה נשלחה', bg: '#512da8', text: '#fff' },
  won: { label: 'נסגר', bg: '#2e7d32', text: '#fff' },
  completed: { label: 'הסתיים', bg: '#455a64', text: '#fff' },
  lost: { label: 'הפסדנו', bg: '#c62828', text: '#fff' },
};

const LEAD_SOURCE_LABELS = {
  whatsapp: 'WhatsApp',
  website_form: 'טופס באתר',
  referral: 'המלצה',
  cold_call: 'פנייה יזומה',
  social_media: 'רשתות חברתיות',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  other: 'אחר',
};

const LEAD_STATUSES = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'];
const CLIENT_STATUSES = ['won', 'completed'];

function ClientsList({ viewMode }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [clientToConvert, setClientToConvert] = useState(null);

  const effectiveStatusFilter = statusFilter || (viewMode === 'leads' ? LEAD_STATUSES.join(',') : viewMode === 'clients' ? CLIENT_STATUSES.join(',') : '');

  // Queries
  const { data, isLoading } = useClients({
    page: page + 1,
    limit: pageSize,
    search,
    status: effectiveStatusFilter,
  });

  // Mutations
  const deleteMutation = useDeleteClient();
  const updateClientMutation = useUpdateClient();
  const convertLeadMutation = useConvertLead();

  // Handlers
  const handleAdd = () => {
    setSelectedClient(null);
    setFormOpen(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedClient(null);
  };

  const handleView = (client) => {
    navigate(`/admin/clients/${client._id}`);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(clientToDelete._id);
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleStatusChange = (client, newStatus) => {
    if (newStatus === 'won') {
      setClientToConvert(client);
      setConvertDialogOpen(true);
    } else {
      updateClientMutation.mutate({ id: client._id, data: { status: newStatus } });
    }
  };

  const handleConvertConfirm = (formData) => {
    convertLeadMutation.mutate(
      { clientId: clientToConvert._id, data: formData },
      {
        onSuccess: () => {
          setConvertDialogOpen(false);
          navigate(`/admin/clients/${clientToConvert._id}`);
          setClientToConvert(null);
        },
      }
    );
  };

  const allowedStatuses = viewMode === 'leads' ? LEAD_STATUSES : viewMode === 'clients' ? CLIENT_STATUSES : Object.keys(STATUS_LABELS);

  const getPageTitle = () => {
    if (viewMode === 'leads') return 'ניהול לידים';
    if (viewMode === 'clients') return 'ניהול לקוחות';
    return 'ניהול לקוחות ולידים';
  };

  // Columns (לטבלה בדסקטופ)
  const columns = [
    {
      field: 'personalInfo',
      headerName: 'לקוח',
      width: 250,
      renderCell: (params) => {
        const client = params.row;
        const fullName = client.personalInfo?.fullName || 'ללא שם';
        const businessName = client.businessInfo?.businessName || 'ללא שם עסק';
        const initials = fullName
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase() || '?';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {`${fullName} – ${businessName}`}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'leadSource',
      headerName: 'מקור ליד',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={LEAD_SOURCE_LABELS[params.value] || params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'phone',
      headerName: 'טלפון',
      width: 150,
      renderCell: (params) => {
        const phone = params.row.personalInfo?.phone;
        return phone ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{phone}</Typography>
          </Box>
        ) : null;
      },
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 180,
      renderCell: (params) => {
        const currentStatus = params.value;
        return (
          <TextField
            select
            size="small"
            value={currentStatus}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              handleStatusChange(params.row, e.target.value);
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{ minWidth: 130 }}
          >
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <MenuItem key={key} value={key}>
                <Chip label={val.label} size="small" sx={{ cursor: 'pointer', bgcolor: val.bg, color: val.text }} />
              </MenuItem>
            ))}
          </TextField>
        );
      },
    },
    {
      field: 'leadScore',
      headerName: 'ציון ליד',
      width: 120,
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'default';
        return (
          <Chip
            label={score}
            color={color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'פעולות',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${params.row._id}`); }}
            sx={{ minWidth: 70 }}
          >
            פתח
          </Button>
          <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }} title="ערוך">
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteClick(params.row); }} title="מחק">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rows = data?.data || [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
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
        <Typography variant="h4" component="h1">
          {getPageTitle()}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          הוסף {viewMode === 'clients' ? 'לקוח' : 'ליד'} חדש
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <TextField
            label="חיפוש"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
            placeholder="חפש לפי שם, חברה, טלפון או אימייל..."
          />
          <TextField
            select
            label="סטטוס"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          >
            <MenuItem value="">הכל</MenuItem>
            {allowedStatuses.map((value) => {
              const labelInfo = STATUS_LABELS[value];
              if (!labelInfo) return null;
              return (
                <MenuItem key={value} value={value}>
                  {labelInfo.label}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
      </Paper>

      {/* Table / Mobile Cards */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              טוען...
            </Typography>
          ) : rows.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                אין נתונים להצגה.
              </Typography>
            </Paper>
          ) : (
            rows.map((client) => {
              const fullName = client.personalInfo?.fullName || 'ללא שם';
              const businessName = client.businessInfo?.businessName || 'ללא שם עסק';
              const phone = client.personalInfo?.phone;
              const leadSourceLabel = LEAD_SOURCE_LABELS[client.leadSource] || client.leadSource;

              return (
                <Card key={client._id} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {fullName.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {businessName}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" color="primary" onClick={() => handleView(client)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                      <TextField
                        select
                        size="small"
                        value={client.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(client, e.target.value)}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{ minWidth: 120 }}
                      >
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <MenuItem key={key} value={key}>
                            <Chip label={val.label} size="small" sx={{ cursor: 'pointer', bgcolor: val.bg, color: val.text }} />
                          </MenuItem>
                        ))}
                      </TextField>
                      {typeof client.leadScore === 'number' && (
                        <Chip
                          label={`ציון: ${client.leadScore}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {leadSourceLabel && (
                        <Chip
                          label={`מקור: ${leadSourceLabel}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    {phone && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{phone}</Typography>
                        </Stack>
                      </>
                    )}

                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(client)}
                        aria-label="ערוך"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(client)}
                        aria-label="מחק"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      ) : (
        <Paper sx={{ height: 600, width: '100%', overflowX: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={isLoading}
            pagination
            paginationMode="server"
            page={page}
            pageSize={pageSize}
            rowCount={data?.pagination?.totalItems || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            onRowClick={(params) => handleView(params.row)}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Paper>
      )}

      {/* Form Dialog */}
      <ClientForm
        open={formOpen}
        onClose={handleFormClose}
        client={selectedClient}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת לקוח"
        content={`האם אתה בטוח שברצונך למחוק את הלקוח ${clientToDelete?.personalInfo?.fullName}?`}
        confirmText="מחק"
        confirmColor="error"
      />

      {/* Convert Lead Dialog */}
      <ConvertLeadDialog
        open={convertDialogOpen}
        onClose={() => { setConvertDialogOpen(false); setClientToConvert(null); }}
        onConfirm={handleConvertConfirm}
        clientName={clientToConvert?.personalInfo?.fullName}
        isPending={convertLeadMutation.isPending}
      />
    </Box>
  );
}

export default ClientsList;

