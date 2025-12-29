'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { getUserRole, getStatusLabel, getStatusColor, getStatusClass } from '@/utils/roleHelper';
import Image from 'next/image';
import Link from 'next/link';
import { FiEdit2 } from 'react-icons/fi';
import styles from './ApplicantProfileCard.module.css';
import { motion } from 'framer-motion';

export default function ApplicantProfileCard() {
  const { user } = useAuth();
  const { formData } = useApplication();

  const profileImage = user?.profileImage;

  // Get name from multiple sources: user.fullName, formData.personalInfo, or fallback
  const firstName = formData?.personalInfo?.firstName || user?.firstName || '';
  const lastName = formData?.personalInfo?.lastName || user?.lastName || '';
  const displayName = user?.fullName || 
    (firstName && lastName ? `${firstName} ${lastName}` : 
     firstName || lastName || 'New Applicant');

  const role = getUserRole(user?.applicationStatus);
  const statusLabel = getStatusLabel(user?.applicationStatus);
  const statusColor = getStatusColor(user?.applicationStatus);
  const statusClass = getStatusClass(user?.applicationStatus);

  // Get initials for avatar placeholder
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (typeof displayName === 'string' && displayName !== 'New Applicant') {
      return displayName.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <motion.div 
          className={styles.avatar}
          animate={{
            boxShadow: [
              '0 0 0 0px rgba(0, 107, 63, 0.2)',
              '0 0 0 10px rgba(0, 107, 63, 0)',
              '0 0 0 0px rgba(0, 107, 63, 0.2)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={80}
              height={80}
              className={styles.avatarImage}
              unoptimized
            />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {getInitials()}
            </span>
          )}
        </motion.div>
        
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>
              {typeof displayName === 'object' 
                ? JSON.stringify(displayName) 
                : displayName}
            </h3>
            <Link href="/profile" className={styles.editBtn} title="Edit Profile">
              <FiEdit2 size={16} />
            </Link>
          </div>
          
          <div className={styles.badges}>
            <span className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}>
              {role}
            </span>
            <span 
              className={`${styles.statusBadge} ${styles[statusClass]}`}
              style={{ '--status-color': statusColor }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Application ID</span>
          <span className={styles.detailValue}>
            {typeof user?.applicationId === 'object' 
              ? JSON.stringify(user.applicationId) 
              : (user?.applicationId || 'Not Started')}
          </span>
        </div>
        
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Serial Number</span>
          <span className={styles.detailValue}>
            {typeof user?.serialNumber === 'object' 
              ? JSON.stringify(user.serialNumber) 
              : (user?.serialNumber || '—')}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Category</span>
          <span className={styles.detailValue}>
            {(user?.category || formData?.category || formData?.categoryDetails?.category || 'Not Selected')?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Email</span>
          <span className={styles.detailValue}>
            {typeof user?.email === 'object' 
              ? JSON.stringify(user.email) 
              : (user?.email || '—')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
