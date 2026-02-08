import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import { getProductById } from '../../utils/productsConfig';
import Button from '../../components/ui/Button';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const MotionBox = motion.create(Box);

function ProductContact() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  if (!product) return null;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Helmet>
        <title>{product.title} | צור קשר - TailorBiz</title>
        <meta name="description" content={`צרו קשר לגבי ${product.title}`} />
      </Helmet>

      <Container maxWidth="md">
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${product.accentColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <ContactSupportIcon sx={{ fontSize: 48, color: product.accentColor }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: '#1D1D1F',
              fontFamily: "'Heebo', system-ui, sans-serif",
            }}
          >
            מעוניינים ב{product.title}?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: '#4B5563',
              lineHeight: 1.8,
              fontFamily: "'Assistant', system-ui, sans-serif",
            }}
          >
            נשמח לשמוע מכם. השאירו פרטים ונחזור בהקדם עם הצעת מחיר מותאמת.
          </Typography>
          <Button
            variant="primary"
            to="/contact"
            size="large"
            sx={{
              background: product.accentColor,
              px: 4,
              py: 1.5,
              '&:hover': { background: product.accentColor, opacity: 0.9 },
            }}
          >
            לבדיקת היתכנות ואפיון
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ProductContact;
