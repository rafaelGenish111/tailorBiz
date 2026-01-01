import { Box, Container } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import ClientsLogoMarquee from '../components/home/ClientsLogoMarquee';
import HomeCMSSections from '../components/home/HomeCMSSections';
import ProcessFlowTimeline from '../components/home/ProcessFlowTimeline';
import FeaturesSection from '../components/home/FeaturesSection';
// import StatsSection from '../components/home/StatsSection'; // Commented out until real data is available
import TestimonialsSection from '../components/home/TestimonialsSection';
import ROICalculator from '../components/ROICalculator';

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
      
      {/* ROI Calculator Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <ROICalculator />
        </Container>
      </Box>
      
      <TestimonialsSection />
    </Box>
  );
}

export default Home;
