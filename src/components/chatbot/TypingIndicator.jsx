import { Box, Paper } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

function TypingIndicator() {
  return (
    <Paper
      elevation={1}
      sx={{
        display: 'inline-flex',
        gap: 0.5,
        p: 1.5,
        borderRadius: '12px 12px 12px 4px',
        bgcolor: 'white',
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.400',
            animation: `${bounce} 1.4s infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Paper>
  );
}

export default TypingIndicator;

