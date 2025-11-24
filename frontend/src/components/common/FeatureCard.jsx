import { Card, CardContent, Box, Typography } from '@mui/material';

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: color || 'secondary.main',
          boxShadow: `0px 12px 32px rgba(0,0,0,0.08)`,
          transform: 'translateY(-8px)',
          '& .feature-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: color ? `${color}15` : 'secondary.light',
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
            bgcolor: 'grey.50',
            transition: 'all 0.4s ease',
          }}
        >
          <Icon sx={{ fontSize: 40, color: color || 'secondary.main' }} />
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
