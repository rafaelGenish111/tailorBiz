import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ClientsLogoMarquee from '../components/home/ClientsLogoMarquee';
import HomeCMSSections from '../components/home/HomeCMSSections';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
import PageSEO from '../components/seo/PageSEO';

/** Full-width 1px architectural divider */
const Divider = () => (
  <Box sx={{ width: '100%', height: '1px', bgcolor: '#333333' }} />
);

function Home() {
  return (
    <Box sx={{ bgcolor: '#0A0A0A', overflowX: 'hidden' }}>
      <PageSEO
        title="TailorBiz | מערכות ניהול ואוטומציה בהתאמה אישית"
        description="הפכו את העסק לאוטונומי ויעיל. TailorBiz מתמחה בבניית מערכות CRM/ERP, אוטומציות עסקיות וחיסכון בשעות עבודה. פתרון Tailor-Made ללא דמי מנוי."
      />
      <HeroSection />
      <Divider />
      <HomeCMSSections />
      <Divider />
      <ProcessFlowTimeline />
      <ClientsLogoMarquee />
      <FeaturesSection />
    </Box>
  );
}

export default Home;
