import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  MenuItem,
  Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import api, { clientAPI } from '../utils/api';
import { Close as CloseIcon } from '@mui/icons-material';

const PROSPECT_STATUSES = [
  { value: 'pending', label: 'ממתין' },
  { value: 'contacted', label: 'נוצר קשר' },
  { value: 'converted_to_lead', label: 'הומר לליד' },
  { value: 'discarded', label: 'נפסל' },
];

const countPending = (pool) => (pool?.prospects || []).filter((p) => p.status === 'pending').length;

const HuntingPoolsPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [pools, setPools] = React.useState([]);

  // Create dialog (כמו מאמרים)
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({ sectorName: '', description: '' });
  const [creating, setCreating] = React.useState(false);

  // Detail dialog
  const [activePool, setActivePool] = React.useState(null);
  const [quickRow, setQuickRow] = React.useState({ companyName: '', contactPerson: '', phone: '', notes: '' });
  const [updatingProspectId, setUpdatingProspectId] = React.useState(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hunting-pools');
      setPools(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בטעינת Hunting Pools');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleOpenCreate = () => {
    setForm({ sectorName: '', description: '' });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const sectorName = (form.sectorName || '').trim();
    if (!sectorName) {
      toast.error('חובה למלא Sector Name');
      return;
    }
    try {
      setCreating(true);
      const res = await api.post('/hunting-pools', { sectorName, description: form.description || '' });
      const created = res?.data?.data;
      setCreateOpen(false);
      toast.success('Pool נוצר');
      setPools((prev) => {
        const next = [created, ...prev].filter(Boolean);
        next.sort((a, b) => String(a.sectorName || '').localeCompare(String(b.sectorName || ''), 'he'));
        return next;
      });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה ביצירת Pool');
    } finally {
      setCreating(false);
    }
  };

  const openPool = (pool) => {
    setActivePool(pool);
    setQuickRow({ companyName: '', contactPerson: '', phone: '', notes: '' });
  };

  const syncPoolInState = (updatedPool) => {
    setPools((prev) => prev.map((p) => (p._id === updatedPool._id ? updatedPool : p)));
    setActivePool(updatedPool);
  };

  const addProspect = async () => {
    if (!activePool?._id) return;
    const companyName = (quickRow.companyName || '').trim();
    if (!companyName) return;

    try {
      const res = await api.post(`/hunting-pools/${activePool._id}/prospects`, {
        companyName,
        contactPerson: quickRow.contactPerson || '',
        phone: quickRow.phone || '',
        notes: quickRow.notes || '',
      });
      syncPoolInState(res.data.data);
      setQuickRow({ companyName: '', contactPerson: '', phone: '', notes: '' });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בהוספת Prospect');
    }
  };

  const updateProspect = async (prospectId, patch) => {
    if (!activePool?._id) return;
    try {
      setUpdatingProspectId(prospectId);
      const res = await api.patch(`/hunting-pools/${activePool._id}/prospects/${prospectId}`, patch);
      syncPoolInState(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בעדכון Prospect');
    } finally {
      setUpdatingProspectId(null);
    }
  };

  const convertToLead = async (prospect) => {
    if (!activePool?._id) return;
    const companyName = (prospect.companyName || '').trim();
    const phone = (prospect.phone || '').trim();
    const contactPerson = (prospect.contactPerson || '').trim();

    if (!companyName) return toast.error('חסר Company Name');
    if (!phone) return toast.error('חסר טלפון');

    try {
      setUpdatingProspectId(prospect._id);

      await clientAPI.create({
        personalInfo: {
          fullName: companyName, // דרישה: companyName -> Client name
          phone,
          whatsappPhone: phone,
          preferredContactMethod: 'phone',
        },
        businessInfo: {
          businessName: companyName,
        },
        generalNotes: contactPerson ? `איש קשר: ${contactPerson}` : '',
        leadSource: 'cold_call',
        status: 'new_lead',
        tags: ['hunting_pool', activePool.sectorName || ''],
      });

      await updateProspect(prospect._id, { status: 'converted_to_lead' });
      toast.success('הומר לליד במערכת');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בהמרה לליד');
    } finally {
      setUpdatingProspectId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Header (כמו מאמרים) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Hunting Pools</Typography>
          <Typography variant="body2" color="text.secondary">מאגר יעדים לפי סקטור לפני יצירת ליד</Typography>
        </Box>
        <Button variant="contained" onClick={handleOpenCreate}>
          צור Pool חדש
        </Button>
      </Box>

      {/* Main table (כמו מאמרים) */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>סקטור</TableCell>
                <TableCell>ממתינים</TableCell>
                <TableCell>סה״כ חברות</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell align="left">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pools.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.sectorName}</TableCell>
                  <TableCell><Chip size="small" label={countPending(p)} /></TableCell>
                  <TableCell>{(p.prospects || []).length}</TableCell>
                  <TableCell sx={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.description || '—'}
                  </TableCell>
                  <TableCell align="left">
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => openPool(p)}>
                        פתח
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && pools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>אין Pools עדיין.</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>טוען...</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create dialog (זהה להתנהגות דף מאמרים) */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>יצירת Pool חדש</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם הסקטור"
              value={form.sectorName}
              onChange={(e) => setForm((prev) => ({ ...prev, sectorName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="תיאור"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            צור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail dialog (טבלה + Quick Add, גם בסגנון מאמרים: Dialog קטן/גדול) */}
      <Dialog open={!!activePool} onClose={() => setActivePool(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography fontWeight={800}>{activePool?.sectorName}</Typography>
            <Typography variant="body2" color="text.secondary">{activePool?.description || '—'}</Typography>
          </Box>
          <IconButton onClick={() => setActivePool(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Quick Add row (Excel-like) */}
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="left">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <TextField
                          value={quickRow.companyName}
                          onChange={(e) => setQuickRow((p) => ({ ...p, companyName: e.target.value }))}
                          size="small"
                          placeholder="שם חברה (Enter להוספה)"
                          fullWidth
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addProspect(); }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={quickRow.contactPerson}
                          onChange={(e) => setQuickRow((p) => ({ ...p, contactPerson: e.target.value }))}
                          size="small"
                          placeholder="איש קשר"
                          fullWidth
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addProspect(); }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={quickRow.phone}
                          onChange={(e) => setQuickRow((p) => ({ ...p, phone: e.target.value }))}
                          size="small"
                          placeholder="טלפון"
                          fullWidth
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addProspect(); }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={quickRow.notes}
                          onChange={(e) => setQuickRow((p) => ({ ...p, notes: e.target.value }))}
                          size="small"
                          placeholder="הערות"
                          fullWidth
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addProspect(); }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label="pending" />
                      </TableCell>
                      <TableCell align="left">
                        <Button size="small" variant="contained" onClick={addProspect} disabled={!quickRow.companyName.trim()}>
                          הוסף
                        </Button>
                      </TableCell>
                    </TableRow>

                    {(activePool?.prospects || []).map((pr) => (
                      <TableRow key={pr._id} hover>
                        <TableCell>{pr.companyName}</TableCell>
                        <TableCell>{pr.contactPerson}</TableCell>
                        <TableCell>{pr.phone}</TableCell>
                        <TableCell>{pr.notes}</TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={pr.status}
                            onChange={(e) => updateProspect(pr._id, { status: e.target.value })}
                            disabled={updatingProspectId === pr._id}
                          >
                            {PROSPECT_STATUSES.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell align="left">
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => updateProspect(pr._id, { status: 'contacted' })}
                              disabled={updatingProspectId === pr._id}
                            >
                              Contacted
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => convertToLead(pr)}
                              disabled={pr.status === 'converted_to_lead' || updatingProspectId === pr._id}
                            >
                              Convert to Lead
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {(activePool?.prospects || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" sx={{ py: 2 }}>אין חברות עדיין.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Divider />
            <Button variant="outlined" onClick={refresh}>רענן רשימה</Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivePool(null)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HuntingPoolsPage;
