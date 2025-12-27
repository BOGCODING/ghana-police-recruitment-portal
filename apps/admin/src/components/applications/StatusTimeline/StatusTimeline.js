'use client';
import { FiClock, FiCheck, FiX, FiFileText, FiUser, FiEdit } from 'react-icons/fi';
import styles from './StatusTimeline.module.css';

const actionIcons = {
  APPROVE_APPLICATION: FiCheck,
  REJECT_APPLICATION: FiX,
  SUBMIT_APPLICATION: FiFileText,
  CREATE_APPLICATION: FiEdit,
  VERIFY_DOCUMENT: FiFileText,
  default: FiClock
};

const actionColors = {
  APPROVE_APPLICATION: 'approved',
  REJECT_APPLICATION: 'rejected',
  SUBMIT_APPLICATION: 'submitted',
  CREATE_APPLICATION: 'created',
  VERIFY_DOCUMENT: 'verified',
  default: 'default'
};

const formatAction = (action) => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
};

export default function StatusTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={styles.empty}>
        <FiClock />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {timeline.map((event, index) => {
        const Icon = actionIcons[event.action] || actionIcons.default;
        const colorClass = actionColors[event.action] || actionColors.default;
        const { date, time } = formatDate(event.timestamp || event.createdAt);
        
        let details = {};
        try {
          details = typeof event.details === 'string' ? JSON.parse(event.details) : event.details || {};
        } catch (e) {
          details = {};
        }

        return (
          <div key={index} className={styles.event}>
            <div className={styles.line}>
              <div className={`${styles.dot} ${styles[colorClass]}`}>
                <Icon />
              </div>
              {index < timeline.length - 1 && <div className={styles.connector} />}
            </div>
            
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={`${styles.action} ${styles[colorClass]}`}>
                  {formatAction(event.action)}
                </span>
                <span className={styles.datetime}>
                  {date} at {time}
                </span>
              </div>
              
              <div className={styles.actor}>
                <FiUser />
                <span>{event.actor || 'System'}</span>
              </div>
              
              {(details.comments || details.reason) && (
                <div className={styles.details}>
                  {details.reason && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Reason:</span>
                      <span>{details.reason}</span>
                    </div>
                  )}
                  {details.comments && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Comments:</span>
                      <span>{details.comments}</span>
                    </div>
                  )}
                  {details.bulk && (
                    <span className={styles.bulkBadge}>Bulk Action</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
