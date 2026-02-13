import { Card, CardContent, Box, Typography } from '@mui/material';

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: '#333333',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: color || '#00E676',
          boxShadow: `0px 12px 32px rgba(0, 230, 118, 0.1)`,
          transform: 'translateY(-8px)',
          '& .feature-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: color ? `${color}15` : 'rgba(0, 230, 118, 0.1)',
          },
        },
      }}
    >
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Box
          className="feature-icon"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            bgcolor: '#1E1E1E',
            transition: 'all 0.4s ease',
          }}
        >
          <Icon sx={{ fontSize: 40, color: color || '#00E676' }} />
        </Box>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FeatureCard;
