import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const FadeInWhenVisible = ({ children, delay = 0, duration = 0.6 }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInWhenVisible;


