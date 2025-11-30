import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Link as RouterLink } from 'react-router-dom';
import { COMPANY_INFO, SOCIAL_LINKS } from '../../utils/constants';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        borderTop: '1px solid',
        borderColor: 'grey.200',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* עמודה 1 - אודות */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TailorBiz
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              מערכת ניהול אוטומטית לעסקים קטנים ובינוניים. חוסכת זמן ומחזירה לקוחות.
            </Typography>
          </Grid>

          {/* עמודה 2 - קישורים */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              קישורים מהירים
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/about"
                color="text.primary"
                underline="hover"
                sx={{ 
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                אודות
              </Link>
              <Link
                component={RouterLink}
                to="/pricing"
                color="text.primary"
                underline="hover"
                sx={{ 
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                תמחור
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="text.primary"
                underline="hover"
                sx={{ 
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                צור קשר
              </Link>
              <Link
                href="#"
                color="text.primary"
                underline="hover"
                sx={{ 
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                תנאי שימוש
              </Link>
              <Link
                component={RouterLink}
                to="/privacy"
                color="text.primary"
                underline="hover"
                sx={{ 
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                מדיניות פרטיות
              </Link>
            </Box>
          </Grid>

          {/* עמודה 3 - יצירת קשר */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              יצירת קשר
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2" color="text.primary">{COMPANY_INFO.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2" color="text.primary">{COMPANY_INFO.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2" color="text.primary">{COMPANY_INFO.address}</Typography>
              </Box>
            </Box>
          </Grid>

          {/* עמודה 4 - רשתות חברתיות */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              עקבו אחרינו
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                sx={{ 
                  color: 'text.primary', 
                  bgcolor: 'grey.100',
                  '&:hover': { 
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                sx={{ 
                  color: 'text.primary', 
                  bgcolor: 'grey.100',
                  '&:hover': { 
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                sx={{ 
                  color: 'text.primary', 
                  bgcolor: 'grey.100',
                  '&:hover': { 
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                sx={{ 
                  color: 'text.primary', 
                  bgcolor: 'grey.100',
                  '&:hover': { 
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.200' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            האתר מונגש לפי תקן 5568 ברמה AA.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {COMPANY_INFO.name}. כל הזכויות שמורות.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
