import { Box, Container, Grid, Typography, Link, IconButton, Divider, Button as MuiButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';
import { COMPANY_INFO, SOCIAL_LINKS } from '../../utils/constants';
import { publicCMS } from '../../utils/publicApi';
import logoImage from '../../assets/images/image-removebg-preview.png';

const LOGO_SRC = logoImage;

function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await publicCMS.getSiteSettings();
        if (!mounted) return;
        setSettings(res.data?.data || null);
      } catch {
        if (!mounted) return;
        setSettings(null);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const showClientsInNav = settings?.showClientsInNav === true;

  const companyName = settings?.company?.name || COMPANY_INFO.name;
  const email = settings?.contact?.email || COMPANY_INFO.email;
  const phone = settings?.contact?.phone || COMPANY_INFO.phone;
  const whatsapp = settings?.contact?.whatsapp || '';
  const address = settings?.contact?.address || COMPANY_INFO.address;

  const socials = {
    facebook: settings?.socials?.facebook || SOCIAL_LINKS.facebook,
    linkedin: settings?.socials?.linkedin || SOCIAL_LINKS.linkedin,
    instagram: settings?.socials?.instagram || SOCIAL_LINKS.instagram,
    twitter: settings?.socials?.twitter || SOCIAL_LINKS.twitter,
  };

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
            <Box
              component="img"
              src={LOGO_SRC}
              alt="לוגו TailorBiz"
              sx={{
                height: { xs: 60, md: 80 },
                width: 'auto',
                mb: 2,
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
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
              {/* <Link
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
              </Link> */}
              {showClientsInNav && (
                <Link
                  component={RouterLink}
                  to="/clients"
                  color="text.primary"
                  underline="hover"
                  sx={{
                    '&:hover': { color: 'secondary.main' },
                    transition: 'color 0.3s',
                  }}
                >
                  לקוחות
                </Link>
              )}
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
                component={RouterLink}
                to="/roi-calculator"
                color="text.primary"
                underline="hover"
                sx={{
                  '&:hover': { color: 'secondary.main' },
                  transition: 'color 0.3s',
                }}
              >
                מחשבון עלות חוסר יעילות
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
                href="/privacy"
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
              {/* Email Button */}
              <MuiButton
                component="a"
                href={`mailto:${email}`}
                startIcon={<EmailIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#1D1D1F',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 113, 227, 0.08)',
                    color: '#0071E3',
                  },
                }}
              >
                שלח מייל
              </MuiButton>

              {/* Phone Button */}
              {phone && (
                <MuiButton
                  component="a"
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  startIcon={<PhoneIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#1D1D1F',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 113, 227, 0.08)',
                      color: '#0071E3',
                    },
                  }}
                >
                  התקשר אלינו
                </MuiButton>
              )}

              {/* WhatsApp Button */}
              {whatsapp && (
                <MuiButton
                  component="a"
                  href={whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#1D1D1F',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 211, 102, 0.08)',
                      color: '#25D366',
                    },
                  }}
                >
                  שלח ווצאפ
                </MuiButton>
              )}

              {/* Location Button - Google Maps */}
              {address && (
                <MuiButton
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LocationOnIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#1D1D1F',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 113, 227, 0.08)',
                      color: '#0071E3',
                    },
                  }}
                >
                  {address}
                </MuiButton>
              )}
            </Box>
          </Grid>

          {/* עמודה 4 - רשתות חברתיות */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              עקבו אחרינו
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socials.facebook ? (
                <IconButton
                  href={socials.facebook}
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
              ) : null}
              {socials.linkedin ? (
                <IconButton
                  href={socials.linkedin}
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
              ) : null}
              {socials.instagram ? (
                <IconButton
                  href={socials.instagram}
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
              ) : null}
              {socials.twitter ? (
                <IconButton
                  href={socials.twitter}
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
              ) : null}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.200' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            האתר מונגש לפי תקן 5568 ברמה AA.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {companyName}. כל הזכויות שמורות.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
