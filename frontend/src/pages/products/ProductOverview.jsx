import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getProductById } from '../../utils/productsConfig';
import Button from '../../components/ui/Button';
import InlineBold from '../../components/common/InlineBold';

const MotionBox = motion.create(Box);

const textSx = {
  color: '#B0B0B0',
  fontWeight: 400,
  lineHeight: 1.9,
  fontFamily: "'Heebo', system-ui, sans-serif",
};

function ProductOverview() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const rich = product?.richContent?.overview;

  if (!product) return null;

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Helmet>
        <title>{product.title} | סקירה - TailorBiz</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          bgcolor: '#0A0A0A',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${product.accentColor}08 0%, transparent 50%)`,
            zIndex: 0,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                width: 60,
                height: 6,
                borderRadius: 3,
                bgcolor: product.accentColor,
                mb: 3,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: product.subTitle ? 0.5 : 2,
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '2rem', md: '3rem' },
                fontFamily: "'Heebo', system-ui, sans-serif",
              }}
            >
              {product.title}
            </Typography>
            {product.subTitle && (
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: product.accentColor,
                  fontWeight: 600,
                  fontFamily: "'Heebo', system-ui, sans-serif",
                }}
              >
                {product.subTitle}
              </Typography>
            )}
            {rich ? (
              <Box sx={{ maxWidth: 800 }}>
                <Typography component="div" sx={{ ...textSx, mb: 2 }}>
                  <InlineBold>{rich.intro}</InlineBold>
                </Typography>
                {rich.saas ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                      המערכת בנויה כ-SaaS רב־דייר (Multi-Tenant):
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 3, mb: 2, ...textSx }}>
                      {rich.saas.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </Box>
                    <Typography component="div" sx={{ ...textSx, mb: 2 }}>
                      <InlineBold>{rich.ui}</InlineBold>
                    </Typography>
                  </>
                ) : rich.stagesBrief ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                      תשעת השלבים המרכזיים:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 3, mb: 2, ...textSx }}>
                      {rich.stagesBrief.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </Box>
                  </>
                ) : rich.included ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                      מה כלול במערכת:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                      {rich.included.map((item, i) => (
                        <Box key={i}>
                          <Typography component="span" sx={{ ...textSx, fontWeight: 600 }}>{item.title} — </Typography>
                          <Typography component="span" sx={textSx}>{item.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : null}
                <Typography sx={{ ...textSx, fontStyle: 'italic' }}>
                  {rich.audience}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ ...textSx, maxWidth: 700 }}>
                {product.overviewText}
              </Typography>
            )}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="primary"
                to="/contact"
                sx={{
                  background: product.accentColor,
                  '&:hover': { background: product.accentColor, opacity: 0.9 },
                }}
              >
                לבדיקת היתכנות ואפיון
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Features preview */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#0A0A0A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: "'Heebo', system-ui, sans-serif",
            }}
          >
            יתרונות מרכזיים
          </Typography>
          <Grid container spacing={3}>
            {product.features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#0A0A0A',
                    border: '1px solid',
                    borderColor: '#333333',
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: `${product.accentColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={16} style={{ color: product.accentColor }} strokeWidth={3} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: '#FFFFFF',
                      fontFamily: "'Heebo', system-ui, sans-serif",
                    }}
                  >
                    {feature}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default ProductOverview;
