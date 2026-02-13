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
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProductById } from '../../utils/productsConfig';

const NAV_ITEMS = [
  { label: 'סקירה', path: '' },
  { label: 'טכנולוגיות', path: 'technologies' },
  { label: 'הדגמה', path: 'demo' },
  { label: 'יתרונות', path: 'features' },
  { label: 'צור קשר', path: 'contact' },
];

function ProductHeader({ productId }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const product = getProductById(productId);

  if (!product) return null;

  const basePath = `/products/${productId}`;

  const isActive = (itemPath) => {
    if (!itemPath) return location.pathname === basePath;
    return location.pathname === `${basePath}/${itemPath}`;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              component={Link}
              to="/products"
              aria-label="חזרה למוצרים"
              sx={{ color: '#FFFFFF' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              component={Link}
              to={basePath}
              sx={{
                textDecoration: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.125rem',
                fontFamily: "'Heebo', system-ui, sans-serif",
              }}
            >
              {product.title}
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const href = item.path ? `${basePath}/${item.path}` : basePath;
              const active = isActive(item.path);
              return (
                <MuiButton
                  key={item.path || 'overview'}
                  component={Link}
                  to={href}
                  sx={{
                    color: active ? product.accentColor : '#FFFFFF',
                    fontWeight: active ? 600 : 500,
                    px: 2,
                    fontFamily: "'Heebo', system-ui, sans-serif",
                    textTransform: 'none',
                    borderBottom: active ? `2px solid ${product.accentColor}` : '2px solid transparent',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: product.accentColor,
                    },
                  }}
                >
                  {item.label}
                </MuiButton>
              );
            })}
          </Box>

          <IconButton
            sx={{ display: { md: 'none' }, color: '#FFFFFF' }}
            onClick={() => setMobileOpen(true)}
            aria-label="תפריט"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { height: '100vh', bgcolor: 'background.default' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 3 }}>
          {NAV_ITEMS.map((item) => {
            const href = item.path ? `${basePath}/${item.path}` : basePath;
            const active = isActive(item.path);
            return (
              <ListItem
                key={item.path || 'overview'}
                component={Link}
                to={href}
                onClick={() => setMobileOpen(false)}
                sx={{
                  py: 2,
                  fontSize: '1.25rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? product.accentColor : '#FFFFFF',
                  borderBottom: '1px solid',
                  borderColor: '#333333',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </ListItem>
            );
          })}
          <ListItem
            component={Link}
            to="/products"
            onClick={() => setMobileOpen(false)}
            sx={{
              py: 2,
              fontSize: '1rem',
              color: 'text.secondary',
              textDecoration: 'none',
            }}
          >
            ← חזרה לכל המוצרים
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default ProductHeader;
