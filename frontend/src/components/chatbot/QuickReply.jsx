import { Box, Chip } from '@mui/material';

function QuickReply({ replies, onSelect }) {
  if (!replies || replies.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {replies.map((reply, index) => (
        <Chip
          key={index}
          label={reply.label}
          onClick={() => onSelect(reply.value)}
          sx={{
            cursor: 'pointer',
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#00E676',
              color: 'white',
            },
          }}
        />
      ))}
    </Box>
  );
}

export default QuickReply;

