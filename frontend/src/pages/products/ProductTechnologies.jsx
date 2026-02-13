import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import { getProductById } from '../../utils/productsConfig';

const MotionBox = motion.create(Box);

const textSx = { color: '#E0E0E0', lineHeight: 1.9, fontFamily: "'Heebo', system-ui, sans-serif" };

function ProductTechnologies() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const techDesc = product?.richContent?.technologiesDescription;

  if (!product) return null;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Helmet>
        <title>{product.title} | טכנולוגיות - TailorBiz</title>
        <meta name="description" content={`טכנולוגיות ומערכת הטק של ${product.title}`} />
      </Helmet>

      <Container maxWidth="lg">
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: "'Heebo', system-ui, sans-serif" }}>
            על המערכת והתשתית
          </Typography>

          {techDesc ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 720 }}>
              {techDesc.map((para, i) => (
                <Typography key={i} sx={textSx}>
                  {para}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ ...textSx, maxWidth: 600 }}>
              {product.title} נבנה עם טכנולוגיות מודרניות ואמינות. המערכת מותאמת לדרישות הייחודיות של התעשייה ומספקת חוויית משתמש חלקה ובטוחה.
            </Typography>
          )}
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ProductTechnologies;
