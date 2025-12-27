'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './DashboardStats.module.css';
import StatWidget from './StatWidget';

import { api } from '../../../utils/api';

export default function DashboardStats() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    // Calculate days remaining (Assuming deadline is Jan 31st 2026)
    const deadline = new Date('2026-01-31');
    const today = new Date();
    const diffTime = Math.abs(deadline - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysRemaining(diffDays > 0 ? diffDays : 0);

    // Fetch notification count
    const fetchNotifications = async () => {
      try {
        const data = await api('/api/notifications');
        
        if (data) {
          // Assuming data is array or wrapped in { data: [] }
          const notifications = Array.isArray(data) ? data : (data.data || []);
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

  const getStatusLabel = (status) => {
    if (!status) return 'In Progress';
    if (typeof status === 'object') return JSON.stringify(status);
    return status.replace(/_/g, ' ');
  };

  return (
    <div className={styles.grid}>
      <StatWidget 
        title="Application Status" 
        value={getStatusLabel(user?.applicationStatus)} 
        icon="📝" 
        status={user?.applicationStatus || 'active'}
      />
      <StatWidget 
        title="Days Remaining" 
        value={daysRemaining} 
        icon="⏳" 
        status={daysRemaining < 7 ? 'warning' : 'completed'}
      />
      <StatWidget 
        title="Notifications" 
        value={unreadCount} 
        icon="🔔" 
        status={unreadCount > 0 ? 'active' : 'neutral'}
      />
    </div>
  );
}
