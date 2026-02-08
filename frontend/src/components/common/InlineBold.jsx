/**
 * רינדור טקסט עם **bold** כאלמנט מודגש
 */
import { Box } from '@mui/material';

function InlineBold({ children, sx = {}, ...props }) {
  if (typeof children !== 'string') {
    return <Box component="span" sx={sx} {...props}>{children}</Box>;
  }
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Box component="span" sx={sx} {...props}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Box key={i} component="span" sx={{ fontWeight: 700 }}>{part.slice(2, -2)}</Box>
        ) : (
          part
        )
      )}
    </Box>
  );
}

export default InlineBold;
