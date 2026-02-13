import { Box, Container, Typography } from '@mui/material';
import ROICalculator from '../components/ROICalculator';

function ROICalculatorPage() {
  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: '#111111',
          color: '#FFFFFF',
          py: 10,
          textAlign: 'center',
          borderBottom: '1px solid #333333',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: '#FFFFFF' }}>
            מחשבון עלות חוסר יעילות
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', color: '#E0E0E0' }}>
            גלו כמה כסף אתם מפסידים כל חודש על משימות ידניות שניתן לאוטומט
          </Typography>
        </Container>
      </Box>

      {/* Calculator Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <ROICalculator />
        
        {/* Additional Info Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            איך זה עובד?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
            המחשבון מחשב את העלות החודשית של שעות עבודה ידניות על בסיס השכר השעתי שלכם.
            הכפלנו ב-4.3 כדי לקבל את הממוצע החודשי (52 שבועות ÷ 12 חודשים).
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            עם אוטומציה מותאמת אישית, תוכלו לחסוך את כל הסכום הזה ולהחזיר את ההשקעה תוך חודשים ספורים.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default ROICalculatorPage;



