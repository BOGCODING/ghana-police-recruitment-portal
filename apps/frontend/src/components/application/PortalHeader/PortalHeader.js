'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiBell, FiSettings } from 'react-icons/fi';
import { notificationService } from '@/services/notificationService';
import styles from './PortalHeader.module.css';

export default function PortalHeader({ onMenuClick }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await notificationService.getNotifications();
        if (Array.isArray(notifications)) {
          const unread = notifications.filter(n => !n.is_read && !n.read_at).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Simple breadcrumb logic
  const getPageTitle = () => {
    if (pathname.includes('/application')) return 'Recruitment Wizard';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/voucher')) return 'Voucher Validation';
    if (pathname.includes('/notifications')) return 'Notifications';
    if (pathname.includes('/profile')) return 'Account Settings';
    return 'Applicant Portal';
  };

  const handleBellClick = () => {
    router.push('/notifications');
  };

  const handleSettingsClick = () => {
    router.push('/profile');
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.mobileMenuBtn} onClick={onMenuClick}>
          <FiMenu />
        </button>
        <div className={styles.breadcrumb}>
          <span>Applicant Portal</span>
          <span>/</span>
          <span className={styles.active}>{getPageTitle()}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <button 
          className={styles.actionBtn} 
          aria-label="Notifications"
          onClick={handleBellClick}
        >
          <FiBell />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 10 ? '10+' : unreadCount}</span>
          )}
        </button>
        
        <button 
          className={styles.actionBtn} 
          aria-label="Settings"
          onClick={handleSettingsClick}
        >
          <FiSettings />
        </button>
      </div>
    </header>
  );
}

