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
        bgcolor: 'primary.main',
        color: 'white',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* עמודה 1 - אודות */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              TailorBiz
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              מערכת ניהול אוטומטית לעסקים קטנים ובינוניים. חוסכת זמן ומחזירה לקוחות.
            </Typography>
          </Grid>

          {/* עמודה 2 - קישורים */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              קישורים מהירים
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/about"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9 }}
              >
                אודות
              </Link>
              <Link
                component={RouterLink}
                to="/pricing"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9 }}
              >
                תמחור
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9 }}
              >
                צור קשר
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9 }}
              >
                תנאי שימוש
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9 }}
              >
                מדיניות פרטיות
              </Link>
            </Box>
          </Grid>

          {/* עמודה 3 - יצירת קשר */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              יצירת קשר
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{COMPANY_INFO.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{COMPANY_INFO.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{COMPANY_INFO.address}</Typography>
              </Box>
            </Box>
          </Grid>

          {/* עמודה 4 - רשתות חברתיות */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              עקבו אחרינו
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
          © {currentYear} {COMPANY_INFO.name}. כל הזכויות שמורות.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
