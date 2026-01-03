import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip, Stack, TextField, MenuItem } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { publicCMS } from '../utils/publicApi';
import { getImageUrl } from '../utils/imageUtils';

const CATEGORY_OPTIONS = [
  { value: '', label: 'כל הקטגוריות' },
  { value: 'general', label: 'כללי' },
  { value: 'automation', label: 'אוטומציות' },
  { value: 'crm', label: 'CRM' },
  { value: 'process', label: 'תהליכים' }
];

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = React.useState(searchParams.get('category') || '');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await publicCMS.getArticles(category ? { category } : undefined);
      setItems(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700}>
            מאמרים
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto' }}>
            תכנים מובנים על תהליכים, אוטומציות וניהול עסק — בצורה נקייה ומעשית.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              select
              size="small"
              value={category}
              onChange={(e) => {
                const v = e.target.value;
                setCategory(v);
                if (v) setSearchParams({ category: v });
                else setSearchParams({});
              }}
              sx={{ minWidth: 220 }}
              label="קטגוריה"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {(items || []).map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a.slug}>
              <Card
                component={Link}
                to={`/articles/${a.slug}`}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.100',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 32px rgba(0,0,0,0.10)' }
                }}
              >
                {a.coverImage?.url ? (
                  <CardMedia component="img" height="180" image={getImageUrl(a.coverImage)} alt={a.coverImage.alt || a.title} />
                ) : (
                  <Box sx={{ height: 180, bgcolor: 'grey.100' }} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                    {a.category ? <Chip size="small" label={a.category} variant="outlined" /> : null}
                  </Stack>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {a.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.excerpt || ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!loading && (!items || items.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">אין מאמרים להצגה כרגע.</Typography>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Articles;

