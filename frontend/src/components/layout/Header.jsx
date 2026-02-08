import { useState, useEffect } from 'react';
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
  Collapse,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Button from '../ui/Button';
import { publicCMS } from '../../utils/publicApi';

const LOGO_SRC = '/logo.png';

const articleCategories = [
  { label: 'אוטומציות', value: 'automation', path: '/articles?category=automation' },
  { label: 'תהליכים', value: 'process', path: '/articles?category=process' },
  { label: 'CRM', value: 'crm', path: '/articles?category=crm' },
  { label: 'כללי', value: 'general', path: '/articles?category=general' },
];

function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [articlesAnchorEl, setArticlesAnchorEl] = useState(null);
  const [categorySubmenuAnchors, setCategorySubmenuAnchors] = useState({});
  const [articlesByCategory, setArticlesByCategory] = useState({});
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState({});
  const [settings, setSettings] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const baseNavItems = [
    { label: 'אודות', path: '/about' },
    { label: 'מוצרים', path: '/products' },
    { label: 'פיצ\'רים', path: '/features' },
    { label: 'לקוחות', path: '/clients' },
    { label: 'צור קשר', path: '/contact' },
  ];

  const navItems = baseNavItems.filter(item => {
    if (item.path === '/clients') {
      return settings?.showClientsInNav === true;
    }
    if (item.path === '/products') {
      return settings?.showProductsInNav !== false;
    }
    return true;
  });

  // טעינת הגדרות האתר
  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const res = await publicCMS.getSiteSettings();
        if (!mounted) return;
        setSettings(res.data?.data || null);
      } catch {
        if (!mounted) return;
        setSettings(null);
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  // טעינת מאמרים לכל קטגוריה
  useEffect(() => {
    const loadArticlesByCategory = async () => {
      const articlesMap = {};
      for (const category of articleCategories) {
        try {
          const res = await publicCMS.getArticles({ category: category.value });
          const articles = res.data?.data || [];
          if (articles.length > 0) {
            articlesMap[category.value] = articles;
          }
        } catch (error) {
          console.error(`Error loading articles for category ${category.value}:`, error);
        }
      }
      setArticlesByCategory(articlesMap);
    };

    loadArticlesByCategory();
  }, []);

  const handleCategorySubmenuOpen = (categoryValue, event) => {
    event.stopPropagation();
    setCategorySubmenuAnchors((prev) => ({
      ...prev,
      [categoryValue]: event.currentTarget,
    }));
  };

  const handleCategorySubmenuClose = (categoryValue) => {
    setCategorySubmenuAnchors((prev) => {
      const newState = { ...prev };
      delete newState[categoryValue];
      return newState;
    });
  };

  const handleMobileCategoryToggle = (categoryValue) => {
    setMobileCategoryOpen((prev) => ({
      ...prev,
      [categoryValue]: !prev[categoryValue],
    }));
  };

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
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* אודות */}
              {navItems.filter(item => item.label === 'אודות').map((item) => (
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
              {/* מאמרים */}
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
                <MenuItem
                  component={Link}
                  to="/articles"
                  onClick={() => setArticlesAnchorEl(null)}
                >
                  כל המאמרים
                </MenuItem>
                {articleCategories.map((category) => {
                  const hasArticles = articlesByCategory[category.value]?.length > 0;
                  return (
                    <Box
                      key={category.value}
                      sx={{ position: 'relative' }}
                      onMouseEnter={(e) => {
                        // Open submenu on hover if there are articles
                        if (hasArticles) {
                          handleCategorySubmenuOpen(category.value, e);
                        }
                      }}
                    >
                      <MenuItem
                        component={Link}
                        to={`/articles?category=${category.value}`}
                        onClick={() => {
                          setArticlesAnchorEl(null);
                          handleCategorySubmenuClose(category.value);
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        {category.label}
                        {hasArticles && (
                          <KeyboardArrowLeftIcon sx={{ fontSize: 20, ml: 1 }} />
                        )}
                      </MenuItem>
                      {hasArticles && (
                        <Menu
                          anchorEl={categorySubmenuAnchors[category.value]}
                          open={Boolean(categorySubmenuAnchors[category.value])}
                          onClose={() => handleCategorySubmenuClose(category.value)}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          MenuListProps={{ sx: { minWidth: 240, maxHeight: 400 } }}
                          onMouseEnter={() => {
                            // Keep submenu open when hovering over it
                          }}
                          onMouseLeave={() => handleCategorySubmenuClose(category.value)}
                        >
                          {articlesByCategory[category.value]?.map((article) => (
                            <MenuItem
                              key={article.slug}
                              component={Link}
                              to={`/articles/${article.slug}`}
                              onClick={() => {
                                setArticlesAnchorEl(null);
                                handleCategorySubmenuClose(category.value);
                              }}
                              sx={{ whiteSpace: 'normal', py: 1.5 }}
                            >
                              {article.title}
                            </MenuItem>
                          ))}
                        </Menu>
                      )}
                    </Box>
                  );
                })}
              </Menu>
              {/* שאר הכפתורים */}
              {navItems.filter(item => item.label !== 'אודות').map((item) => (
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
          {/* אודות */}
          {navItems.filter(item => item.label === 'אודות').map((item) => (
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
          {/* מאמרים */}
          <ListItem
            sx={{
              py: 2,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Box
              component={Link}
              to="/articles"
              onClick={() => setMobileOpen(false)}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                width: '100%',
                mb: 1,
              }}
            >
              מאמרים
            </Box>
            {articleCategories.map((category) => {
              const hasArticles = articlesByCategory[category.value]?.length > 0;
              return (
                <Box key={category.value} sx={{ width: '100%', mt: 1 }}>
                  <Box
                    onClick={() => hasArticles && handleMobileCategoryToggle(category.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      px: 2,
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.secondary',
                      cursor: hasArticles ? 'pointer' : 'default',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      component={Link}
                      to={`/articles?category=${category.value}`}
                      onClick={() => setMobileOpen(false)}
                      sx={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                      {category.label}
                    </Box>
                    {hasArticles && (
                      <KeyboardArrowLeftIcon
                        sx={{
                          fontSize: 20,
                          transform: mobileCategoryOpen[category.value] ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    )}
                  </Box>
                  {hasArticles && (
                    <Collapse in={mobileCategoryOpen[category.value]}>
                      <List sx={{ pl: 2, pt: 0.5 }}>
                        {articlesByCategory[category.value]?.map((article) => (
                          <ListItem
                            key={article.slug}
                            component={Link}
                            to={`/articles/${article.slug}`}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                              py: 1.5,
                              fontSize: '0.95rem',
                              fontWeight: 400,
                              color: 'text.secondary',
                              textDecoration: 'none',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            {article.title}
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </ListItem>
          {/* שאר הכפתורים */}
          {navItems.filter(item => item.label !== 'אודות').map((item) => (
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
