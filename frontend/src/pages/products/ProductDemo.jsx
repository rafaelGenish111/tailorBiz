import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import { getProductById } from '../../utils/productsConfig';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Button from '../../components/ui/Button';

const MotionBox = motion.create(Box);

const textSx = { color: '#B0B0B0', lineHeight: 1.9, fontFamily: "'Heebo', system-ui, sans-serif" };

function ProductDemo() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const demoContent = product?.richContent?.demoContent;

  if (!product) return null;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Helmet>
        <title>{product.title} | הדגמה - TailorBiz</title>
        <meta name="description" content={`הדגמה חיה של ${product.title}`} />
      </Helmet>

      <Container maxWidth="lg">
        <MotionBox
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: "'Heebo', system-ui, sans-serif" }}>
            {demoContent?.title || 'הדגמה — פעילות האפליקציה ו-Workflow'}
          </Typography>

          {demoContent ? (
            <Box sx={{ mb: 5 }}>
              {demoContent.lifecycle ? (
                <>
                  <Typography sx={{ mb: 2, ...textSx }}>{demoContent.intro}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {demoContent.lifecycle.map((step, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: product.accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                          {i + 1}
                        </Box>
                        <Typography sx={textSx}>{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : demoContent.workflow ? (
                <>
                  <Typography sx={{ mb: 2, ...textSx }}>{demoContent.intro}</Typography>
                  {demoContent.sides?.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                      {demoContent.sides.map((side, i) => (
                        <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: '#333333', bgcolor: '#0A0A0A' }}>
                          <Typography sx={{ fontWeight: 700, color: product.accentColor, mb: 0.5, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                            {side.title}
                          </Typography>
                          <Typography sx={textSx}>{side.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                    {demoContent.sides?.length > 0 ? 'Workflow טיפוסי של הזמנה' : 'זרימת עבודה'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {demoContent.workflow.map((step) => (
                      <Box key={step.step} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: product.accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                          {step.step}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#FFFFFF', fontFamily: "'Heebo', system-ui, sans-serif" }}>
                            {step.title}
                          </Typography>
                          <Typography sx={textSx}>{step.text}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  {demoContent.repairs && (
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${product.accentColor}08`, mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, color: '#FFFFFF', mb: 0.5, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                        תיקונים (Repairs)
                      </Typography>
                      <Typography sx={textSx}>{demoContent.repairs}</Typography>
                    </Box>
                  )}
                  {demoContent.crm && (
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${product.accentColor}08`, mb: 4 }}>
                      <Typography sx={{ fontWeight: 600, color: '#FFFFFF', mb: 0.5, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                        CRM ולקוחות
                      </Typography>
                      <Typography sx={textSx}>{demoContent.crm}</Typography>
                    </Box>
                  )}
                  {demoContent.summary && (
                    <Typography sx={{ ...textSx, fontStyle: 'italic' }}>{demoContent.summary}</Typography>
                  )}
                </>
              ) : null}
            </Box>
          ) : (
            <Typography sx={{ mb: 5, maxWidth: 600, ...textSx }}>
              רוצים לראות את המערכת בפעולה? צרו איתנו קשר ונעדכן אתכם בהדגמה חיה.
            </Typography>
          )}

          {/* Video placeholder */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: '#333333',
              bgcolor: '#0A0A0A',
              aspectRatio: '16/9',
              maxHeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="img" src={product.image} alt={`הדגמה של ${product.title}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: 'rgba(0,0,0,0.4)',
              }}
            >
              <PlayCircleOutlineIcon sx={{ fontSize: 80, color: '#FFFFFF', opacity: 0.9 }} />
              <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: "'Heebo', system-ui, sans-serif" }}>
                כאן יופיע סרטון ההדגמה
              </Typography>
              <Button variant="primary" to="/contact" sx={{ background: product.accentColor, '&:hover': { background: product.accentColor, opacity: 0.9 } }}>
                קבעו פגישת הדגמה
              </Button>
            </Box>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ProductDemo;
