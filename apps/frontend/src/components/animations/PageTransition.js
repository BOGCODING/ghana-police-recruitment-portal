'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Top Progress Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="progress-bar"
            initial={{ scaleX: 0, originX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(to right, #006B3F, #F59E0B)',
              zIndex: 9999,
              boxShadow: '0 0 12px rgba(0, 107, 63, 0.6), 0 0 4px rgba(245, 158, 11, 0.4)'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 1.005 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] // Custom quint ease for premium feel
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
