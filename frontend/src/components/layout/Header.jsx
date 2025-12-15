import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
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
    { label: 'תמחור', path: '/pricing' },
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
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: trigger ? 'grey.200' : 'transparent',
        boxShadow: trigger ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 0.3s ease',
        py: trigger ? 0.5 : 1.5,
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
              textDecoration: 'none',
              color: 'primary.main',
            }}
          >
            <Box
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TailorBiz
            </Box>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={(e) => setArticlesAnchorEl(e.currentTarget)}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'primary.main',
                  },
                }}
              >
                מאמרים
              </Button>
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
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/contact"
                sx={{
                  mr: 2,
                  boxShadow: '0px 4px 16px rgba(211,139,42,0.28)',
                }}
              >
                לבדיקת היתכנות ואפיון
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: 'primary.main' }}
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
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'grey.200',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </ListItem>
          ))}
          <ListItem sx={{ pt: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              component={Link}
              to="/contact"
              onClick={() => setMobileOpen(false)}
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
