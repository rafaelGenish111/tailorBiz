import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button as MuiButton,
  IconButton,
  Drawer,
  List,
  ListItem,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  useScrollTrigger,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../ui/Button';

const LOGO_SRC = '/assets/images/image-removebg-preview.png';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [articlesAnchorEl, setArticlesAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const navItems = [
    { label: 'אודות', path: '/about' },
    { label: 'תכונות', path: '/#features' },
    { label: 'לקוחות', path: '/clients' },
    { label: 'צור קשר', path: '/contact' },
  ];

  const articleMenuItems = [
    { label: 'כל המאמרים', path: '/articles' },
    { label: 'אוטומציות', path: '/articles?category=automation' },
    { label: 'תהליכים', path: '/articles?category=process' },
    { label: 'CRM', path: '/articles?category=crm' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: trigger ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.95)', // Glassmorphism - Frosted Glass
        borderBottom: '1px solid',
        borderColor: trigger ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        boxShadow: trigger ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 0.3s ease',
        py: trigger ? 0.5 : 1.5,
        backdropFilter: 'blur(20px)', // backdrop-blur-md
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              color: '#1D1D1F',
            }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt="לוגו"
              loading="eager"
              sx={{
                height: { xs: 44, sm: 52 },
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // אם הקובץ לא קיים עדיין – לא לשבור את ההדר
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MuiButton
                onClick={(e) => setArticlesAnchorEl(e.currentTarget)}
                sx={{
                  color: '#1D1D1F',
                  fontWeight: 500,
                  px: 2,
                  fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#0071E3',
                  },
                }}
              >
                מאמרים
              </MuiButton>
              <Menu
                anchorEl={articlesAnchorEl}
                open={Boolean(articlesAnchorEl)}
                onClose={() => setArticlesAnchorEl(null)}
                MenuListProps={{ sx: { minWidth: 220 } }}
              >
                {articleMenuItems.map((it) => (
                  <MenuItem
                    key={it.path}
                    component={Link}
                    to={it.path}
                    onClick={() => setArticlesAnchorEl(null)}
                  >
                    {it.label}
                  </MenuItem>
                ))}
              </Menu>
              {navItems.map((item) => (
                <MuiButton
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#1D1D1F',
                    fontWeight: 500,
                    px: 2,
                    fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: '#0071E3',
                    },
                  }}
                >
                  {item.label}
                </MuiButton>
              ))}
              <Button
                variant="primary"
                to="/contact"
                size="medium"
              >
                לבדיקת היתכנות ואפיון
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: '#1D1D1F' }}
              aria-label="תפריט"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            height: '100vh',
            bgcolor: 'background.default',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 3 }}>
          <ListItem
            component={Link}
            to="/articles"
            onClick={() => setMobileOpen(false)}
            sx={{
              py: 2,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              textDecoration: 'none',
            }}
          >
            מאמרים
          </ListItem>
          {navItems.map((item) => (
            <ListItem
              key={item.label}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                py: 2,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1D1D1F',
                borderBottom: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </ListItem>
          ))}
          <ListItem sx={{ pt: 3 }}>
            <Button
              variant="primary"
              to="/contact"
              size="large"
              onClick={() => setMobileOpen(false)}
              sx={{ width: '100%' }}
            >
              לבדיקת היתכנות ואפיון
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;
