import React from 'react';
import { Button } from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CTAButton = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
};

export default CTAButton;


