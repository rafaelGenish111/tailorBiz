import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Stack, Paper } from '@mui/material';
import { publicCMS } from '../utils/publicApi';
import ArticleBlocksRenderer from '../components/articles/ArticleBlocksRenderer';
import { getImageUrl } from '../utils/imageUtils';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await publicCMS.getArticle(slug);
        setArticle(res.data?.data || null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  if (loading && !article) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography color="text.secondary">טוען מאמר…</Typography>
        </Container>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h5" fontWeight={700}>מאמר לא נמצא</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={800}>
            {article.title}
          </Typography>
          {article.excerpt ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#333333', bgcolor: '#1E1E1E' }}>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {article.excerpt}
              </Typography>
            </Paper>
          ) : null}
        </Stack>

        {article.coverImage?.url ? (
          <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, border: '1px solid', borderColor: '#333333' }}>
            <Box component="img" src={getImageUrl(article.coverImage)} alt={article.coverImage.alt || article.title} sx={{ width: '100%', display: 'block' }} />
          </Box>
        ) : null}

        <ArticleBlocksRenderer blocks={article.blocks} />
      </Container>
    </Box>
  );
};

export default ArticlePage;

