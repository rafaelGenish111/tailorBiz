import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ClientsLogoMarquee from '../components/home/ClientsLogoMarquee';
import HomeCMSSections from '../components/home/HomeCMSSections';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

/** Full-width 1px architectural divider */
const Divider = () => (
  <Box sx={{ width: '100%', height: '1px', bgcolor: '#333333' }} />
);

function Home() {
  return (
    <Box sx={{ bgcolor: '#0A0A0A' }}>
      <HeroSection />
      <ClientsLogoMarquee />
      <Divider />
      <HomeCMSSections />
      <Divider />
      <ProcessFlowTimeline />
      <FeaturesSection />
      <TestimonialsSection />
    </Box>
  );
}

export default Home;
