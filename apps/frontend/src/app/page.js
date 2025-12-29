'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../utils/api';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './page.module.css';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};



export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const categories = [
    { name: 'General Duty', img: '/images/categories/general-duty.jpg', desc: 'Ages 18-30, WASSCE holders', link: '/requirements/general-duty' },
    { name: 'Tradesmen', img: '/images/categories/tradesmen.jpg', desc: 'Technical skills & certifications', link: '/requirements/tradesmen' },
    { name: 'Graduates', img: '/images/categories/graduates.jpg', desc: 'Degree, HND, Diploma holders', link: '/requirements/graduates' },
    { name: 'Medical', img: '/images/categories/medical.jpg', desc: 'Healthcare professionals', link: '/requirements/medical' },
    { name: 'Religious', img: '/images/categories/religious.jpg', desc: 'Chaplains and Imams', link: '/requirements/religious' },
    { name: 'Sportsmen', img: '/images/categories/sportsmen.jpg', desc: 'Athletic achievers', link: '/requirements/sportsmen' },
  ];

  const steps = [
    { num: 1, title: 'Get Voucher', desc: 'Purchase your registration voucher' },
    { num: 2, title: 'Register', desc: 'Create your account with voucher' },
    { num: 3, title: 'Apply', desc: 'Complete the application form' },
    { num: 4, title: 'Submit', desc: 'Upload documents and submit' },
  ];

  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const data = await api(`/api/applications/track/${trackId.trim()}`);
      setTrackResult(data.data);
    } catch (err) {
      setTrackError(err.message || 'Application not found');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroImage}
          style={{ y: heroY }}
        >
          <Image 
            src="/images/hero-background.jpg" 
            alt="Ghana Police Officers" 
            fill 
            priority
            quality={100}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
        <div className={styles.heroOverlay}></div>
        
        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ opacity: heroOpacity }}
        >
          <motion.div className={styles.badge} variants={fadeInUp}>
            <Image src="/ghana-flag.svg" alt="Ghana Flag" width={20} height={14} className={styles.flag} />
            Official Recruitment Portal
          </motion.div>
          
          <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
            Ghana Police Service
            <span className={styles.highlight}> Recruitment 2025</span>
          </motion.h1>
          
          <motion.p className={styles.heroSubtitle} variants={fadeInUp}>
            Serve with honor. Protect with pride. Join Ghana&apos;s finest law enforcement agency.
          </motion.p>

          <motion.div className={styles.heroButtons} variants={fadeInUp}>
            <Link href="/voucher/validate">
              <motion.span 
                className={styles.btnPrimary}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 215, 0, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Start Application
              </motion.span>
            </Link>
            <Link href="/requirements">
              <motion.span 
                className={styles.btnSecondary}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                View Requirements
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

      
      </section>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>Recruitment Categories</h2>
            <p className={styles.sectionSubtitle}>Choose your path to serve the nation</p>
          </motion.div>
          
          <div className={styles.categoriesGrid}>
            {categories.map((cat, idx) => (
              <Link href={cat.link} key={idx}>
                <motion.div 
                  className={styles.categoryCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className={styles.categoryImageWrapper}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                      <Image 
                        src={cat.img} 
                        alt={cat.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.categoryImg}
                      />
                    </motion.div>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <p className={styles.categoryDesc}>{cat.desc}</p>
                    <motion.span 
                      className={styles.categoryArrow}
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                    >
                      →
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Track Status Section */}
      <section className={styles.trackSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.trackCard}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.trackHeader}>
              <h2 className={styles.sectionTitle}>Track Application Status</h2>
              <p>Enter your Application ID to check your current recruitment status</p>
            </div>
            
            <form onSubmit={handleTrack} className={styles.trackForm}>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#FFD700' }}
                type="text" 
                placeholder="GPS-2025-XXXXXXXX"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className={styles.trackInput}
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className={styles.trackBtn} 
                disabled={trackLoading}
              >
                {trackLoading ? 'Checking...' : 'Check Status'}
              </motion.button>
            </form>

            {trackError && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.trackError}
              >
                {typeof trackError === 'string' ? trackError : 'An error occurred'}
              </motion.p>
            )}
            
            {trackResult && (
              <motion.div 
                className={styles.trackResult}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className={styles.resultHeader}>
                  <h4>Status for {String(trackResult.applicantName || 'Applicant')}</h4>
                  <span className={`${styles.statusBadge} ${styles[(String(trackResult.status || '')).toLowerCase()]}`}>
                    {String(trackResult.status || '')}
                  </span>
                </div>
                <p className={styles.resultDate}>
                  Submitted on: {trackResult.submittedAt ? new Date(trackResult.submittedAt).toLocaleDateString() : 'N/A'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`${styles.section} ${styles.processSection}`}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>Application Process</h2>
            <p className={styles.sectionSubtitle}>Simple steps to join the force</p>
          </motion.div>

          <div className={styles.stepsContainer}>
            {steps.map((step, idx) => (
              <motion.div 
                key={idx} 
                className={styles.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
              >
                <motion.div 
                  className={styles.stepNumber}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.num}
                </motion.div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {idx < steps.length - 1 && <div className={styles.stepConnector}></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className={styles.ctaBadge}
            animate={{ rotateY: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Image src="/police-badge.svg" alt="Police Badge" width={100} height={100} />
          </motion.div>
          <h2 className={styles.ctaTitle}>Ready to Serve Your Nation?</h2>
          <p className={styles.ctaSubtitle}>
            Applications are now open for the 2025 recruitment exercise
          </p>

          <Link href="/register">
            <motion.span 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'inline-block' }}
            >
              Apply Now
            </motion.span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <Image src="/logo.png" alt="Ghana Police Service Logo" width={60} height={60} />
                <h3>Ghana Police Service</h3>
              </div>
              <p>Serving with integrity since 1894</p>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/about">About</Link>
              <Link href="/requirements">Requirements</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 Ghana Police Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
