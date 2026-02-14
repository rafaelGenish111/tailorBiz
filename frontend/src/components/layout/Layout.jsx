import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AccessibilityMenu from './AccessibilityMenu';
import CookieConsent from './CookieConsent';
import ChatWidget from '../ChatWidget/ChatWidget';
import { publicCMS } from '../../utils/publicApi';

function Layout({ children }) {
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await publicCMS.getSiteSettings();
        if (!mounted) return;
        setSettings(res.data?.data || null);
      } catch (_) {
        if (!mounted) return;
        setSettings(null);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  // Build JSON-LD Schema
  const companyName = settings?.company?.name || 'TailorBiz';
  const phone = settings?.contact?.phone || '055-9935044';
  const address = settings?.contact?.address || '';
  const hours = settings?.hours || {
    sundayToThursday: 'ראשון - חמישי: 9:00 - 18:00',
    friday: 'שישי: 9:00 - 13:00'
  };

  // Parse hours
  const parseHours = (hoursStr) => {
    const match = hoursStr?.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (match) {
      return { opens: `${match[1].padStart(2, '0')}:${match[2]}`, closes: `${match[3].padStart(2, '0')}:${match[4]}` };
    }
    return { opens: '09:00', closes: '18:00' };
  };

  const weekdayHours = parseHours(hours.sundayToThursday);

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    'name': companyName,
    'image': 'https://tailorbiz-software.com/assets/images/image-removebg-preview.png', // Keep public path for SEO schema
    '@id': 'https://tailorbiz-software.com',
    'url': 'https://tailorbiz-software.com',
    'telephone': phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': address || '',
      'addressLocality': 'Petah Tikva',
      'addressCountry': 'IL'
    },
    'priceRange': '$$$',
    'description': 'סטארטאפ בוטיק המתמחה בטרנספורמציה דיגיטלית, בניית מערכות CRM ואוטומציות לעסקים.',
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday'
      ],
      'opens': weekdayHours.opens,
      'closes': weekdayHours.closes
    }
  };

  return (
    <>
      <Helmet>
        {/* Default SEO - Can be overridden by page-specific Helmet */}
        <title>TailorBiz | מערכות ניהול ואוטומציה בהתאמה אישית</title>
        <meta name="description" content="הפכו את העסק לאוטונומי ויעיל. TailorBiz מתמחה בבניית מערכות CRM/ERP, אוטומציות עסקיות וחיסכון בשעות עבודה. פתרון Tailor-Made ללא דמי מנוי." />
        <meta name="keywords" content="אוטומציה עסקית, פיתוח CRM, מערכות ניהול, התייעלות עסקית, בניית דשבורדים, TailorBiz, Make אינטגרציות" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="עוצרים את הכאוס בעסק? בואו נדבר." />
        <meta property="og:description" content="בניית מערכות ניהול חכמות ואוטומציות שחוסכות זמן וכסף." />
        <meta property="og:image" content="/assets/images/og-banner.jpg" />
        <meta property="og:url" content="https://tailorbiz-software.com" />
        <meta property="og:locale" content="he_IL" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="עוצרים את הכאוס בעסק? בואו נדבר." />
        <meta name="twitter:description" content="בניית מערכות ניהול חכמות ואוטומציות שחוסכות זמן וכסף." />
        <meta name="twitter:image" content="/assets/images/og-banner.jpg" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLdSchema)}
        </script>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
        <AccessibilityMenu />
        <ChatWidget />
        <CookieConsent />
      </Box>
    </>
  );
}

export default Layout;
