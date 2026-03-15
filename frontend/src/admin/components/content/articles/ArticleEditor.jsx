import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Stack,
  IconButton,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'כללי' },
  { value: 'automation', label: 'אוטומציות' },
  { value: 'crm', label: 'CRM' },
  { value: 'process', label: 'תהליכים' },
];

function ArticleEditor({ open, onClose, article, onSave, saving }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize from article prop. The parent uses key={article?._id || 'new'}
  // which forces a full remount when article changes, so initial state is safe.
  const initBlocks = article?.draft?.blocks || article?.published?.blocks || [];
  const initContent = initBlocks.map((b) => {
    if (b.type === 'header') return `<h${b.data?.level || 2}>${b.data?.text || ''}</h${b.data?.level || 2}>`;
    if (b.type === 'delimiter') return '<hr>';
    if (b.type === 'list') {
      const tag = b.data?.style === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${(b.data?.items || []).map(i => `<li>${i}</li>`).join('')}</${tag}>`;
    }
    return b.data?.text || '';
  }).join('');

  const [title, setTitle] = useState(article?.title || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [category, setCategory] = useState(article?.category || 'general');
  const [content, setContent] = useState(initContent);
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState(article?.tags || []);
  const [seoTitle, setSeoTitle] = useState(article?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(article?.seo?.description || '');

  const handleAddTag = () => {
    const tag = tagsInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagsInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      excerpt: excerpt.trim(),
      category,
      content,
      tags,
      seo: {
        title: seoTitle.trim() || title.trim(),
        description: seoDescription.trim(),
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: fullScreen ? '100%' : '80vh' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {article ? 'עריכת מאמר' : 'מאמר חדש'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Title & Category */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <TextField
            select
            label="קטגוריה"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Excerpt */}
        <TextField
          label="תקציר"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="תיאור קצר שיופיע בכרטיס המאמר..."
        />

        {/* Tags */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="תגיות"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              size="small"
              placeholder="הקלד תגית ולחץ Enter"
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" size="small" onClick={handleAddTag} disabled={!tagsInput.trim()}>
              הוסף
            </Button>
          </Stack>
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Rich Text Editor */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            תוכן המאמר
          </Typography>
          <RichTextEditor value={content} onChange={setContent} />
        </Box>

        {/* SEO */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
            SEO (אופציונלי)
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="כותרת SEO"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              fullWidth
              size="small"
              placeholder={title || 'כותרת שתוצג במנועי חיפוש'}
            />
            <TextField
              label="תיאור SEO"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              fullWidth
              size="small"
              placeholder="תיאור שיוצג בתוצאות חיפוש"
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose}>ביטול</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
        >
          {saving ? 'שומר...' : article ? 'עדכן מאמר' : 'צור מאמר'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ArticleEditor;
