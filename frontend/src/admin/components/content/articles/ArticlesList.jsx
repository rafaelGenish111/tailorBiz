import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  useAdminArticles,
  useCreateAdminArticle,
  useUpdateAdminArticle,
  usePublishAdminArticle,
  useUnpublishAdminArticle,
  useDeleteAdminArticle,
} from '../../../hooks/useCMS';
import ArticleEditor from './ArticleEditor';
import ConfirmDialog from '../../common/ConfirmDialog';

function ArticlesList() {
  const [tab, setTab] = useState(0); // 0=all, 1=drafts, 2=published
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statusFilter = tab === 1 ? 'draft' : tab === 2 ? 'published' : undefined;

  const { data, isLoading } = useAdminArticles({ status: statusFilter, q: search || undefined });
  const createMutation = useCreateAdminArticle();
  const updateMutation = useUpdateAdminArticle();
  const publishMutation = usePublishAdminArticle();
  const unpublishMutation = useUnpublishAdminArticle();
  const deleteMutation = useDeleteAdminArticle();

  const articles = data?.data || [];
  const saving = createMutation.isLoading || updateMutation.isLoading;

  // Handlers
  const handleAdd = () => {
    setSelectedArticle(null);
    setEditorOpen(true);
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setEditorOpen(true);
  };

  const handleSave = async (formData) => {
    if (selectedArticle) {
      await updateMutation.mutateAsync({ id: selectedArticle._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setEditorOpen(false);
    setSelectedArticle(null);
  };

  const handlePublishToggle = async (article) => {
    if (article.isPublished) {
      await unpublishMutation.mutateAsync(article._id);
    } else {
      await publishMutation.mutateAsync(article._id);
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete?._id) return;
    await deleteMutation.mutateAsync(articleToDelete._id);
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  // Count drafts and published
  const allData = data?.data || [];

  // DataGrid columns
  const columns = [
    {
      field: 'title',
      headerName: 'כותרת',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 0.5 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.value}
          </Typography>
          {params.row.excerpt && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.excerpt}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'קטגוריה',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value || 'כללי'} size="small" variant="outlined" />
      ),
    },
    {
      field: 'isPublished',
      headerName: 'סטטוס',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'מפורסם' : 'טיוטה'}
          size="small"
          color={params.value ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'עודכן',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      field: 'actions',
      headerName: 'פעולות',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => handleEdit(params.row)} title="ערוך">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color={params.row.isPublished ? 'warning' : 'success'}
            onClick={() => handlePublishToggle(params.row)}
            title={params.row.isPublished ? 'הסר מפרסום' : 'פרסם'}
          >
            {params.row.isPublished ? <UnpublishedIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
          </IconButton>
          {params.row.isPublished && (
            <IconButton
              size="small"
              component="a"
              href={`/blog/${params.row.slug}`}
              target="_blank"
              title="צפה באתר"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row)} title="מחק">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          ניהול מאמרים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          מאמר חדש
        </Button>
      </Box>

      {/* Tabs & Search */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label="הכל" />
          <Tab label="טיוטות" />
          <Tab label="מפורסמים" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          <TextField
            label="חיפוש"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            placeholder="חפש לפי כותרת או תקציר..."
          />
        </Box>
      </Paper>

      {/* Content */}
      {isMobile ? (
        <Stack spacing={1.5}>
          {articles.map((a) => (
            <Paper key={a._id} variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={700} noWrap>
                    {a.title}
                  </Typography>
                  {a.excerpt && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {a.excerpt}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={a.isPublished ? 'מפורסם' : 'טיוטה'}
                  size="small"
                  color={a.isPublished ? 'success' : 'warning'}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip label={a.category || 'כללי'} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('he-IL') : ''}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="outlined" onClick={() => handleEdit(a)} sx={{ flex: '1 1 100px' }}>
                  ערוך
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={a.isPublished ? 'warning' : 'success'}
                  onClick={() => handlePublishToggle(a)}
                  sx={{ flex: '1 1 100px' }}
                >
                  {a.isPublished ? 'הסר פרסום' : 'פרסם'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteClick(a)}
                  sx={{ flex: '1 1 100px' }}
                >
                  מחק
                </Button>
              </Stack>
            </Paper>
          ))}

          {!isLoading && articles.length === 0 && (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {tab === 1 ? 'אין טיוטות.' : tab === 2 ? 'אין מאמרים מפורסמים.' : 'אין מאמרים. לחץ על "מאמר חדש" כדי להתחיל.'}
              </Typography>
            </Paper>
          )}
        </Stack>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={articles}
            columns={columns}
            getRowId={(row) => row._id}
            loading={isLoading}
            disableSelectionOnClick
            rowHeight={60}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            sx={{
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            }}
          />
        </Paper>
      )}

      {/* Article Editor Dialog */}
      <ArticleEditor
        key={selectedArticle?._id || 'new'}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setSelectedArticle(null); }}
        article={selectedArticle}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת מאמר"
        content={`האם אתה בטוח שברצונך למחוק את המאמר "${articleToDelete?.title}"?`}
        confirmText="מחק"
        confirmColor="error"
      />
    </Box>
  );
}

export default ArticlesList;
