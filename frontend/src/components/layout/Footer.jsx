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
const LOGO_SRC = '/logo.png';

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
  const showProductsInNav = settings?.showProductsInNav !== false;

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
        bgcolor: '#111111',
        borderTop: '1px solid',
        borderColor: '#333333',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* עמודה 1 - אודות */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              component="img"
              src={LOGO_SRC}
              alt="לוגו TaylorBiz"
              sx={{
                height: { xs: 60, md: 80 },
                width: 'auto',
                mb: 2,
                objectFit: 'contain',
              }}
            />
            <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
              מערכת ניהול אוטומטית לעסקים קטנים ובינוניים. חוסכת זמן ומחזירה לקוחות.
            </Typography>
          </Grid>

          {/* עמודה 2 - קישורים */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#00E676' }}>
              קישורים מהירים
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/about"
                underline="hover"
                sx={{
                  color: '#E0E0E0',
                  '&:hover': { color: '#00E676' },
                  transition: 'color 0.3s',
                }}
              >
                אודות
              </Link>
              {showProductsInNav && (
                <Link
                  component={RouterLink}
                  to="/products"
                  underline="hover"
                  sx={{
                    color: '#E0E0E0',
                    '&:hover': { color: '#00E676' },
                    transition: 'color 0.3s',
                  }}
                >
                  מוצרים
                </Link>
              )}
              {showClientsInNav && (
                <Link
                  component={RouterLink}
                  to="/clients"
                  underline="hover"
                  sx={{
                    color: '#E0E0E0',
                    '&:hover': { color: '#00E676' },
                    transition: 'color 0.3s',
                  }}
                >
                  לקוחות
                </Link>
              )}
              <Link
                component={RouterLink}
                to="/contact"
                underline="hover"
                sx={{
                  color: '#E0E0E0',
                  '&:hover': { color: '#00E676' },
                  transition: 'color 0.3s',
                }}
              >
                צור קשר
              </Link>
              <Link
                component={RouterLink}
                to="/roi-calculator"
                underline="hover"
                sx={{
                  color: '#E0E0E0',
                  '&:hover': { color: '#00E676' },
                  transition: 'color 0.3s',
                }}
              >
                מחשבון עלות חוסר יעילות
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{
                  color: '#E0E0E0',
                  '&:hover': { color: '#00E676' },
                  transition: 'color 0.3s',
                }}
              >
                תנאי שימוש
              </Link>
              <Link
                href="/privacy"
                underline="hover"
                sx={{
                  color: '#E0E0E0',
                  '&:hover': { color: '#00E676' },
                  transition: 'color 0.3s',
                }}
              >
                מדיניות פרטיות
              </Link>
            </Box>
          </Grid>

          {/* עמודה 3 - יצירת קשר */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#00E676' }}>
              יצירת קשר
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MuiButton
                component="a"
                href={`mailto:${email}`}
                startIcon={<EmailIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 230, 118, 0.08)',
                    color: '#00E676',
                  },
                }}
              >
                שלח מייל
              </MuiButton>

              {phone && (
                <MuiButton
                  component="a"
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  startIcon={<PhoneIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 230, 118, 0.08)',
                      color: '#00E676',
                    },
                  }}
                >
                  התקשר אלינו
                </MuiButton>
              )}

              {whatsapp && (
                <MuiButton
                  component="a"
                  href={whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#FFFFFF',
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

              {address && (
                <MuiButton
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LocationOnIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 230, 118, 0.08)',
                      color: '#00E676',
                    },
                  }}
                >
                  {address}
                </MuiButton>
              )}
            </Box>
          </Grid>

          {/* עמודה 4 - רשתות חברתיות */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#00E676' }}>
              עקבו אחרינו
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socials.facebook ? (
                <IconButton
                  href={socials.facebook}
                  target="_blank"
                  sx={{
                    color: '#FFFFFF',
                    bgcolor: '#1E1E1E',
                    '&:hover': {
                      bgcolor: '#00E676',
                      color: '#111111',
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
                    color: '#FFFFFF',
                    bgcolor: '#1E1E1E',
                    '&:hover': {
                      bgcolor: '#00E676',
                      color: '#111111',
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
                    color: '#FFFFFF',
                    bgcolor: '#1E1E1E',
                    '&:hover': {
                      bgcolor: '#00E676',
                      color: '#111111',
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
                    color: '#FFFFFF',
                    bgcolor: '#1E1E1E',
                    '&:hover': {
                      bgcolor: '#00E676',
                      color: '#111111',
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

        <Divider sx={{ my: 4, bgcolor: '#333333' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#9E9E9E' }} gutterBottom>
            האתר מונגש לפי תקן 5568 ברמה AA.
          </Typography>
          <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
            &copy; {currentYear} {companyName}. כל הזכויות שמורות.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
