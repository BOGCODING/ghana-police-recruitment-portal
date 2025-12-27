'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiPhone, FiHelpCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/logo.png" 
              alt="GPS Logo" 
              width={45} 
              height={45} 
              priority
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.mainText}>Ghana Police Service</span>
            <span className={styles.subText}>Recruitment Portal</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/requirements" className={styles.navLink}>Requirements</Link>
          <Link href="/voucher/purchase" className={styles.navLink}>Buy Voucher</Link>
          <Link href="/faq" className={styles.navLink}>
            <FiHelpCircle /> FAQ
          </Link>
          <Link href="/contact" className={styles.navLink}>
            <FiPhone /> Contact
          </Link>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <nav className={styles.mobileNav}>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link href="/requirements" onClick={() => setMobileMenuOpen(false)}>Requirements</Link>
              <Link href="/voucher/purchase" onClick={() => setMobileMenuOpen(false)}>Buy Voucher</Link>
              <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>
                Login to Portal
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
