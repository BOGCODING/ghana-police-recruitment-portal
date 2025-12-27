'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import styles from '@/app/(applicant)/styles.module.css';

export default function MobileSidebar({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sidebar"
            className={styles.sidebarWrapper}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <Sidebar onMobileClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
