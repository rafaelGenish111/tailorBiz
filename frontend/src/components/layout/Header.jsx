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
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Button from '../ui/Button';
import { publicCMS } from '../../utils/publicApi';

const LOGO_SRC = '/assets/images/image-removebg-preview.png';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [articlesAnchorEl, setArticlesAnchorEl] = useState(null);
  const [categorySubmenuAnchors, setCategorySubmenuAnchors] = useState({});
  const [articlesByCategory, setArticlesByCategory] = useState({});
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState({});
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

  const articleCategories = [
    { label: 'אוטומציות', value: 'automation', path: '/articles?category=automation' },
    { label: 'תהליכים', value: 'process', path: '/articles?category=process' },
    { label: 'CRM', value: 'crm', path: '/articles?category=crm' },
    { label: 'כללי', value: 'general', path: '/articles?category=general' },
  ];

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
                    <MenuItem
                      key={category.value}
                      onMouseEnter={(e) => hasArticles && handleCategorySubmenuOpen(category.value, e)}
                      onMouseLeave={() => hasArticles && handleCategorySubmenuClose(category.value)}
                      sx={{ position: 'relative' }}
                    >
                      <Box
                        component={Link}
                        to={category.path}
                        onClick={() => setArticlesAnchorEl(null)}
                        sx={{
                          flex: 1,
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {category.label}
                        {hasArticles && (
                          <KeyboardArrowLeftIcon sx={{ fontSize: 20, ml: 1 }} />
                        )}
                      </Box>
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
                    </MenuItem>
                  );
                })}
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
