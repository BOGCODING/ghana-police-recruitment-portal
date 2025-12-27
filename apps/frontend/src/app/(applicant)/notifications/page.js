'use client';
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import NotificationList from '@/components/application/NotificationList/NotificationList';
import styles from './styles.module.css';
import { FiRefreshCw } from 'react-icons/fi';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Notifications</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchNotifications} className={styles.markAllBtn} title="Refresh">
            <FiRefreshCw />
          </button>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllAsRead} className={styles.markAllBtn}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading notifications...</div>
      ) : (
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead} 
        />
      )}
    </div>
  );
}
