import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAdminPage, usePublishAdminPage, useRollbackAdminPage, useSaveAdminPageDraft } from '../../../admin/hooks/useCMS';
import { useUploadImage } from '../../../admin/hooks/useCMS';
import { getImageUrl } from '../../../utils/imageUtils';

const DEFAULT_HOME = {
  heroTitle: 'מערכת ניהול חכמה בתפירה אישית',
  heroSubtitle: 'מערכות ניהול ואוטומציות בהתאמה אישית',
  heroCtaText: 'לבדיקת היתכנות ואפיון',
  heroCtaHref: '/contact',
  sections: []
};

const DEFAULT_ABOUT = {
  title: 'אודות',
  content: '',
  sections: [],
  coverImage: null
};

const PageEditor = ({ slug, title }) => {
  const { data: pageResp, isLoading } = useAdminPage(slug);
  const saveDraft = useSaveAdminPageDraft(slug);
  const publish = usePublishAdminPage(slug);
  const rollback = useRollbackAdminPage(slug);
  const uploadImage = useUploadImage();

  const page = pageResp?.data;
  const initialDraft = page?.draft || (slug === 'home' ? DEFAULT_HOME : DEFAULT_ABOUT);

  const [draft, setDraft] = React.useState(initialDraft);
  const [seoTitle, setSeoTitle] = React.useState(page?.seo?.title || '');
  const [seoDescription, setSeoDescription] = React.useState(page?.seo?.description || '');

  React.useEffect(() => {
    setDraft(initialDraft);
    setSeoTitle(page?.seo?.title || '');
    setSeoDescription(page?.seo?.description || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?._id, slug]);

  const handleSave = async () => {
    await saveDraft.mutateAsync({
      seo: { title: seoTitle, description: seoDescription },
      draft
    });
  };

  const handlePublish = async () => {
    // שמירה לפני פרסום כדי למנוע פרסום תוכן לא שמור
    await handleSave();
    await publish.mutateAsync();
  };

  const sections = Array.isArray(draft?.sections) ? draft.sections : [];

  const uploadSectionImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'tailorbiz/site/home/sections');
    const res = await uploadImage.mutateAsync(fd);
    return res?.data?.data;
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">טיוטה + פרסום + היסטוריית גרסאות</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={handleSave} disabled={isLoading || saveDraft.isPending}>
            שמור טיוטה
          </Button>
          <Button variant="contained" color="success" onClick={handlePublish} disabled={isLoading || publish.isPending || saveDraft.isPending}>
            פרסם
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SEO Title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SEO Description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </Grid>

        {slug === 'home' ? (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת Hero"
                value={draft.heroTitle || ''}
                onChange={(e) => setDraft((p) => ({ ...p, heroTitle: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תת-כותרת Hero"
                value={draft.heroSubtitle || ''}
                onChange={(e) => setDraft((p) => ({ ...p, heroSubtitle: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="טקסט כפתור CTA"
                value={draft.heroCtaText || ''}
                onChange={(e) => setDraft((p) => ({ ...p, heroCtaText: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="קישור CTA"
                value={draft.heroCtaHref || ''}
                onChange={(e) => setDraft((p) => ({ ...p, heroCtaHref: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography fontWeight={800}>תכני דף הבית (Sections)</Typography>
                    <Typography variant="body2" color="text.secondary">כל Section כולל כותרת/תיאור/תמונה</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        sections: [
                          ...(Array.isArray(p.sections) ? p.sections : []),
                          { title: '', description: '', image: null }
                        ]
                      }))
                    }
                  >
                    הוסף Section
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {sections.map((s, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography fontWeight={700}>Section {idx + 1}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === 0) return;
                              setDraft((p) => {
                                const arr = [...(p.sections || [])];
                                const tmp = arr[idx - 1];
                                arr[idx - 1] = arr[idx];
                                arr[idx] = tmp;
                                return { ...p, sections: arr };
                              });
                            }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === sections.length - 1) return;
                              setDraft((p) => {
                                const arr = [...(p.sections || [])];
                                const tmp = arr[idx + 1];
                                arr[idx + 1] = arr[idx];
                                arr[idx] = tmp;
                                return { ...p, sections: arr };
                              });
                            }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="כותרת"
                            value={s.title || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).map((it, i) => (i === idx ? { ...it, title: v } : it))
                              }));
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Button variant="outlined" component="label" fullWidth>
                            העלה תמונה
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const up = await uploadSectionImage(file);
                                setDraft((p) => ({
                                  ...p,
                                  sections: (p.sections || []).map((it, i) =>
                                    i === idx ? { ...it, image: { url: up.url, publicId: up.publicId, alt: it.title } } : it
                                  )
                                }));
                              }}
                            />
                          </Button>
                          {s.image?.url ? (
                            <Box sx={{ mt: 1 }}>
                              <Box component="img" src={getImageUrl(s.image)} alt={s.image.alt || ''} sx={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'grey.100' }} />
                            </Box>
                          ) : null}
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="תיאור"
                            value={s.description || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).map((it, i) => (i === idx ? { ...it, description: v } : it))
                              }));
                            }}
                            multiline
                            minRows={4}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {sections.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">אין Sections עדיין. לחץ על \"הוסף Section\".</Typography>
                  ) : null}
                </Stack>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת ראשית"
                value={draft.title || ''}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                העלה תמונת כותרת
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('folder', 'tailorbiz/site/about');
                    const res = await uploadImage.mutateAsync(fd);
                    setDraft((p) => ({ ...p, coverImage: { url: res?.data?.data?.url, publicId: res?.data?.data?.publicId, alt: draft.title || 'אודות' } }));
                  }}
                />
              </Button>
              {draft.coverImage?.url ? (
                <Box sx={{ mt: 1 }}>
                  <Box component="img" src={getImageUrl(draft.coverImage)} alt={draft.coverImage.alt || ''} sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'grey.100' }} />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setDraft((p) => ({ ...p, coverImage: null }))}
                    sx={{ mt: 1 }}
                  >
                    מחק תמונה
                  </Button>
                </Box>
              ) : null}
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography fontWeight={800}>פסקאות עם כותרות משנה</Typography>
                    <Typography variant="body2" color="text.secondary">כל פסקה יכולה לכלול כותרת משנה, תוכן ותמונה</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        sections: [
                          ...(Array.isArray(p.sections) ? p.sections : []),
                          { title: '', content: '', image: null }
                        ]
                      }))
                    }
                  >
                    הוסף פסקה
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {(Array.isArray(draft?.sections) ? draft.sections : []).map((s, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography fontWeight={700}>פסקה {idx + 1}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === 0) return;
                              setDraft((p) => {
                                const arr = [...(p.sections || [])];
                                const tmp = arr[idx - 1];
                                arr[idx - 1] = arr[idx];
                                arr[idx] = tmp;
                                return { ...p, sections: arr };
                              });
                            }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === (draft.sections || []).length - 1) return;
                              setDraft((p) => {
                                const arr = [...(p.sections || [])];
                                const tmp = arr[idx + 1];
                                arr[idx + 1] = arr[idx];
                                arr[idx] = tmp;
                                return { ...p, sections: arr };
                              });
                            }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="כותרת משנה"
                            value={s.title || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).map((it, i) => (i === idx ? { ...it, title: v } : it))
                              }));
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="תוכן הפסקה"
                            value={s.content || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((p) => ({
                                ...p,
                                sections: (p.sections || []).map((it, i) => (i === idx ? { ...it, content: v } : it))
                              }));
                            }}
                            multiline
                            minRows={4}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Button variant="outlined" component="label" fullWidth>
                            העלה תמונה
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('file', file);
                                fd.append('folder', 'tailorbiz/site/about/sections');
                                const res = await uploadImage.mutateAsync(fd);
                                setDraft((p) => ({
                                  ...p,
                                  sections: (p.sections || []).map((it, i) =>
                                    i === idx ? { ...it, image: { url: res?.data?.data?.url, publicId: res?.data?.data?.publicId, alt: s.title || '' } } : it
                                  )
                                }));
                              }}
                            />
                          </Button>
                          {s.image?.url ? (
                            <Box sx={{ mt: 1 }}>
                              <Box component="img" src={getImageUrl(s.image)} alt={s.image.alt || ''} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'grey.100' }} />
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  setDraft((p) => ({
                                    ...p,
                                    sections: (p.sections || []).map((it, i) => (i === idx ? { ...it, image: null } : it))
                                  }));
                                }}
                                sx={{ mt: 1 }}
                              >
                                מחק תמונה
                              </Button>
                            </Box>
                          ) : null}
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {(Array.isArray(draft?.sections) ? draft.sections : []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">אין פסקאות עדיין. לחץ על \"הוסף פסקה\".</Typography>
                  ) : null}
                </Stack>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>היסטוריית גרסאות</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(page?.versions || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">אין גרסאות עדיין.</Typography>
            ) : (
              <Stack spacing={1}>
                {page.versions.map((v, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'grey.100',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {new Date(v.createdAt).toLocaleString('he-IL')}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => rollback.mutateAsync(idx)}
                      disabled={rollback.isPending}
                    >
                      שחזר לגרסה זו
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};

const SitePagesEditor = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>ניהול דפי אתר</Typography>
        <Typography variant="body2" color="text.secondary">דף הבית, אודות ותכני דף הבית</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="דף הבית" />
        <Tab label="אודות" />
      </Tabs>

      {tab === 0 ? <PageEditor slug="home" title="דף הבית" /> : <PageEditor slug="about" title="אודות" />}
    </Box>
  );
};

export default SitePagesEditor;

