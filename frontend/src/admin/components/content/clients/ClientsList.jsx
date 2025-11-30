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
  Email as EmailIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useClients, useDeleteClient, useClient } from '../../../hooks/useClients';
import ConfirmDialog from '../../common/ConfirmDialog';
import ClientForm from './ClientForm';
import ClientDetail from './ClientDetail';

const STATUS_LABELS = {
  lead: { label: 'ליד חדש', color: 'info' },
  contacted: { label: 'יצרנו קשר', color: 'primary' },
  assessment_scheduled: { label: 'פגישת אפיון נקבעה', color: 'warning' },
  assessment_completed: { label: 'אפיון הושלם', color: 'info' },
  proposal_sent: { label: 'הצעת מחיר נשלחה', color: 'warning' },
  negotiation: { label: 'משא ומתן', color: 'warning' },
  won: { label: 'נסגר', color: 'success' },
  lost: { label: 'הפסדנו', color: 'error' },
  on_hold: { label: 'בהמתנה', color: 'default' },
  active_client: { label: 'לקוח פעיל', color: 'success' },
  in_development: { label: 'בפיתוח', color: 'info' },
  completed: { label: 'הושלם', color: 'success' },
  churned: { label: 'עזב', color: 'error' },
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

const LEAD_STATUSES = ['lead', 'contacted', 'assessment_scheduled', 'assessment_completed', 'proposal_sent', 'negotiation', 'on_hold', 'lost'];
const CLIENT_STATUSES = ['won', 'active_client', 'in_development', 'completed', 'churned'];

function ClientsList({ viewMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientToView, setClientToView] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

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

  // Load full client details when viewing
  const { data: fullClientData } = useClient(clientToView);

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
    setClientToView(client._id);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setClientToView(null);
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
      flex: 1,
      minWidth: 260,
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
      field: 'email',
      headerName: 'אימייל',
      width: 200,
      renderCell: (params) => {
        const email = params.row.personalInfo?.email;
        return email ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </Typography>
          </Box>
        ) : null;
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
      field: 'status',
      headerName: 'סטטוס',
      width: 180,
      renderCell: (params) => {
        const status = STATUS_LABELS[params.value] || { label: params.value, color: 'default' };
        return <Chip label={status.label} color={status.color} size="small" />;
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
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    {
      field: 'actions',
      headerName: 'פעולות',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(params.row)}
            title="צפה"
          >
            <VisibilityIcon />
          </IconButton>
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
              const email = client.personalInfo?.email;
              const statusInfo = STATUS_LABELS[client.status] || { label: client.status, color: 'default' };
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
                      {statusInfo.label && (
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                      )}
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

                    {(phone || email) && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={0.5}>
                          {phone && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">{phone}</Typography>
                            </Stack>
                          )}
                          {email && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmailIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                              >
                                {email}
                              </Typography>
                            </Stack>
                          )}
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

      {/* Client Detail Dialog */}
      <ClientDetail
        open={detailOpen}
        onClose={handleDetailClose}
        client={fullClientData?.data || null}
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
    </Box>
  );
}

export default ClientsList;

