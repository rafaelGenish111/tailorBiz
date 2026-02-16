import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ClientsLogoMarquee from '../components/home/ClientsLogoMarquee';
import HomeCMSSections from '../components/home/HomeCMSSections';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';

/** Full-width 1px architectural divider */
const Divider = () => (
  <Box sx={{ width: '100%', height: '1px', bgcolor: '#333333' }} />
);

function Home() {
  return (
    <Box sx={{ bgcolor: '#0A0A0A', overflowX: 'hidden' }}>
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
