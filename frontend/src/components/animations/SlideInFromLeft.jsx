import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const SlideInFromLeft = ({ children, delay = 0, duration = 0.6 }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export default SlideInFromLeft;


