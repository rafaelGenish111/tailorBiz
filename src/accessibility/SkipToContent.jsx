import React from 'react';
import { Button } from '@mui/material';

const SkipToContent = () => {
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={skipToMain}
      sx={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        '&:focus': {
          left: '50%',
          top: 10,
          transform: 'translateX(-50%)',
          bgcolor: 'primary.main',
          color: 'white',
          px: 3,
          py: 1.5,
        },
      }}
    >
      דלג לתוכן הראשי
    </Button>
  );
};

export default SkipToContent;
