import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';

const MotionCard = motion.create(Card);

function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '₪4,990',
      description: 'מושלם לעסקים קטנים',
      features: [
        'CRM בסיסי לעד 100 לקוחות',
        'תזכורות אוטומטיות במייל',
        'ניהול תורים פשוט',
        'תמיכה טכנית בימי עסקים',
        'הדרכה של שעתיים',
      ],
      recommended: false,
    },
    {
      name: 'Professional',
      price: '₪9,990',
      description: 'הכי פופולרי - מומלץ לרוב העסקים',
      features: [
        'CRM מלא ללקוחות ללא הגבלה',
        'תזכורות במייל, SMS והוואטסאפ',
        'ניהול תורים חכם + מילוי אוטומטי',
        'מעקב אחרי לקוחות שלא חזרו',
        'ניהול מלאי בסיסי',
        'תמיכה 24/7',
        'הדרכה מקיפה של 4 שעות',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'מחיר בהתאמה אישית',
      description: 'לעסקים גדולים עם צרכים מתקדמים',
      features: [
        'כל התכונות של Professional',
        'אינטגרציות מתקדמות',
        'ניהול מלאי מלא + תזכורות',
        'דוחות ואנליטיקה מתקדמת',
        'מנהל חשבון ייעודי',
        'התאמות אישיות ללא הגבלה',
        'הדרכה מקיפה לכל הצוות',
      ],
      recommended: false,
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: '#111111',
          color: '#FFFFFF',
          py: 10,
          textAlign: 'center',
          borderBottom: '1px solid #333333',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: '#FFFFFF' }}>
            תמחור שקוף ופשוט
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', color: '#E0E0E0' }}>
            תשלום חד-פעמי ללא מנוי חודשי - שלמו פעם אחת ותהנו לתמיד
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                elevation={plan.recommended ? 8 : 2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.recommended ? '2px solid' : '1px solid',
                  borderColor: plan.recommended ? '#00E676' : '#333333',
                  borderRadius: 1,
                }}
              >
                {plan.recommended && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      right: '50%',
                      transform: 'translateX(50%)',
                      bgcolor: '#00E676',
                      color: '#111111',
                      px: 3,
                      py: 0.5,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={700}>
                      מומלץ
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, pt: plan.recommended ? 5 : 3 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={800} gutterBottom>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>

                  <List>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: '#00E676' }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    size="large"
                  >
                    {plan.name === 'Enterprise' ? 'צרו קשר' : 'בחרו חבילה'}
                  </Button>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            לא בטוחים איזו חבילה מתאימה לכם?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            קבעו שיחת ייעוץ חינם ונעזור לכם למצוא את הפתרון המושלם
          </Typography>
          <Button variant="contained" color="primary" size="large">
            קבעו שיחת ייעוץ
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Pricing;
