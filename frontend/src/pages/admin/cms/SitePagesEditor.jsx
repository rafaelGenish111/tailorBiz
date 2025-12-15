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
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAdminPage, usePublishAdminPage, useRollbackAdminPage, useSaveAdminPageDraft } from '../../../admin/hooks/useCMS';

const DEFAULT_HOME = {
  heroTitle: 'מערכת חכמה בתפירה אישית',
  heroSubtitle: 'ללא דמי מנוי חודשיים - הנכס נשאר שלך',
  heroCtaText: 'לבדיקת היתכנות ואפיון',
  heroCtaHref: '/contact',
  homeContent: ''
};

const DEFAULT_ABOUT = {
  title: 'אודות',
  content: ''
};

const PageEditor = ({ slug, title }) => {
  const { data: pageResp, isLoading } = useAdminPage(slug);
  const saveDraft = useSaveAdminPageDraft(slug);
  const publish = usePublishAdminPage(slug);
  const rollback = useRollbackAdminPage(slug);

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
              <TextField
                fullWidth
                label="תכני דף הבית (טקסט חופשי/נקודות)"
                value={draft.homeContent || ''}
                onChange={(e) => setDraft((p) => ({ ...p, homeContent: e.target.value }))}
                multiline
                minRows={8}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת"
                value={draft.title || ''}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תוכן"
                value={draft.content || ''}
                onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
                multiline
                minRows={10}
              />
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

