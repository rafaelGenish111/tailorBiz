import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Stack, Divider, Button } from '@mui/material';
import { publicCMS } from '../utils/publicApi';

const BlockRenderer = ({ blocks }) => {
  return (
    <Stack spacing={3}>
      {(blocks || []).map((b, idx) => {
        switch (b.type) {
          case 'hero':
            return (
              <Box key={idx} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.100' }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                  {b.data?.title || ''}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {b.data?.subtitle || ''}
                </Typography>
              </Box>
            );
          case 'heading':
            return (
              <Typography key={idx} variant="h5" fontWeight={800}>
                {b.data?.text || ''}
              </Typography>
            );
          case 'paragraph':
            return (
              <Typography key={idx} variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {b.data?.text || ''}
              </Typography>
            );
          case 'image':
            return (
              <Box key={idx} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.100' }}>
                {b.data?.url ? (
                  <Box component="img" src={b.data.url} alt={b.data.alt || ''} sx={{ width: '100%', display: 'block' }} />
                ) : null}
                {(b.data?.caption) ? (
                  <Box sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">
                      {b.data.caption}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            );
          case 'quote':
            return (
              <Box key={idx} sx={{ p: 3, borderRight: '4px solid', borderColor: 'primary.main', bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'pre-wrap' }}>
                  {b.data?.text || ''}
                </Typography>
                {b.data?.by ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {b.data.by}
                  </Typography>
                ) : null}
              </Box>
            );
          case 'cta':
            return (
              <Box key={idx} sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  {b.data?.title || 'רוצים לעצור את זליגת הכסף?'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  {b.data?.text || 'בואו נבדוק יחד היתכנות ונבנה אפיון מדויק.'}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  href={b.data?.href || '/contact'}
                  sx={{ fontWeight: 800 }}
                >
                  {b.data?.buttonText || 'לבדיקת היתכנות ואפיון'}
                </Button>
              </Box>
            );
          case 'divider':
            return <Divider key={idx} />;
          case 'list':
            return (
              <Box key={idx} sx={{ pl: 2 }}>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {(b.data?.items || []).map((it, i) => (
                    <li key={i}>
                      <Typography variant="body1">{it}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            );
          default:
            return null;
        }
      })}
    </Stack>
  );
};

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
            <Typography variant="body1" color="text.secondary">
              {article.excerpt}
            </Typography>
          ) : null}
        </Stack>

        {article.coverImage?.url ? (
          <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, border: '1px solid', borderColor: 'grey.100' }}>
            <Box component="img" src={article.coverImage.url} alt={article.coverImage.alt || article.title} sx={{ width: '100%', display: 'block' }} />
          </Box>
        ) : null}

        <BlockRenderer blocks={article.blocks} />
      </Container>
    </Box>
  );
};

export default ArticlePage;

