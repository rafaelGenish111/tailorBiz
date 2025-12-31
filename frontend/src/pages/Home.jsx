import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ClientsLogoMarquee from '../components/home/ClientsLogoMarquee';
import HomeCMSSections from '../components/home/HomeCMSSections';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
// import StatsSection from '../components/home/StatsSection'; // Commented out until real data is available
import TestimonialsSection from '../components/home/TestimonialsSection';

function Home() {
  return (
    <Box>
      <HeroSection />
      <ClientsLogoMarquee />
      <HomeCMSSections />
      <ProcessFlowTimeline />
      <FeaturesSection />
      {/* StatsSection commented out until real data is available */}
      {/* <StatsSection /> */}
      <TestimonialsSection />
    </Box>
  );
}

export default Home;
