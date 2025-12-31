import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import {
  useAdminSiteClients,
  useCreateAdminSiteClient,
  useDeleteAdminSiteClient,
  useUpdateAdminSiteClient,
  useUploadImage
} from '../../../admin/hooks/useCMS';

const ClientsManager = () => {
  const { data: resp } = useAdminSiteClients();
  const clients = resp?.data || [];

  const createClient = useCreateAdminSiteClient();
  const updateClient = useUpdateAdminSiteClient();
  const deleteClient = useDeleteAdminSiteClient();
  const uploadImage = useUploadImage();

  const [form, setForm] = React.useState({
    _id: null,
    name: '',
    websiteUrl: '',
    projectTitle: '',
    description: '',
    isPublished: true,
    logo: null
  });

  const handleUpload = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'tailorbiz/site/clients');
    const res = await uploadImage.mutateAsync(fd);
    return res?.data?.data;
  };

  const handleSubmit = async () => {
    if (!form.logo?.url) return;

    if (form._id) {
      // Update
      await updateClient.mutateAsync({
        id: form._id,
        data: {
          name: form.name,
          websiteUrl: form.websiteUrl,
          projectTitle: form.projectTitle,
          description: form.description,
          isPublished: form.isPublished,
          logo: form.logo
        }
      });
    } else {
      // Create
      await createClient.mutateAsync({
        name: form.name,
        websiteUrl: form.websiteUrl,
        projectTitle: form.projectTitle,
        description: form.description,
        isPublished: form.isPublished,
        logo: form.logo
      });
    }
    setForm({ _id: null, name: '', websiteUrl: '', projectTitle: '', description: '', isPublished: true, logo: null });
  };

  const handleEdit = (client) => {
    setForm({
      _id: client._id,
      name: client.name,
      websiteUrl: client.websiteUrl || '',
      projectTitle: client.projectTitle || '',
      description: client.description || '',
      isPublished: client.isPublished,
      logo: client.logo
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const move = async (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= clients.length) return;
    const ids = [...clients].map((c) => c._id);
    const tmp = ids[index];
    ids[index] = ids[to];
    ids[to] = tmp;
    // backend endpoint exists, but we keep minimal: update order by updating each doc order locally via update calls
    // We'll call updateClient sequentially to set order based on new index
    await Promise.all(ids.map((id, idx) => updateClient.mutateAsync({ id, data: { order: idx } })));
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>ניהול לקוחות (אתר)</Typography>
        <Typography variant="body2" color="text.secondary">לוגואים לדף \"לקוחות שלנו\" ולרולר בדף הבית</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Typography fontWeight={800} sx={{ mb: 1.5 }}>{form._id ? 'עריכת לקוח' : 'הוסף לקוח'}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="שם הלקוח" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="קישור לאתר" value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="כותרת הפרויקט (למשל: מערכת CRM)" value={form.projectTitle} onChange={(e) => setForm((p) => ({ ...p, projectTitle: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="תיאור הפרויקט (יופיע בכרטיס)"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
              <Button variant="outlined" component="label">
                {form.logo?.url ? 'החלף לוגו' : 'העלה לוגו'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const up = await handleUpload(file);
                    setForm((p) => ({ ...p, logo: { url: up.url, publicId: up.publicId, alt: p.name } }));
                  }}
                />
              </Button>
              {form.logo?.url ? <Box component="img" src={form.logo.url} alt="" sx={{ height: 44 }} /> : null}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={form.isPublished} onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))} />}
              label="מפורסם"
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {form._id && (
              <Button variant="text" onClick={() => setForm({ _id: null, name: '', websiteUrl: '', projectTitle: '', description: '', isPublished: true, logo: null })}>
                ביטול עריכה
              </Button>
            )}
            <Button variant="contained" onClick={handleSubmit} disabled={createClient.isPending || updateClient.isPending || !form.logo?.url}>
              {form._id ? 'עדכן לקוח' : 'הוסף לקוח'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {clients.map((c, idx) => (
          <Grid item xs={12} md={6} key={c._id}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box component="img" src={c.logo?.url} alt={c.logo?.alt || c.name} sx={{ height: 44, maxWidth: 120 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.websiteUrl || '—'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={Boolean(c.isPublished)}
                      onChange={(e) => updateClient.mutateAsync({ id: c._id, data: { isPublished: e.target.checked } })}
                    />
                  }
                  label=""
                />
                <IconButton size="small" onClick={() => move(idx, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => move(idx, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleEdit(c)}><EditIcon fontSize="small" /></IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    if (window.confirm('למחוק לקוח זה?')) deleteClient.mutateAsync(c._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClientsManager;

