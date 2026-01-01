import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useAdminArticle, useUpdateAdminArticle, usePublishAdminArticle, useUploadImage } from '../../../admin/hooks/useCMS';
import ArticleBlocksRenderer from '../../../components/articles/ArticleBlocksRenderer';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'כללי' },
  { value: 'automation', label: 'אוטומציות' },
  { value: 'crm', label: 'CRM' },
  { value: 'process', label: 'תהליכים' }
];

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'heading', label: 'כותרת משנה' },
  { value: 'paragraph', label: 'פסקה' },
  { value: 'image', label: 'תמונה' },
  { value: 'quote', label: 'ציטוט' },
  { value: 'link', label: 'קישור' },
  { value: 'cta', label: 'CTA' },
  { value: 'list', label: 'רשימה' },
  { value: 'divider', label: 'קו הפרדה' }
];

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: resp } = useAdminArticle(id);
  const article = resp?.data;

  const update = useUpdateAdminArticle();
  const publish = usePublishAdminArticle();
  const uploadImage = useUploadImage();

  const [form, setForm] = React.useState(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState('desktop'); // 'desktop' | 'mobile'

  React.useEffect(() => {
    if (!article) return;
    setForm({
      slug: article.slug || '',
      title: article.title || '',
      excerpt: article.excerpt || '',
      category: article.category || 'general',
      coverImage: article.coverImage || null,
      seo: article.seo || { title: '', description: '' },
      draft: article.draft || { blocks: [] }
    });
  }, [article?._id]);

  const blocks = form?.draft?.blocks || [];

  const getBodyText = () => {
    const firstPara = (blocks || []).find((b) => b.type === 'paragraph');
    return firstPara?.data?.text || '';
  };

  const setBodyText = (text) => {
    setForm((p) => {
      const currentBlocks = p.draft?.blocks || [];
      const idx = currentBlocks.findIndex((b) => b.type === 'paragraph');
      if (idx === -1) {
        return { ...p, draft: { ...p.draft, blocks: [{ type: 'paragraph', data: { text } }, ...currentBlocks] } };
      }
      const next = currentBlocks.map((b, i) => (i === idx ? { ...b, data: { ...(b.data || {}), text } } : b));
      return { ...p, draft: { ...p.draft, blocks: next } };
    });
  };

  const setBlock = (idx, patch) => {
    setForm((p) => ({
      ...p,
      draft: {
        ...p.draft,
        blocks: p.draft.blocks.map((b, i) => (i === idx ? { ...b, ...patch, data: { ...(b.data || {}), ...(patch.data || {}) } } : b))
      }
    }));
  };

  const addBlock = (type) => {
    setForm((p) => ({
      ...p,
      draft: { ...p.draft, blocks: [...(p.draft.blocks || []), { type, data: {} }] }
    }));
  };

  const removeBlock = (idx) => {
    setForm((p) => ({
      ...p,
      draft: { ...p.draft, blocks: p.draft.blocks.filter((_, i) => i !== idx) }
    }));
  };

  const moveBlock = (idx, dir) => {
    setForm((p) => {
      const next = [...p.draft.blocks];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return p;
      const tmp = next[idx];
      next[idx] = next[to];
      next[to] = tmp;
      return { ...p, draft: { ...p.draft, blocks: next } };
    });
  };

  const handleUpload = async (file, folder = 'tailorbiz/site/articles') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await uploadImage.mutateAsync(fd);
    return res?.data?.data;
  };

  const saveDraft = async () => {
    await update.mutateAsync({ id, data: form });
  };

  if (!form) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>
        <Typography color="text.secondary">טוען…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>עריכת מאמר</Typography>
          <Typography variant="body2" color="text.secondary">מבנה בלוקים + טיוטה/פרסום</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={() => navigate('/admin/cms/articles')}>חזרה לרשימה</Button>
          <Button variant="outlined" onClick={() => setPreviewOpen(true)}>
            תצוגה מקדימה
          </Button>
          <Button variant="outlined" onClick={saveDraft} disabled={update.isPending}>שמור טיוטה</Button>
          <Button variant="contained" color="success" onClick={async () => { await saveDraft(); await publish.mutateAsync(id); }} disabled={publish.isPending || update.isPending}>
            פרסם
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography fontWeight={800} sx={{ mb: 1.5 }}>פרטי מאמר</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="קטגוריה" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="כותרת" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תקציר (מופיע בבולד בראש המאמר)"
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="גוף המאמר (טקסט רגיל)"
                  value={getBodyText()}
                  onChange={(e) => setBodyText(e.target.value)}
                  multiline
                  minRows={10}
                  helperText="אפשר להוסיף כותרות משנה ותמונות באמצעות בלוקים בצד שמאל."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SEO Title" value={form.seo?.title || ''} onChange={(e) => setForm((p) => ({ ...p, seo: { ...(p.seo || {}), title: e.target.value } }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SEO Description" value={form.seo?.description || ''} onChange={(e) => setForm((p) => ({ ...p, seo: { ...(p.seo || {}), description: e.target.value } }))} />
              </Grid>

              <Grid item xs={12}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    העלה תמונת קאבר
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const up = await handleUpload(file, 'tailorbiz/site/articles/covers');
                        setForm((p) => ({ ...p, coverImage: { url: up.url, publicId: up.publicId, alt: p.title } }));
                      }}
                    />
                  </Button>
                  {form.coverImage?.url ? (
                    <Box component="img" src={form.coverImage.url} alt={form.coverImage.alt || ''} sx={{ height: 56, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">אין תמונת קאבר</Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography fontWeight={800}>בלוקים</Typography>
              <TextField
                select
                size="small"
                label="הוסף"
                value=""
                onChange={(e) => addBlock(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                {BLOCK_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Stack spacing={2}>
              {blocks.map((b, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: 'grey.100' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <TextField
                      select
                      size="small"
                      label="סוג"
                      value={b.type}
                      onChange={(e) => setBlock(idx, { type: e.target.value, data: {} })}
                      sx={{ minWidth: 150 }}
                    >
                      {BLOCK_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </TextField>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => moveBlock(idx, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => moveBlock(idx, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => removeBlock(idx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {b.type === 'hero' ? (
                    <Stack spacing={1}>
                      <TextField label="כותרת" value={b.data?.title || ''} onChange={(e) => setBlock(idx, { data: { title: e.target.value } })} fullWidth />
                      <TextField label="תת-כותרת" value={b.data?.subtitle || ''} onChange={(e) => setBlock(idx, { data: { subtitle: e.target.value } })} fullWidth />
                    </Stack>
                  ) : null}

                  {b.type === 'heading' ? (
                    <TextField label="טקסט" value={b.data?.text || ''} onChange={(e) => setBlock(idx, { data: { text: e.target.value } })} fullWidth />
                  ) : null}

                  {b.type === 'paragraph' ? (
                    <TextField label="טקסט" value={b.data?.text || ''} onChange={(e) => setBlock(idx, { data: { text: e.target.value } })} fullWidth multiline minRows={4} />
                  ) : null}

                  {b.type === 'image' ? (
                    <Stack spacing={1}>
                      <Button variant="outlined" component="label" startIcon={<AddIcon />}>
                        העלה תמונה
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const up = await handleUpload(file, 'tailorbiz/site/articles/images');
                            setBlock(idx, { data: { url: up.url, publicId: up.publicId, alt: form.title } });
                          }}
                        />
                      </Button>
                      <TextField label="URL" value={b.data?.url || ''} onChange={(e) => setBlock(idx, { data: { url: e.target.value } })} fullWidth />
                      <TextField label="Alt" value={b.data?.alt || ''} onChange={(e) => setBlock(idx, { data: { alt: e.target.value } })} fullWidth />
                      <TextField label="Caption" value={b.data?.caption || ''} onChange={(e) => setBlock(idx, { data: { caption: e.target.value } })} fullWidth />
                    </Stack>
                  ) : null}

                  {b.type === 'quote' ? (
                    <Stack spacing={1}>
                      <TextField label="ציטוט" value={b.data?.text || ''} onChange={(e) => setBlock(idx, { data: { text: e.target.value } })} fullWidth multiline minRows={3} />
                      <TextField label="מאת" value={b.data?.by || ''} onChange={(e) => setBlock(idx, { data: { by: e.target.value } })} fullWidth />
                    </Stack>
                  ) : null}

                  {b.type === 'link' ? (
                    <Stack spacing={1}>
                      <TextField label="טקסט הקישור" value={b.data?.text || ''} onChange={(e) => setBlock(idx, { data: { text: e.target.value } })} fullWidth />
                      <TextField label="URL" value={b.data?.href || ''} onChange={(e) => setBlock(idx, { data: { href: e.target.value } })} fullWidth placeholder="https://..." />
                    </Stack>
                  ) : null}

                  {b.type === 'cta' ? (
                    <Stack spacing={1}>
                      <TextField label="כותרת" value={b.data?.title || ''} onChange={(e) => setBlock(idx, { data: { title: e.target.value } })} fullWidth />
                      <TextField label="טקסט" value={b.data?.text || ''} onChange={(e) => setBlock(idx, { data: { text: e.target.value } })} fullWidth multiline minRows={2} />
                      <TextField label="טקסט כפתור" value={b.data?.buttonText || ''} onChange={(e) => setBlock(idx, { data: { buttonText: e.target.value } })} fullWidth />
                      <TextField label="קישור" value={b.data?.href || ''} onChange={(e) => setBlock(idx, { data: { href: e.target.value } })} fullWidth />
                    </Stack>
                  ) : null}

                  {b.type === 'list' ? (
                    <TextField
                      label="פריטים (שורה לכל פריט)"
                      value={(b.data?.items || []).join('\n')}
                      onChange={(e) => setBlock(idx, { data: { items: e.target.value.split('\n').filter(Boolean) } })}
                      fullWidth
                      multiline
                      minRows={4}
                    />
                  ) : null}

                  {b.type === 'divider' ? (
                    <Typography variant="body2" color="text.secondary">קו הפרדה</Typography>
                  ) : null}
                </Paper>
              ))}

              {blocks.length === 0 ? (
                <Typography color="text.secondary">הוסף בלוק ראשון כדי להתחיל.</Typography>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" fontWeight={800}>תצוגה מקדימה (טיוטה)</Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={previewDevice}
              onChange={(_, v) => {
                if (v) setPreviewDevice(v);
              }}
              sx={{ ml: 1 }}
            >
              <ToggleButton value="desktop">Desktop</ToggleButton>
              <ToggleButton value="mobile">Mobile</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Button onClick={() => setPreviewOpen(false)}>סגור</Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              bgcolor: 'grey.50',
              borderRadius: 3,
              p: { xs: 1, md: 2 },
              border: '1px solid',
              borderColor: 'grey.100'
            }}
          >
            <Box
              sx={{
                maxWidth: previewDevice === 'mobile' ? 390 : 820,
                mx: 'auto',
                bgcolor: 'background.default',
                borderRadius: previewDevice === 'mobile' ? 4 : 0,
                border: previewDevice === 'mobile' ? '1px solid' : 'none',
                borderColor: previewDevice === 'mobile' ? 'grey.200' : 'transparent',
                boxShadow: previewDevice === 'mobile' ? '0 12px 40px rgba(0,0,0,0.12)' : 'none',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: { xs: 2, md: 0 } }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
                  {form.title}
                </Typography>
                {form.excerpt ? (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100', bgcolor: 'grey.50', mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {form.excerpt}
                    </Typography>
                  </Paper>
                ) : null}
                {form.coverImage?.url ? (
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, border: '1px solid', borderColor: 'grey.100' }}>
                    <Box component="img" src={form.coverImage.url} alt={form.coverImage.alt || form.title} sx={{ width: '100%', display: 'block' }} />
                  </Box>
                ) : null}
                <ArticleBlocksRenderer blocks={form.draft?.blocks || []} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ArticleEditor;

