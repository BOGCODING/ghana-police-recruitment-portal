'use client';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiMail } from 'react-icons/fi';
import styles from './NotificationList.module.css';

// Safe date formatter that handles various date formats and null values
const formatDate = (dateValue) => {
  if (!dateValue) return 'Recently';
  
  try {
    // Handle string dates (ISO format)
    let date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    
    if (!isValid(date)) {
      return 'Recently';
    }
    
    const relative = formatDistanceToNow(date, { addSuffix: true });
    
    // For precision, also show the actual time
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeFormatter = new Intl.DateTimeFormat('en-GH', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short'
    });
    
    if (isToday) {
      return `${relative} (${timeFormatter.format(date)})`;
    } else {
      return `${relative} (${dateFormatter.format(date)})`;
    }
  } catch {
    return 'Recently';
  }
};

export default function NotificationList({ notifications, onMarkAsRead }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiMail className={styles.emptyIcon} />
        <p>You have no notifications yet.</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <FiCheckCircle />;
      case 'WARNING': return <FiAlertTriangle />;
      default: return <FiInfo />;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'SUCCESS': return styles.success;
      case 'WARNING': return styles.warning;
      default: return styles.info;
    }
  };

  return (
    <div className={styles.list}>
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
        >
          <div className={`${styles.iconWrapper} ${getTypeClass(notif.type)}`}>
            {getIcon(notif.type)}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <h4 className={styles.title}>{notif.title}</h4>
              <span className={styles.date}>
                {formatDate(notif.created_at || notif.createdAt)}
              </span>
            </div>
            <p className={styles.message}>{notif.message}</p>
            {!notif.is_read && (
              <div className={styles.actions}>
                <button 
                  onClick={() => onMarkAsRead(notif.id)} 
                  className={styles.markReadBtn}
                >
                  Mark as read
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

