import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';

const STATUS_LABELS = {
  draft: 'טיוטה',
  sent: 'נשלח',
  paid: 'שולם',
  overdue: 'באיחור',
  cancelled: 'בוטל',
};

const STATUS_COLORS = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  overdue: 'error',
  cancelled: 'default',
};

const ProjectInvoicesTab = ({ projectId }) => {
  const { data: res, isLoading } = useQuery({
    queryKey: ['projectInvoices', projectId],
    queryFn: () => projectsAPI.getInvoices(projectId).then((r) => r.data),
  });

  const invoices = res?.data || [];

  if (isLoading) return <CircularProgress />;

  if (invoices.length === 0) {
    return (
      <Alert severity="info">
        אין חשבוניות לפרויקט זה. חשבוניות ייווצרו אוטומטית כשמסמנים תשלום כ-שולם.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>חשבוניות</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>מספר</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="center">סטטוס</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell>תיאור</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell>{inv.invoiceNumber || '-'}</TableCell>
                <TableCell align="right">₪{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={STATUS_LABELS[inv.status] || inv.status}
                    size="small"
                    color={STATUS_COLORS[inv.status] || 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('he-IL') : '-'}
                </TableCell>
                <TableCell>{inv.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectInvoicesTab;
