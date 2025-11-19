import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

function Home() {
  return (
    <Box>
      <HeroSection />
      <ProcessFlowTimeline />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
    </Box>
  );
}

export default Home;
