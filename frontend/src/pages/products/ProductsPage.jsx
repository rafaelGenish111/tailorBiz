import { Box, Container, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PRODUCTS } from '../../utils/productsConfig';
import { Helmet } from 'react-helmet-async';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

function ProductCard({ product, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <Box key={product.id} sx={{ display: 'flex', minHeight: 0 }}>
      <MotionCard
        ref={ref}
        component={Link}
        to={product.path}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        sx={{
          textDecoration: 'none',
          width: '100%',
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#333333',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 14px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardMedia
          component="img"
          image={product.image}
          alt={product.title}
          sx={{ height: 200, objectFit: 'cover', flexShrink: 0 }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              bgcolor: product.accentColor,
              mb: 2,
            }}
          />
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 1.5,
              color: '#FFFFFF',
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              flexShrink: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              flexGrow: 1,
              lineHeight: 1.7,
              fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.shortDescription}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
              color: product.accentColor,
              fontWeight: 600,
              fontSize: '0.9375rem',
              flexShrink: 0,
            }}
          >
            לפרטים נוספים
            <ArrowForwardIcon sx={{ fontSize: 20 }} />
          </Box>
        </CardContent>
      </MotionCard>
    </Box>
  );
}

function ProductsPage() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <Box sx={{ bgcolor: '#111111', minHeight: '100vh' }}>
      <Helmet>
        <title>מוצרים | TailorBiz - פתרונות דיגיטליים בהתאמה אישית</title>
        <meta name="description" content="אפליקציית מטפלים, המפעל החכם, בית ספר של העתיד - פתרונות דיגיטליים מותאמים לעסק שלכם." />
      </Helmet>

      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          py: { xs: 10, md: 14 },
          overflow: 'hidden',
          bgcolor: '#111111',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
            zIndex: 0,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 2,
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '2.25rem', md: '3.5rem' },
                lineHeight: 1.2,
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              המוצרים שלנו
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#E0E0E0',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
              }}
            >
              פתרונות דיגיטליים מותאמים אישית לתעשיות שונות. בחרו את המוצר המתאים לכם וחקרו את האפשרויות.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* Product Cards */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {PRODUCTS.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default ProductsPage;
