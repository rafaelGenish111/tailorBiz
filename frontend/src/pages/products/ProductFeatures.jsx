import { Box, Container, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import { getProductById } from '../../utils/productsConfig';
import Button from '../../components/ui/Button';
import StarIcon from '@mui/icons-material/Star';
import InlineBold from '../../components/common/InlineBold';

const MotionBox = motion.create(Box);

function ProductFeatures() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const comparison = product?.richContent?.comparisonTable;
  const comparisonSummary = product?.richContent?.comparisonSummary;
  const featuresStages = product?.richContent?.featuresStages;

  if (!product) return null;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Helmet>
        <title>{product.title} | יתרונות - TailorBiz</title>
        <meta name="description" content={`יתרונות ופיצ'רים של ${product.title}`} />
      </Helmet>

      <Container maxWidth="lg">
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: "'Heebo', system-ui, sans-serif" }}>
            {comparison ? 'יתרונות על פני המוצרים בשוק' : 'יתרונות ופיצ\'רים'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: '#B0B0B0', lineHeight: 1.8, maxWidth: 600, fontFamily: "'Heebo', system-ui, sans-serif" }}>
            {comparison
              ? (comparison[0]?.desc ? 'יתרונות על פני מוצרים בשוק.' : 'השוואה בין Glass Dynamics לבין חלופות טיפוסיות בשוק.')
              : featuresStages
                ? 'תשעת השלבים המרכזיים של המערכת.'
                : `${product.title} מציעה מגוון פיצ'רים המותאמים לצרכים הייחודיים של התעשייה.`}
          </Typography>

          {comparison && comparison[0]?.desc ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {comparison.map((row, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: '#333333',
                    bgcolor: '#0A0A0A',
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: product.accentColor, mb: 0.5, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                    {row.aspect}
                  </Typography>
                  <Typography sx={{ color: '#B0B0B0', lineHeight: 1.7, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                    {row.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : featuresStages ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              {featuresStages.map((s) => (
                <Box
                  key={s.stage}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: '#333333',
                    bgcolor: '#0A0A0A',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: product.accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {s.stage}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#FFFFFF', fontFamily: "'Heebo', system-ui, sans-serif" }}>
                      {s.title}
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 3, color: '#B0B0B0', lineHeight: 1.9, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                    {s.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : comparison && comparison[0]?.us ? (
            <>
              <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small" sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: `${product.accentColor}15` }}>
                      <TableCell sx={{ fontWeight: 700, fontFamily: "'Heebo', system-ui, sans-serif" }}>היבט</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontFamily: "'Heebo', system-ui, sans-serif", color: product.accentColor }}>Glass Dynamics</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontFamily: "'Heebo', system-ui, sans-serif" }}>חלופות טיפוסיות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparison.map((row, idx) => (
                      <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: '#262626' } }}>
                        <TableCell sx={{ fontWeight: 600, fontFamily: "'Heebo', system-ui, sans-serif" }}>{row.aspect}</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontFamily: "'Heebo', system-ui, sans-serif" }}>{row.us}</TableCell>
                        <TableCell sx={{ color: '#6B7280', fontFamily: "'Heebo', system-ui, sans-serif" }}>{row.others}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {comparisonSummary && (
                <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: product.accentColor, borderWidth: 1 }}>
                  <Typography component="div" sx={{ fontFamily: "'Heebo', system-ui, sans-serif", lineHeight: 1.8 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>סיכום: </Box>
                    <InlineBold>{comparisonSummary}</InlineBold>
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Grid container spacing={3}>
              {product.features.map((feature, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: '#333333', bgcolor: '#0A0A0A', height: '100%' }}
                  >
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${product.accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <StarIcon sx={{ color: product.accentColor, fontSize: 28 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: '#FFFFFF', fontFamily: "'Heebo', system-ui, sans-serif" }}>
                      {feature}
                    </Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button
              variant="primary"
              to="/contact"
              sx={{ background: product.accentColor, '&:hover': { background: product.accentColor, opacity: 0.9 } }}
            >
              לבדיקת היתכנות ואפיון
            </Button>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ProductFeatures;
