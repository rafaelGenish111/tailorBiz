// frontend/src/components/clients/ClientList/ClientList.jsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useClients, useDeleteClient } from '../../../admin/hooks/useClients';

const ClientList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const { data: clientsData, isLoading } = useClients({
    page: page + 1,
    limit: rowsPerPage,
    search,
    status: statusFilter,
    leadSource: sourceFilter
  });

  const deleteClient = useDeleteClient();

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
      deleteClient.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      lead: 'info',
      contacted: 'primary',
      assessment_scheduled: 'warning',
      assessment_completed: 'warning',
      proposal_sent: 'secondary',
      negotiation: 'warning',
      won: 'success',
      lost: 'error',
      on_hold: 'default',
      active_client: 'success',
      in_development: 'info',
      completed: 'success',
      churned: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      lead: 'ליד חדש',
      contacted: 'יצירת קשר',
      assessment_scheduled: 'אפיון מתוזמן',
      assessment_completed: 'אפיון הושלם',
      proposal_sent: 'הצעה נשלחה',
      negotiation: 'משא ומתן',
      won: 'נסגר',
      lost: 'הפסד',
      on_hold: 'בהמתנה',
      active_client: 'לקוח פעיל',
      in_development: 'בפיתוח',
      completed: 'הושלם',
      churned: 'עזב'
    };
    return labels[status] || status;
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'default';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  const clients = clientsData?.data || [];
  const pagination = clientsData?.pagination || { totalItems: 0 };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">לקוחות</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/clients/new')}
        >
          לקוח חדש
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Search */}
          <TextField
            placeholder="חיפוש לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />

          {/* Status Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>סטטוס</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="סטטוס"
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="lead">ליד חדש</MenuItem>
              <MenuItem value="contacted">יצירת קשר</MenuItem>
              <MenuItem value="assessment_completed">אפיון הושלם</MenuItem>
              <MenuItem value="proposal_sent">הצעה נשלחה</MenuItem>
              <MenuItem value="negotiation">משא ומתן</MenuItem>
              <MenuItem value="won">נסגר</MenuItem>
              <MenuItem value="active_client">לקוח פעיל</MenuItem>
            </Select>
          </FormControl>

          {/* Source Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>מקור</InputLabel>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              label="מקור"
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="website_form">טופס אתר</MenuItem>
              <MenuItem value="referral">המלצה</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="google_ads">Google Ads</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>לקוח</TableCell>
                <TableCell>עסק</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>ציון</TableCell>
                <TableCell>מקור</TableCell>
                <TableCell>קשר אחרון</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/clients/${client._id}`)}
                >
                  {/* Client Info */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>
                        {client.personalInfo?.fullName?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {client.personalInfo?.fullName || 'ללא שם'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {client.personalInfo?.phone && (
                            <Tooltip title={client.personalInfo.phone}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </Tooltip>
                          )}
                          {client.personalInfo?.email && (
                            <Tooltip title={client.personalInfo.email}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </Tooltip>
                          )}
                          {client.personalInfo?.whatsappPhone && (
                            <Tooltip title="WhatsApp">
                              <WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Business */}
                  <TableCell>
                    <Typography variant="body2">
                      {client.businessInfo?.businessName || '-'}
                    </Typography>
                    {client.businessInfo?.businessType && (
                      <Typography variant="caption" color="text.secondary">
                        {client.businessInfo.businessType}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={getStatusLabel(client.status)}
                      color={getStatusColor(client.status)}
                      size="small"
                    />
                  </TableCell>

                  {/* Lead Score */}
                  <TableCell>
                    <Chip
                      label={client.leadScore || 0}
                      color={getLeadScoreColor(client.leadScore || 0)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {client.leadSource || '-'}
                    </Typography>
                  </TableCell>

                  {/* Last Contact */}
                  <TableCell>
                    {client.metadata?.lastContactedAt ? (
                      <Typography variant="body2" color="text.secondary">
                        {new Date(client.metadata.lastContactedAt).toLocaleDateString('he-IL')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/clients/${client._id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(client._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      לא נמצאו לקוחות
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={pagination.totalItems}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
        />
      </Card>
    </Box>
  );
};

export default ClientList;





