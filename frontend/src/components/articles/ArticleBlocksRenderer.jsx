import React from 'react';
import { Box, Typography, Stack, Divider, Link } from '@mui/material';
import Button from '../ui/Button';
import ROICalculator from '../ROICalculator';
import { getImageUrl } from '../../utils/imageUtils';

const ArticleBlocksRenderer = ({ blocks }) => {
  return (
    <Stack spacing={3}>
      {(blocks || []).map((b, idx) => {
        switch (b.type) {
          case 'hero':
            return (
              <Box
                key={idx}
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 3,
                  bgcolor: '#1E1E1E',
                  border: '1px solid',
                  borderColor: '#333333'
                }}
              >
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
              <Box key={idx} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: '#333333' }}>
                {b.data?.url ? (
                  <Box component="img" src={getImageUrl(b.data.url)} alt={b.data.alt || ''} sx={{ width: '100%', display: 'block' }} />
                ) : null}
                {b.data?.caption ? (
                  <Box sx={{ p: 1.5, bgcolor: '#1E1E1E' }}>
                    <Typography variant="caption" color="text.secondary">
                      {b.data.caption}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            );
          case 'quote':
            return (
              <Box key={idx} sx={{ p: 3, borderRight: '4px solid', borderColor: 'primary.main', bgcolor: '#1E1E1E', borderRadius: 2 }}>
                <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: 'pre-wrap' }}>
                  {b.data?.text || ''}
                </Typography>
                {b.data?.by ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {b.data.by}
                  </Typography>
                ) : null}
              </Box>
            );
          case 'link':
            return (
              <Box key={idx}>
                {b.data?.href && b.data?.text ? (
                  <Link
                    href={b.data.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: 'primary.dark',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    <Typography variant="body1" component="span">
                      {b.data.text}
                    </Typography>
                  </Link>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {b.data?.text || b.data?.href || 'קישור לא מוגדר'}
                  </Typography>
                )}
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
                  variant="primary"
                  href={b.data?.href || '/contact'}
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
          case 'roi-calculator':
            return (
              <Box key={idx} sx={{ my: 4 }}>
                <ROICalculator />
              </Box>
            );
          default:
            return null;
        }
      })}
    </Stack>
  );
};

export default ArticleBlocksRenderer;

