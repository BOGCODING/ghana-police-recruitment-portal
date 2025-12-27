import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, duration = 0.5 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({ children, direction = 'up', delay = 0, duration = 0.5 }) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0
    },
    visible: { opacity: 1, y: 0, x: 0 },
    exit: { 
      opacity: 0, 
      y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
