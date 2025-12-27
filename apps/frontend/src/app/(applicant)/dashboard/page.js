'use client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute/ProtectedRoute';
import styles from './page.module.css';
import Link from 'next/link';
import ApplicationStatus from '@/components/dashboard/ApplicationStatus/ApplicationStatus';
import DashboardStats from '@/components/dashboard/DashboardStats/DashboardStats';
import ApplicantProfileCard from '@/components/dashboard/ApplicantProfileCard/ApplicantProfileCard';
import { api } from '@/utils/api';
import { useState } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicantDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  const getStatusColor = (status) => {
    const colors = {
      REGISTERED: '#3B82F6',
      DRAFT: '#F59E0B',
      SUBMITTED: '#8B5CF6',
      DOCUMENTS_REQUIRED: '#F97316',
      APPROVED: '#10B981',
      REJECTED: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const { steps: contextSteps, maxStepAllowed } = useApplication();

  const steps = contextSteps.map(step => ({
    num: step.id,
    title: step.name,
    status: maxStepAllowed > step.id ? 'complete' : maxStepAllowed === step.id ? 'current' : 'pending'
  }));

  const handleDownloadSummary = async () => {
    try {
      setIsDownloading(true);
      // Use the backend's PDF generation endpoint
      const blob = await api('/api/applications/download-pdf', {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GPS-Application-${user?.applicationId || 'Summary'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error('Failed to download summary:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Dynamic Background Particles */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: 200 + Math.random() * 300,
              height: 200 + Math.random() * 300,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🛡️</span>
          <div>
          <div className={styles.headerTitleGroup}>
            <h1>My Application</h1>
            <div className={styles.liveIndicator}>
              <span className={styles.pulse}></span>
              Live
            </div>
          </div>
          <p>Ghana Police Service Recruitment</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.serial}>{typeof user?.serialNumber === 'object' ? JSON.stringify(user?.serialNumber) : user?.serialNumber}</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <motion.main 
        className={styles.main}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className={styles.statusCard}>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>Application Status</span>
            <span 
              className={styles.statusValue}
              style={{ color: getStatusColor(user?.applicationStatus || 'DRAFT') }}
            >
              {typeof (user?.applicationStatus || 'DRAFT') === 'object' ? JSON.stringify(user?.applicationStatus) : (user?.applicationStatus || 'DRAFT')}
            </span>
            {user?.applicationId && (
              <span className={styles.appId}>ID: {typeof user.applicationId === 'object' ? JSON.stringify(user.applicationId) : user.applicationId}</span>
            )}
          </div>
          <div className={styles.statusActions}>
            {(!user?.applicationStatus || user?.applicationStatus === 'DRAFT' || user?.applicationStatus === 'REJECTED' || user?.applicationStatus === 'DOCUMENTS_REQUIRED') && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/application" className={styles.continueBtn}>
                  {user?.applicationStatus === 'REJECTED' ? 'Revise Application' : 
                   user?.applicationStatus === 'DOCUMENTS_REQUIRED' ? 'Upload Missing Docs' : 
                   'Continue Application'} →
                </Link>
              </motion.div>
            )}
            {user?.applicationStatus === 'SUBMITTED' && (
              <span className={styles.submittedNote}>Under Review</span>
            )}
            
            {(user?.applicationStatus === 'SUBMITTED' || user?.applicationStatus === 'APPROVED' || user?.applicationStatus === 'REJECTED') && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadSummary} 
                disabled={isDownloading}
                className={styles.downloadBtn}
                style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem',
                  backgroundColor: '#f3f4f6', 
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isDownloading ? 'Generating...' : '📄 Download Summary'}
              </motion.button>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {(user?.reviewComments || user?.rejectionReason) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`${styles.alert} ${user.applicationStatus === 'REJECTED' ? styles.alertDanger : 
                              user.applicationStatus === 'APPROVED' ? styles.alertSuccess : styles.alertInfo}`}
            >
              <h3>⚠️ Important Update</h3>
              {user.rejectionReason && <p><strong>Reason:</strong> {user.rejectionReason.replace(/_/g, ' ')}</p>}
              <p>{user.reviewComments}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {user?.applicationStatus === 'DOCUMENTS_REQUIRED' && (
          <motion.div variants={itemVariants} className={`${styles.alert} ${styles.alertWarning}`}>
            <h3>📄 Action Required: Document Query</h3>
            <div className={styles.queryDetails}>
              <p>The recruitment team has requested additional or updated documents:</p>
              {user?.requiredDocuments && user.requiredDocuments.length > 0 && (
                <ul className={styles.docList}>
                  {user.requiredDocuments.map(doc => (
                    <li key={doc}><strong>{doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong></li>
                  ))}
                </ul>
              )}
              {user?.documentRequestMessage && (
                <div className={styles.adminMessage}>
                  <strong>Note from Admin:</strong>
                  <p>{user.documentRequestMessage}</p>
                </div>
              )}
              <Link href="/application/documents" className={styles.reuploadLink}>
                Go to Document Upload →
              </Link>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className={styles.progressSection}>
          <h2>Application Progress</h2>
          <div className={styles.stepsContainer}>
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                className={`${styles.step} ${styles[step.status]}`}
                whileHover={{ scale: 1.1 }}
              >
                <div className={styles.stepNumber}>
                  {step.status === 'complete' ? '✓' : step.num}
                </div>
                <span className={styles.stepTitle}>{step.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ApplicantProfileCard />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DashboardStats />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <ApplicationStatus />
        </motion.div>

        <motion.div variants={itemVariants} className={styles.infoCards}>
          <div className={styles.infoCard}>
            <h3>📧 Email</h3>
            <p>{typeof user?.email === 'object' ? JSON.stringify(user?.email) : user?.email}</p>
          </div>
          <div className={styles.infoCard}>
            <h3>📱 Phone</h3>
            <p>{typeof user?.phoneNumber === 'object' ? JSON.stringify(user?.phoneNumber) : user?.phoneNumber}</p>
          </div>
          <div className={styles.infoCard}>
            <h3>📅 Registered</h3>
            <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.quickLinks}>
          <h2>Quick Links</h2>
          <motion.div className={styles.linksGrid} variants={containerVariants}>
            <Link href="/application" className={styles.linkCard}>
              <motion.span whileHover={{ rotate: 10 }} className={styles.linkIcon}>📝</motion.span>
              <span>Edit Application</span>
            </Link>
            <Link href="/application/documents" className={styles.linkCard}>
              <motion.span whileHover={{ rotate: 10 }} className={styles.linkIcon}>📄</motion.span>
              <span>Upload Documents</span>
            </Link>
            <Link href="/requirements" className={styles.linkCard}>
              <motion.span whileHover={{ rotate: 10 }} className={styles.linkIcon}>📋</motion.span>
              <span>Requirements</span>
            </Link>
            <Link href="/faq" className={styles.linkCard}>
              <motion.span whileHover={{ rotate: 10 }} className={styles.linkIcon}>❓</motion.span>
              <span>Help & FAQ</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
