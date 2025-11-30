// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>מדיניות פרטיות | TailorBiz</title>
        <meta name="description" content="מדיניות הפרטיות של TailorBiz בהתאם לחוק הגנת הפרטיות הישראלי ותיקון 13." />
      </Helmet>
      
      <Header />
      
      <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
              מדיניות פרטיות
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                1. כללי
              </Typography>
              <Typography paragraph>
                חברת TailorBiz ("אנחנו" או "החברה") מכבדת את פרטיות המשתמשים באתר. 
                מטרת מסמך זה היא לפרט בשקיפות (בהתאם לתיקון 13 לחוק הגנת הפרטיות) איזה מידע נאסף, לאיזו מטרה, ומהן זכויותיך.
              </Typography>
            </Box>
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                2. המידע שאנו אוספים (Data Minimization)
              </Typography>
              <Typography paragraph>
                אנו פועלים לפי עקרון צמצום המידע ואוספים רק את המידע הדרוש למתן השירות:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• מידע שתמסור מרצונך: שם מלא, טלפון, וכתובת אימייל (בטופס צור קשר)." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• מידע טכני: כתובת IP, סוג דפדפן, ונתוני גלישה אנונימיים לצרכי אבטחה ושיפור חווית המשתמש (Cookies)." />
                </ListItem>
              </List>
            </Box>
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                3. מטרות האיסוף (Purpose Limitation)
              </Typography>
              <Typography paragraph>
                המידע נאסף למטרות הבאות בלבד:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• יצירת קשר עמך בעקבות פנייתך באתר." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• שליחת הצעות מחיר ומידע עסקי (בכפוףכמתך)." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• אבטחת המידע באתר ומניעת הונאות." />
                </ListItem>
              </List>
            </Box>
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                4. זכויותיך לפי החוק
              </Typography>
              <Typography paragraph>
                בהתאם לחוק הגנת הפרטיות, עומדות לרשותך הזכויות הבאות:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• הזכות לעיין במידע: באפשרותך לבקש לעיין במידע המוחזק עליך." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• הזכות לתיקון: אם מצאת שהמידע אינו נכון, שלם או מעודכן." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• הזכות למחיקה: באפשרותך לבקש את מחיקת המידע (בכפוף למגבלות חוקיות)." />
                </ListItem>
              </List>
              <Typography variant="body2" sx={{ mt: 1, bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>
                למימוש זכויות אלו, ניתן לפנות אלינו במייל: info@tailorbiz.com (או כל מייל אחר שרלוונטי).
              </Typography>
            </Box>
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                5. אבטחת מידע
              </Typography>
              <Typography paragraph>
                אנו נוקטים באמצעי אבטחה טכנולוגיים וארגוניים נאותים כדי להגן על המידע שלך מפני גישה בלתי מורשית, בהתאם לתקנות הגנת הפרטיות (אבטחת מידע).
              </Typography>
            </Box>
            
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                6. נגישות
              </Typography>
              <Typography paragraph>
                האתר מונגש לפי תקן 5568 ברמה AA. אם נתקלת בבעיית נגישות, נשמח לשמוע ממך במייל: info@tailorbiz.com
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
      
      <Footer />
    </>
  );
};

export default PrivacyPolicy;

