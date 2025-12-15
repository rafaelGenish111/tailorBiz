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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAdminArticles, useCreateAdminArticle, useDeleteAdminArticle, usePublishAdminArticle } from '../../../admin/hooks/useCMS';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'כללי' },
  { value: 'automation', label: 'אוטומציות' },
  { value: 'crm', label: 'CRM' },
  { value: 'process', label: 'תהליכים' }
];

const ArticlesManager = () => {
  const navigate = useNavigate();
  const { data: resp } = useAdminArticles();
  const items = resp?.data || [];

  const createArticle = useCreateAdminArticle();
  const publishArticle = usePublishAdminArticle();
  const deleteArticle = useDeleteAdminArticle();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    slug: '',
    title: '',
    excerpt: '',
    category: 'general'
  });

  const handleCreate = async () => {
    const res = await createArticle.mutateAsync({
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      draft: { blocks: [] }
    });
    const id = res?.data?.data?._id;
    setCreateOpen(false);
    if (id) navigate(`/admin/cms/articles/${id}`);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>ניהול מאמרים</Typography>
          <Typography variant="body2" color="text.secondary">מאמרים מובנים (Blocks) + טיוטה/פרסום</Typography>
        </Box>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          מאמר חדש
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>קטגוריה</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell align="left">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.slug}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>{a.isPublished ? 'פורסם' : 'טיוטה'}</TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/admin/cms/articles/${a._id}`)}>
                      ערוך
                    </Button>
                    {!a.isPublished ? (
                      <Button size="small" variant="contained" color="success" onClick={() => publishArticle.mutateAsync(a._id)}>
                        פרסם
                      </Button>
                    ) : null}
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        if (window.confirm('למחוק את המאמר?')) deleteArticle.mutateAsync(a._id);
                      }}
                    >
                      מחק
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>אין מאמרים עדיין.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>מאמר חדש</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} fullWidth />
            <TextField label="כותרת" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
            <TextField label="תקציר" value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} fullWidth multiline minRows={3} />
            <TextField select label="קטגוריה" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} fullWidth>
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createArticle.isPending}>
            צור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticlesManager;

